import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Chapter 6 Greenveil robustness", () => {
  it("keeps representative Chapter 6 fights ordered across difficulties", () => {
    const encounters = [
      { id: "laurel", questId: "laurel_law", heroLevel: 10, seed: 61_100 },
      { id: "roads", questId: "the_five_roads_run", heroLevel: 10, seed: 61_200 },
      { id: "guildhall", questId: "guildhall_under_siege", heroLevel: 11, seed: 61_300 },
      { id: "cassian", questId: "cassian_vane_boss", heroLevel: 11, seed: 61_400 },
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
      expect(standard.wipeRate).toBeLessThanOrEqual(iron.wipeRate);
      if (encounter.id !== "cassian") expect(standard.winRate, `${encounter.id} Standard intended-level viability`).toBeGreaterThanOrEqual(.66);
    }
  }, 300_000);

  it("makes arriving at Laurel Law one level behind visibly dangerous", () => {
    const prepared = simulateCombatScenario({
      id: "chapter6-laurel-prepared",
      questId: "laurel_law",
      heroLevel: 10,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 8,
      seed: 62_100,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    });
    const behind = simulateCombatScenario({
      id: "chapter6-laurel-one-level-behind",
      questId: "laurel_law",
      heroLevel: 9,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 8,
      seed: 62_100,
      gearProfile: "lagged_basic",
      progressionProfile: "base",
    });

    console.table([prepared, behind]);
    expect(prepared.stalled + behind.stalled).toBe(0);
    expect(prepared.winRate).toBeGreaterThanOrEqual(.75);
    expect(prepared.winRate).toBeGreaterThan(behind.winRate);
    expect(behind.wipeRate, "one-level-behind Laurel Law should sometimes wipe").toBeGreaterThan(0);
    expect(
      behind.victoriesWithAnyFallRate >= .5 || behind.averageFallenHeroesOnWins >= .5,
      "surviving underprepared Laurel Law should still cost heroes often",
    ).toBe(true);
  }, 180_000);

  it("keeps prepared Chapter 6 bosses viable while recovery still matters", () => {
    const scenarios = [
      { id: "guildhall", questId: "guildhall_under_siege", level: 11, seed: 63_100 },
      { id: "sixth-voice", questId: "the_sixth_voice", level: 11, seed: 63_200 },
      { id: "cassian", questId: "cassian_vane_boss", level: 11, seed: 63_300 },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      id: `chapter6-prepared-${scenario.id}`,
      questId: scenario.questId,
      heroLevel: scenario.level,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 6,
      seed: scenario.seed,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.every((result) => result.winRate >= 2 / 3)).toBe(true);
    expect(results.filter((result) => result.victoriesWithAnyFallRate >= .5 || result.averageFallenHeroesOnWins >= .5).length)
      .toBeGreaterThanOrEqual(2);
  }, 210_000);

  it("keeps Cassian possible for several sensible prepared compositions", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
      { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
    ] as const;
    const results = parties.map((party, partyIndex) => simulateCombatScenario({
      id: `chapter6-cassian-prepared-${party.id}`,
      questId: "cassian_vane_boss",
      heroLevel: 11,
      partyClasses: party.classes,
      difficultyId: "standard",
      runs: 5,
      seed: 64_100 + partyIndex * 100,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.filter((result) => result.wins > 0).length, "every sensible prepared Cassian composition should have a winning path").toBe(4);
  }, 210_000);
});
