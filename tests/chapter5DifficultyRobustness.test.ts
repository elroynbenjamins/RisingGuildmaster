import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { testHero } from "./testHero";

// Deterministic seed coverage stays intentionally small here because the full suite already carries broader Standard baselines.\ndescribe("Chapter 5 cross-difficulty robustness", () => {
  it("keeps the Ashlands curve ordered across Standard, Veteran, and Iron", () => {
    const encounters = [
      { id: "road", questId: "road_of_glass", heroLevel: 8, seed: 51_100 },
      { id: "siege", questId: "siege_of_emberfall", heroLevel: 8, seed: 51_200 },
      { id: "keeper", questId: "keeper_of_cinders_boss", heroLevel: 9, seed: 51_300 },
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
    }

    const byId = new Map(results.map((result) => [result.scenarioId, result]));
    expect(byId.get("chapter5-road-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter5-siege-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter5-keeper-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter5-causeway-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter5-solkar-standard")!.winRate).toBeGreaterThanOrEqual(.66);
  }, 300_000);

  it("reaches the Level-9 Burning Causeway floor through authored Ashlands content", () => {
    let hero = { ...testHero(), level: 8, xp: 0 };

    for (const questId of ["road_of_glass", "siege_of_emberfall", "keeper_of_cinders_boss"] as const) {
      hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
    }

    expect(hero.level, "mainline should leave a fresh Level-8 core close to Level 9").toBe(8);
    expect(hero.xp).toBeGreaterThan(8_500);

    hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS.the_children_of_cinder!, 4));
    expect(hero.level, "one authored Ashlands side quest should reach the Burning Causeway floor").toBeGreaterThanOrEqual(9);
  });

  it("makes preparation materially matter for Road of Glass and Solkar", () => {
    const scenarios = [
      {
        id: "road",
        questId: "road_of_glass",
        preparedLevel: 8,
        underpreparedLevel: 7,
        seed: 52_100,
      },
      {
        id: "solkar",
        questId: "solkar_ash_herald_boss",
        preparedLevel: 9,
        underpreparedLevel: 8,
        seed: 52_200,
      },
    ] as const;

    for (const scenario of scenarios) {
      const prepared = simulateCombatScenario({
        id: `chapter5-${scenario.id}-veteran-prepared`,
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
        id: `chapter5-${scenario.id}-veteran-underprepared`,
        questId: scenario.questId,
        heroLevel: scenario.underpreparedLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "veteran",
        runs: 6,
        seed: scenario.seed,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      });

      console.table([prepared, underprepared]);
      expect(prepared.stalled + underprepared.stalled).toBe(0);
      expect(prepared.winRate, `${scenario.id} prepared Veteran viability`).toBeGreaterThanOrEqual(.66);
      expect(prepared.winRate, `${scenario.id} preparation should improve win rate`).toBeGreaterThan(underprepared.winRate);
      expect(
        underprepared.wipeRate > 0 || underprepared.averageFallenHeroesOnWins > prepared.averageFallenHeroesOnWins,
        `${scenario.id} underprepared party should face clearly higher casualty pressure`,
      ).toBe(true);
    }
  }, 240_000);

  it("keeps prepared Iron Solkar viable across multiple sensible party compositions", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
      { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
    ] as const;

    const results = parties.map((party, index) =>
      simulateCombatScenario({
        id: `chapter5-solkar-iron-${party.id}`,
        questId: "solkar_ash_herald_boss",
        heroLevel: 9,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 5,
        seed: 53_100 + index * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.filter((result) => result.wins > 0).length, "Iron Solkar should not require one exact party").toBeGreaterThanOrEqual(3);
    expect(results.filter((result) => result.winRate >= .60).length, "prepared Iron parties should usually remain viable").toBeGreaterThanOrEqual(3);
    const averageFallen = results.reduce((sum, result) => sum + result.averageFallenHeroesOnWins, 0) / results.length;
    expect(averageFallen, "Iron Solkar should retain aggregate casualty pressure").toBeGreaterThanOrEqual(.75);
    expect(results.some((result) => result.wipeRate > 0 || result.victoriesWithTwoPlusFallsRate >= .40),
      "Iron Solkar should create at least one genuinely dangerous matchup").toBe(true);
  }, 240_000);
});
