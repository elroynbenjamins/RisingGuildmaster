import { describe, expect, it } from "vitest";
import { dailyTavernIncome } from "../src/game/economy/guildCalendarService";
import { startGatheringMission } from "../src/game/gathering/gatheringService";
import { createGuild } from "../src/game/guild/guildService";
import type { GuildmasterSkillId } from "../src/game/guildmaster/guildmasterTypes";
import { buyRations, getTravelRationCost } from "../src/game/world/travelService";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

function withSkills(...ids: GuildmasterSkillId[]) {
  const guild = createGuild();
  guild.guildmaster = { level: 8, xp: 0, skillPoints: 0, unlockedSkillIds: ids };
  return guild;
}

describe("Guildmaster logistics branch", () => {
  it("reduces travel ration consumption by 25%, rounded up", () => {
    expect(getTravelRationCost(3, 4)).toBe(12);
    expect(getTravelRationCost(3, 4, withSkills("careful_rationing").guildmaster)).toBe(9);
    expect(getTravelRationCost(1, 1, withSkills("careful_rationing").guildmaster)).toBe(1);
  });

  it("increases tavern income and ration bundle value", () => {
    const base = createGuild();
    expect(dailyTavernIncome(withSkills("tavern_stewardship"))).toBe(Math.round(dailyTavernIncome(base) * 1.2));
    const supplied = withSkills("quartermaster_network");
    supplied.world.currentSettlementId = "guildhaven";
    const bought = buyRations(supplied);
    expect(bought.rations - supplied.rations).toBe(12);
  });

  it("shortens newly started material expeditions by one day", () => {
    const guild = withSkills("expedition_routes");
    guild.heroes = [{ ...testHero(), id: "route-a" }, { ...testHero(), id: "route-b" }];
    const started = startGatheringMission(guild, "greenveil_foraging", ["route-a", "route-b"], sequenceRandom([0, 0]));
    expect(started.gatheringMissions[0]?.completionDay).toBe(guild.currentDay + 1);
  });
});
