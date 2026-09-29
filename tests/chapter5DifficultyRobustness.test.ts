import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { testHero } from "./testHero";

describe("Chapter 5 Ashlands robustness", () => {
  it("keeps the Chapter 5 difficulty curve ordered with realistic lagged gear", () => {
    const encounters = [
      { id: "road", questId: "road_of_glass", heroLevel: 8, seed: 51_100 },
      { id: "siege", questId: "siege_of_emberfall", heroLevel: 8, seed: 51_200 },
      { id: "keeper", questId: "keeper_of_cinders_boss", heroLevel: 8, seed: 51_300 },
      { id: "causeway", questId: "the_burning_causeway", heroLevel: 9, seed: 51_400 },
      { id: "solkar", questId: "solkar_ash_herald_boss", heroLevel: 9, seed: 51_500 },
    ] as const;

    const results = encounters.flatMap((encounter) =>
      (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `chapter5-${encounter.id}-${difficultyId}`,
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
      const standard = results.find((result) => result.scenarioId === `chapter5-${encounter.id}-standard`)!;
      const veteran = results.find((result) => result.scenarioId === `chapter5-${encounter.id}-veteran`)!;
      const iron = results.find((result) => result.scenarioId === `chapter5-${encounter.id}-iron_guild`)!;
      expect(standard.winRate, `${encounter.id} Standard should not be harder than Veteran`).toBeGreaterThanOrEqual(veteran.winRate);
      expect(veteran.winRate, `${encounter.id} Veteran should not be easier than Iron`).toBeGreaterThanOrEqual(iron.winRate);
      expect(standard.wipeRate, `${encounter.id} Standard wipe pressure`).toBeLessThanOrEqual(iron.wipeRate);
      expect(standard.winRate, `${encounter.id} Standard intended-level viability`).toBeGreaterThanOrEqual(.66);
    }
  }, 300_000);

  it("preserves the Road of Glass preparation gap", () => {
    const prepared = simulateCombatScenario({
      id: "chapter5-road-prepared",
      questId: "road_of_glass",
      heroLevel: 8,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 6,
      seed: 52_100,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    });
    const behind = simulateCombatScenario({
      id: "chapter5-road-one-level-behind",
      questId: "road_of_glass",
      heroLevel: 7,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 6,
      seed: 52_100,
      gearProfile: "lagged_basic",
      progressionProfile: "base",
    });

    console.table([prepared, behind]);
    expect(prepared.stalled + behind.stalled).toBe(0);
    expect(prepared.winRate).toBeGreaterThanOrEqual(.66);
    expect(prepared.winRate).toBeGreaterThan(behind.winRate);
    expect(behind.wipeRate).toBeGreaterThanOrEqual(prepared.wipeRate);
  }, 180_000);

  it("reaches the Level-9 Causeway floor through authored Ashlands content without repeat grinding", () => {
    let hero = { ...testHero(), level: 8, xp: 0 };
    for (const questId of ["road_of_glass", "siege_of_emberfall", "keeper_of_cinders_boss"] as const) {
      hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
    }

    expect(hero.level, "mainline should leave the roster close to Level 9").toBe(8);
    expect(hero.xp).toBeGreaterThan(9_000);

    hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS.the_children_of_cinder!, 4));
    expect(hero.level, "one authored Ashlands side quest should reach the Burning Causeway floor").toBeGreaterThanOrEqual(9);
  });

  it("keeps prepared late-Chapter-5 wins costly instead of turning the finale into easy mode", () => {
    const scenarios = [
      { id: "siege", questId: "siege_of_emberfall", heroLevel: 8, seed: 53_100 },
      { id: "keeper", questId: "keeper_of_cinders_boss", heroLevel: 8, seed: 53_200 },
      { id: "causeway", questId: "the_burning_causeway", heroLevel: 9, seed: 53_300 },
      { id: "solkar", questId: "solkar_ash_herald_boss", heroLevel: 9, seed: 53_400 },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      id: `chapter5-prepared-${scenario.id}`,
      questId: scenario.questId,
      heroLevel: scenario.heroLevel,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 6,
      seed: scenario.seed,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.every((result) => result.winRate >= .66), "prepared Standard parties should usually clear").toBe(true);

    const pressured = results.filter((result) =>
      result.averageFallenHeroesOnWins >= .5 || result.victoriesWithAnyFallRate >= .5
    );
    expect(pressured.length, "most major Chapter 5 fights should make recovery systems relevant").toBeGreaterThanOrEqual(3);
    expect(
      results.find((result) => result.scenarioId === "chapter5-prepared-causeway")!.victoriesWithAnyFallRate,
      "Burning Causeway should not be routinely casualty-free",
    ).toBeGreaterThanOrEqual(.33);
    expect(
      results.find((result) => result.scenarioId === "chapter5-prepared-solkar")!.victoriesWithAnyFallRate,
      "Solkar should not be routinely casualty-free",
    ).toBeGreaterThanOrEqual(.33);
  }, 240_000);

  it("keeps Solkar viable for several sensible prepared compositions while preserving pressure", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
      { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
    ] as const;

    const results = parties.map((party, partyIndex) => simulateCombatScenario({
      id: `chapter5-solkar-prepared-${party.id}`,
      questId: "solkar_ash_herald_boss",
      heroLevel: 9,
      partyClasses: party.classes,
      difficultyId: "standard",
      runs: 5,
      seed: 54_100 + partyIndex * 100,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.every((result) => result.wins > 0), "Solkar should not require one exact prepared composition").toBe(true);
    expect(results.filter((result) => result.victoriesWithAnyFallRate >= .4).length)
      .toBeGreaterThanOrEqual(2);
  }, 210_000);
});
