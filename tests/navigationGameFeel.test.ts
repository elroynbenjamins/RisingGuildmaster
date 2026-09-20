import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { guildActionNotifications } from "../src/ui/actionNotifications";
import { getGuildActivities } from "../src/ui/guildActivityPresentation";
import { testHero } from "./testHero";

const chieftainProgress = [
  "founding_the_guild",
  "guildhaven_cellar_slimes",
  "rats_beneath_guildhaven",
  "campaign_goblin_patrol",
  "missing_merchant",
  "strange_tracks",
  "attack_on_guildhaven",
];

describe("game-like navigation notifications", () => {
  it("routes action categories to the tab where the player can deal with them", () => {
    const guild = createGuild();
    guild.dailyLogin.lastClaimDate = "2026-09-11";
    guild.world.regionThreat = { ...(guild.world.regionThreat ?? {}), greenveil: 3 };
    guild.gatheringMissions = [{ id: "ready", definitionId: "greenveil_foraging", heroIds: ["a", "b"], startDay: 1, completionDay: guild.currentDay, resolutionSeed: 4, status: "active" }];
    guild.heroes = [{ ...testHero(), id: "skill-ready", level: 2 }];

    const notices = guildActionNotifications(guild, new Date(2026, 8, 12, 8));
    expect(notices.tabs.Guild).toMatchObject({ tone: "ready" });
    expect(notices.tabs.World).toMatchObject({ tone: "urgent" });
    expect(notices.tabs.Inventory).toMatchObject({ tone: "ready" });
    expect(notices.tabs.Heroes).toMatchObject({ tone: "ready" });
    expect(notices.total).toBeGreaterThanOrEqual(4);
    expect(notices.urgent).toBeGreaterThanOrEqual(1);
  });

  it("opens Side Quests contextually when campaign readiness is the quest warning", () => {
    const guild = createGuild();
    guild.heroes = [1, 1, 1, 1].map((level, index) => ({ ...testHero(), id: `nav-${index}`, name: `Nav ${index}`, level }));
    guild.world.completedCampaignNodeIds = [...chieftainProgress];
    guild.world.currentSettlementId = "brambleford";
    guild.world.worldFlags.starter_brambleway_road_ambush_complete = true;
    guild.world.worldFlags.starter_brambleford_side_quest_complete = true;
    guild.world.worldFlags.starter_fourth_hero_ready = true;
    const questNotice = guildActionNotifications(guild, new Date(2026, 8, 12, 8)).tabs.Quests;
    expect(questNotice).toMatchObject({ tone: "warning", preferredQuestTab: "Side Quests" });
  });
});

describe("active guild order strip", () => {
  it("shows work in progress separately from things that need attention", () => {
    const guild = createGuild();
    guild.trainingGround.sessions = [{ id: "train", heroId: "h1", programId: "sparring_drills", startDay: guild.currentDay, completionDay: guild.currentDay + 2, goldCost: 10, xpReward: 20, growthReward: 1 }];
    guild.gatheringMissions = [{ id: "field", definitionId: "greenveil_foraging", heroIds: ["h1", "h2"], startDay: guild.currentDay - 2, completionDay: guild.currentDay, resolutionSeed: 5, status: "active" }];
    guild.recruitment.regionalScoutMission = { id: "scout", raceId: "human", classId: null, regionId: "greenveil", locationName: "Brambleford", startDay: guild.currentDay, completionDay: guild.currentDay + 1, resolutionSeed: 9 };

    const activities = getGuildActivities(guild);
    expect(activities.map((item) => item.id)).toEqual(expect.arrayContaining(["training", "gathering", "scout"]));
    expect(activities.find((item) => item.id === "gathering")).toMatchObject({ tone: "ready", detail: "1 READY", destination: "gathering" });
    expect(activities.find((item) => item.id === "training")).toMatchObject({ detail: "2D", destination: "training" });
  });
});
