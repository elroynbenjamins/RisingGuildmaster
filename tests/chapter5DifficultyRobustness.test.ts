import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Chapter 5 cross-difficulty robustness", () => {
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
    expect(
      results.some((result) => result.victoriesWithAnyFallRate >= .50 || result.wipeRate >= .20),
      "Iron Solkar should preserve meaningful casualty risk",
    ).toBe(true);
  }, 240_000);
});
