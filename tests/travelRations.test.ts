import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "../src/config/gameConfig";
import { QUESTS } from "../src/data/quests/quests";
import { createGuild } from "../src/game/guild/guildService";
import { isQuestAvailableAtCurrentLocation } from "../src/game/quests/questAvailability";
import { buyRations, getRegionalTravelDays, getTravelRationCost, getTravelTier, travelGuildToRegion, visitSettlement } from "../src/game/world/travelService";
import { sequenceRandom } from "./combatTestUtils";

describe("world travel supplies", () => {
  it("maps the d100 rarity bands at their exact boundaries", () => {
    expect(getTravelTier(55)).toBeNull();
    expect(getTravelTier(56)).toBe("common");
    expect(getTravelTier(81)).toBe("uncommon");
    expect(getTravelTier(94)).toBe("rare");
    expect(getTravelTier(100)).toBe("legendary");
  });

  it("charges one ration per traveller per day and advances the calendar", () => {
    const guild = createGuild();
    guild.world.unlockedRegionIds.push("shadowfen");
    const result = travelGuildToRegion(guild, "shadowfen", 4, sequenceRandom([0]));
    expect(getRegionalTravelDays("greenveil", "shadowfen")).toBe(2);
    expect(getTravelRationCost(2, 4)).toBe(8);
    expect(result.guild.currentDay).toBe(guild.currentDay + 2);
    expect(result.guild.rations).toBe(guild.rations - 8);
    expect(result.guild.world.currentSettlementId).toBe("blackwater");
  });

  it("rejects a journey without enough provisions", () => {
    const guild = createGuild();
    guild.rations = 1;
    guild.world.unlockedRegionIds.push("iron_hills");
    expect(() => travelGuildToRegion(guild, "iron_hills", 4, sequenceRandom([0]))).toThrow(/rations/i);
  });

  it("charges a day for walking to another settlement and localizes side quests", () => {
    const guild = createGuild();
    const moved = visitSettlement(guild, "brambleford", 3);
    expect(moved.currentDay).toBe(guild.currentDay + 1);
    expect(moved.rations).toBe(guild.rations - 3);
    expect(isQuestAvailableAtCurrentLocation(QUESTS.brambleway_caravan!, moved.world)).toBe(true);
    expect(isQuestAvailableAtCurrentLocation(QUESTS.echoes_of_mosswatch!, moved.world)).toBe(false);
  });

  it("buys a configured ration bundle in a settlement", () => {
    const guild = createGuild();
    const stocked = buyRations(guild);
    expect(stocked.rations).toBe(guild.rations + GAME_CONFIG.rationBundleSize);
    expect(stocked.gold).toBe(guild.gold - GAME_CONFIG.rationBundleGoldCost);
  });
});
