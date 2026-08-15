import { describe, expect, it } from "vitest";
import { NPC_PORTRAITS } from "../src/data/characters/npcPortraits";
import { GUILD_OPERATIONS } from "../src/data/operations/guildOperations";
import { createGuild } from "../src/game/guild/guildService";
import { getAvailableGuildOperations, getEligibleOperationHeroIds, isGuildOperationsUnlocked, resolveGuildOperation } from "../src/game/operations/guildOperationService";
import { createGuildOperationState } from "../src/game/operations/guildOperationTypes";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

const sixHeroes = () => Array.from({ length: 6 }, (_, index) => ({ ...testHero(), id: `hero-${index}`, name: `Hero ${index}` }));
const unlockedGuild = () => {
  const guild = createGuild();
  guild.heroes = sixHeroes();
  guild.world.completedCampaignNodeIds = ["broken_wardstone"];
  return guild;
};

describe("Crisis Operations", () => {
  it("unlocks after Chapter 1 and offers only operations in available regions", () => {
    const locked = createGuild();
    expect(isGuildOperationsUnlocked(locked)).toBe(false);
    expect(getAvailableGuildOperations(locked)).toEqual([]);
    const guild = unlockedGuild();
    expect(isGuildOperationsUnlocked(guild)).toBe(true);
    expect(getAvailableGuildOperations(guild).map((operation) => operation.id)).toEqual(["night_of_three_bells"]);
    expect(getEligibleOperationHeroIds(guild)).toHaveLength(6);
  });

  it("resolves six team checks, grants graded rewards, spends a day, and records all heroes", () => {
    const guild = unlockedGuild();
    const result = resolveGuildOperation(guild, "night_of_three_bells", ["hero-0", "hero-1", "hero-2"], ["hero-3", "hero-4", "hero-5"], sequenceRandom(Array(12).fill(.99)));
    expect(result.result).toMatchObject({ rank: "decisive_victory", successes: 6, totalChecks: 6, goldReward: 930, xpRewardPerHero: 390, reputationReward: 8 });
    expect(result.guild.currentDay).toBe(2);
    expect(result.guild.guildOperations).toMatchObject({ completedCount: 1, nextAvailableDay: 5, lastOperationId: "night_of_three_bells" });
    expect(result.guild.heroes.every((hero) => hero.adventureStamina === 75)).toBe(true);
    expect(result.guild.heroes.every((hero) => hero.history.events.some((event) => event.tags?.includes("guild_operation")))).toBe(true);
    expect(result.guild.materials.oak_timber).toBe(7);
  });

  it("uses poor checks as a setback and worsens an active Frostmarch crisis", () => {
    const guild = unlockedGuild();
    guild.world.unlockedRegionIds.push("frostmarch");
    guild.world.worldFlags.frostmarch_aurora_crisis = true;
    guild.world.regionThreat = { frostmarch: 2 };
    const result = resolveGuildOperation(guild, "northern_hearthline", ["hero-0", "hero-1", "hero-2"], ["hero-3", "hero-4", "hero-5"], sequenceRandom(Array(12).fill(0)));
    expect(result.result).toMatchObject({ rank: "setback", successes: 0, threatDelta: 1 });
    expect(result.guild.world.regionThreat?.frostmarch).toBe(3);
  });

  it("rejects duplicate or incomplete teams and persists cooldown state", () => {
    const guild = unlockedGuild();
    expect(() => resolveGuildOperation(guild, "night_of_three_bells", ["hero-0", "hero-1", "hero-2"], ["hero-2", "hero-3", "hero-4"], sequenceRandom([.5]))).toThrow(/both operation teams/);
    expect(() => resolveGuildOperation(guild, "night_of_three_bells", ["hero-0"], ["hero-3"], sequenceRandom([.5]))).toThrow(/exactly three/);
    guild.guildOperations = { completedCount: 4, nextAvailableDay: 12, lastOperationId: "night_of_three_bells" };
    expect(deserializeGuild(serializeGuild(guild)).guildOperations).toEqual(guild.guildOperations);
    const legacy = JSON.parse(serializeGuild(guild)); delete legacy.guildOperations;
    expect(deserializeGuild(JSON.stringify(legacy)).guildOperations).toEqual(createGuildOperationState());
  });

  it("keeps every operation data-driven with three parallel phases", () => {
    for (const operation of Object.values(GUILD_OPERATIONS)) {
      expect(operation.phases).toHaveLength(3);
      expect(operation.phases.every((phase) => phase.vanguard.difficultyClass > 0 && phase.support.difficultyClass > 0)).toBe(true);
      expect(NPC_PORTRAITS[operation.patron.portraitId]).toBeDefined();
    }
  });
});
