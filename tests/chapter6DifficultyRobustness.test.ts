import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { testHero } from "./testHero";

describe("Chapter 6 cross-difficulty robustness", () => {
  it("keeps the Greenveil curve ordered across Standard, Veteran, and Iron", () => {
    const encounters = [
      { id: "laurel", questId: "laurel_law", heroLevel: 10, seed: 61_100 },
      { id: "five-roads", questId: "the_five_roads_run", heroLevel: 10, seed: 61_200 },
      { id: "cassian", questId: "cassian_vane_boss", heroLevel: 11, seed: 61_500 },
    ] as const;

    const results = encounters.flatMap((encounter) =>
      (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `chapter6-${encounter.id}-${difficultyId}`,
          questId: encounter.questId,
          heroLevel: encounter.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId,
          runs: 3,
          seed: encounter.seed,
          gearProfile: "lagged_basic",
          progressionProfile: "subclass_ready",
        }),
      ),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    for (const encounter of encounters) {
      const standard = results.find((result) => result.scenarioId === `chapter6-${encounter.id}-standard`)!;
      const veteran = results.find((result) => result.scenarioId === `chapter6-${encounter.id}-veteran`)!;
      const iron = results.find((result) => result.scenarioId === `chapter6-${encounter.id}-iron_guild`)!;
      expect(standard.winRate, `${encounter.id} Standard should not be harder than Veteran`).toBeGreaterThanOrEqual(veteran.winRate);
      expect(veteran.winRate, `${encounter.id} Veteran should not be easier than Iron`).toBeGreaterThanOrEqual(iron.winRate);
      expect(standard.wipeRate, `${encounter.id} Standard wipe pressure`).toBeLessThanOrEqual(iron.wipeRate);
    }

    const byId = new Map(results.map((result) => [result.scenarioId, result]));
    for (const id of ["laurel", "five-roads", "cassian"] as const) {
      expect(byId.get(`chapter6-${id}-standard`)!.winRate, `${id} Standard viability`).toBeGreaterThanOrEqual(.66);
    }
  }, 300_000);

  it("reaches the Level-11 Sixth Voice floor through authored Greenveil content", () => {
    let hero = { ...testHero(), level: 10, xp: 0 };
    for (const questId of ["laurel_law", "the_five_roads_run", "guildhall_under_siege"] as const) {
      hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
    }

    if (hero.level < 11) {
      hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS.the_empty_banner!, 4));
    }
    expect(hero.level, "mainline plus at most one authored Greenveil side quest should reach the Sixth Voice floor").toBeGreaterThanOrEqual(11);
  });

  it("makes preparation materially matter for Laurel Law and Cassian", () => {
    const scenarios = [
      { id: "laurel", questId: "laurel_law", preparedLevel: 10, underpreparedLevel: 9, seed: 62_100 },
      { id: "cassian", questId: "cassian_vane_boss", preparedLevel: 11, underpreparedLevel: 10, seed: 62_200 },
    ] as const;

    const pairs = scenarios.map((scenario) => {
      const prepared = simulateCombatScenario({
        id: `chapter6-${scenario.id}-veteran-prepared`,
        questId: scenario.questId,
        heroLevel: scenario.preparedLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "veteran",
        runs: 6,
        seed: scenario.seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      });
      const underprepared = simulateCombatScenario({
        id: `chapter6-${scenario.id}-veteran-underprepared`,
        questId: scenario.questId,
        heroLevel: scenario.underpreparedLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "veteran",
        runs: 6,
        seed: scenario.seed,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      });
      return { scenario, prepared, underprepared };
    });

    console.table(pairs.flatMap(({ prepared, underprepared }) => [prepared, underprepared]));
    for (const { scenario, prepared, underprepared } of pairs) {
      expect(prepared.stalled + underprepared.stalled).toBe(0);
      expect(prepared.winRate, `${scenario.id} prepared Veteran viability`).toBeGreaterThanOrEqual(.66);
      expect(prepared.winRate, `${scenario.id} preparation should not reduce win rate`).toBeGreaterThanOrEqual(underprepared.winRate);
      expect(
        underprepared.wipeRate > prepared.wipeRate
          || underprepared.averageFallenHeroesOnWins > prepared.averageFallenHeroesOnWins
          || underprepared.averageRemainingHpRatioOnWins < prepared.averageRemainingHpRatioOnWins,
        `${scenario.id} underprepared party should face clearly higher pressure`,
      ).toBe(true);
    }
  }, 300_000);

  it("isolates Cassian honor-guard attrition", () => {
    const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
      simulateCombatScenario({
        id: `chapter6-cassian-guard-${difficultyId}`,
        questId: "cassian_vane_boss",
        heroLevel: 11,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId,
        runs: 6,
        seed: 64_100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
        encounterLimit: 1,
      }),
    );
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 180_000);

  it("keeps prepared Iron Cassian viable across multiple sensible party compositions", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
      { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
    ] as const;

    const results = parties.map((party, index) =>
      simulateCombatScenario({
        id: `chapter6-cassian-iron-${party.id}`,
        questId: "cassian_vane_boss",
        heroLevel: 11,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 5,
        seed: 63_100 + index * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.filter((result) => result.wins > 0).length, "Iron Cassian should not require one exact party").toBeGreaterThanOrEqual(3);
    expect(results.filter((result) => result.winRate >= .60).length, "prepared Iron Cassian parties should usually remain viable").toBeGreaterThanOrEqual(3);
    const averageFallen = results.reduce((sum, result) => sum + result.averageFallenHeroesOnWins, 0) / results.length;
    expect(averageFallen, "Iron Cassian should retain aggregate casualty pressure").toBeGreaterThanOrEqual(.75);
    expect(results.some((result) => result.wipeRate > 0 || result.victoriesWithTwoPlusFallsRate >= .40),
      "Iron Cassian should create at least one genuinely dangerous matchup").toBe(true);
  }, 300_000);
});
