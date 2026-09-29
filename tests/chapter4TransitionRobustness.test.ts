import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Chapter 3 to 4 transition robustness", () => {
  it("keeps Shadowfen opening pressure readable across difficulties", () => {
    const encounters = [
      { id: "blackwater", questId: "return_to_blackwater", heroLevel: 6, seed: 41_100 },
      { id: "procession", questId: "procession_at_low_water", heroLevel: 6, seed: 41_200 },
      { id: "bell-widow", questId: "bell_widow_boss", heroLevel: 7, seed: 41_300 },
      { id: "morrowveil", questId: "morrowveil_drowned_archivist_boss", heroLevel: 7, seed: 41_400 },
    ] as const;

    const results = encounters.flatMap((encounter) =>
      (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `chapter4-${encounter.id}-${difficultyId}`,
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
      const standard = results.find((result) => result.scenarioId === `chapter4-${encounter.id}-standard`)!;
      const veteran = results.find((result) => result.scenarioId === `chapter4-${encounter.id}-veteran`)!;
      const iron = results.find((result) => result.scenarioId === `chapter4-${encounter.id}-iron_guild`)!;

      expect(standard.winRate, `${encounter.id} Standard should not be harder than Veteran`).toBeGreaterThanOrEqual(veteran.winRate);
      expect(veteran.winRate, `${encounter.id} Veteran should not be easier than Iron`).toBeGreaterThanOrEqual(iron.winRate);
      expect(standard.wipeRate, `${encounter.id} Standard wipe pressure`).toBeLessThanOrEqual(iron.wipeRate);
    }

    const byId = new Map(results.map((result) => [result.scenarioId, result]));
    expect(byId.get("chapter4-blackwater-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter4-procession-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter4-bell-widow-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter4-morrowveil-standard")!.winRate).toBeGreaterThanOrEqual(.66);
  }, 240_000);

  it("punishes entering Shadowfen one level behind without making recovery hopeless", () => {
    const prepared = simulateCombatScenario({
      id: "chapter4-blackwater-prepared",
      questId: "return_to_blackwater",
      heroLevel: 6,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 6,
      seed: 42_100,
      gearProfile: "lagged_basic",
      progressionProfile: "subclass_ready",
    });
    const behind = simulateCombatScenario({
      id: "chapter4-blackwater-one-level-behind",
      questId: "return_to_blackwater",
      heroLevel: 5,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 6,
      seed: 42_100,
      gearProfile: "lagged_basic",
      progressionProfile: "base",
    });

    console.table([prepared, behind]);
    expect(prepared.stalled + behind.stalled).toBe(0);
    expect(prepared.winRate).toBeGreaterThanOrEqual(.66);
    expect(prepared.winRate).toBeGreaterThan(behind.winRate);
    expect(
      behind.wipeRate > 0 || behind.averageFallenHeroesOnWins > prepared.averageFallenHeroesOnWins,
      "arriving one level behind should create visible recovery pressure",
    ).toBe(true);
  }, 150_000);

  it("keeps multiple prepared compositions viable against Morrowveil while Iron remains costly", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
      { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
    ] as const;

    const results = parties.map((party, partyIndex) =>
      simulateCombatScenario({
        id: `chapter4-morrowveil-iron-${party.id}`,
        questId: "morrowveil_drowned_archivist_boss",
        heroLevel: 7,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 5,
        seed: 43_100 + partyIndex * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.filter((result) => result.wins > 0).length).toBeGreaterThanOrEqual(3);
    expect(
      results.some((result) => result.victoriesWithAnyFallRate >= .50 || result.wipeRate >= .20),
      "Iron Morrowveil should still impose meaningful casualty risk",
    ).toBe(true);
  }, 210_000);
});
