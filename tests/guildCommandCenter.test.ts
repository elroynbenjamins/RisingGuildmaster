import { describe, expect, it } from "vitest";
import { getGuildCommandOrders } from "../src/game/guild/guildCommandCenterService";
import { getGuildPriority } from "../src/game/guild/guildPriorityService";
import { createGuild } from "../src/game/guild/guildService";
import { createHeroContract } from "../src/game/recruitment/contractService";
import { testHero } from "./testHero";

const chapterOneToChieftain = [
  "founding_the_guild",
  "guildhaven_cellar_slimes",
  "rats_beneath_guildhaven",
  "campaign_goblin_patrol",
  "missing_merchant",
  "strange_tracks",
  "attack_on_guildhaven",
];

function roster(levels: number[]) {
  return levels.map((level, index) => ({ ...testHero(), id: `command-${index}`, name: `Hero ${index + 1}`, level }));
}

describe("guild command center orders", () => {
  it("puts unpaid salary and fallen heroes on the urgent command board", () => {
    const guild = createGuild();
    const hero = { ...testHero(), id: "fallen-command", name: "Mira", currentHP: 0 };
    guild.heroes = [hero];
    guild.heroContracts = [createHeroContract(hero, 100, 12, guild.currentDay)];
    guild.finance.salaryArrearsByHeroId[hero.id] = 80;

    const orders = getGuildCommandOrders(guild);

    expect(orders[0]).toMatchObject({ tone: "urgent" });
    expect(orders).toContainEqual(expect.objectContaining({ id: "fallen_heroes", destination: "temple" }));
    expect(orders).toContainEqual(expect.objectContaining({ id: "salary_arrears", destination: "finances" }));
  });

  it("surfaces completed gathering missions as claimable work", () => {
    const guild = createGuild();
    guild.heroes = roster([3, 3]);
    guild.gatheringMissions = [{ id: "gathering-ready", definitionId: "greenveil_foraging", heroIds: [guild.heroes[0]!.id, guild.heroes[1]!.id], startDay: guild.currentDay - 2, completionDay: guild.currentDay, resolutionSeed: 7, status: "active" }];

    expect(getGuildCommandOrders(guild)).toContainEqual(expect.objectContaining({ id: "gathering_ready", tone: "ready", destination: "gathering" }));
  });

  it("routes under-levelled post-Chieftain preparation toward one-time side quests", () => {
    const guild = createGuild();
    guild.heroes = roster([1, 1, 1, 1]);
    guild.world.completedCampaignNodeIds = [...chapterOneToChieftain];
    guild.world.currentSettlementId = "brambleford";
    guild.world.worldFlags.starter_brambleway_road_ambush_complete = true;
    guild.world.worldFlags.starter_brambleford_side_quest_complete = true;
    guild.world.worldFlags.starter_fourth_hero_ready = true;

    expect(getGuildCommandOrders(guild)).toContainEqual(expect.objectContaining({ id: "campaign_level_gap", destination: "sideQuests" }));
    expect(getGuildPriority(guild)).toMatchObject({ id: "prepare_campaign", destination: "sideQuests" });
  });
});
