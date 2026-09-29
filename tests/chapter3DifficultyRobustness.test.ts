import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Chapter 3 cross-difficulty robustness", () => {
  it("keeps the Chapter 3 curve ordered with realistic lagged gear", () => {
    const encounters = [
      { id: "frozen-names", questId: "road_of_frozen_names", heroLevel: 5, seed: 31_100 },
      { id: "blue-horns", questId: "night_of_blue_horns", heroLevel: 5, seed: 31_200 },
      { id: "hroth", questId: "hroth_iceblood_boss", heroLevel: 6, seed: 31_300 },
      { id: "vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, seed: 31_400 },
    ] as const;

    const results = encounters.flatMap((encounter) =>
      (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `chapter3-${encounter.id}-${difficultyId}`,
          questId: encounter.questId,
          heroLevel: encounter.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId,
          runs: 3,
          seed: encounter.seed,
          gearProfile: "lagged_basic",
          progressionProfile: encounter.heroLevel >= 6 ? "subclass_ready" : "base",
        }),
      ),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    for (const encounter of encounters) {
      const standard = results.find((result) => result.scenarioId === `chapter3-${encounter.id}-standard`)!;
      const veteran = results.find((result) => result.scenarioId === `chapter3-${encounter.id}-veteran`)!;
      const iron = results.find((result) => result.scenarioId === `chapter3-${encounter.id}-iron_guild`)!;

      expect(standard.winRate, `${encounter.id} Standard should not be harder than Veteran`).toBeGreaterThanOrEqual(veteran.winRate);
      expect(veteran.winRate, `${encounter.id} Veteran should not be easier than Iron`).toBeGreaterThanOrEqual(iron.winRate);
      expect(standard.wipeRate, `${encounter.id} Standard wipe pressure`).toBeLessThanOrEqual(iron.wipeRate);
    }

    const byId = new Map(results.map((result) => [result.scenarioId, result]));
    expect(byId.get("chapter3-frozen-names-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter3-blue-horns-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter3-hroth-standard")!.winRate).toBeGreaterThanOrEqual(.66);
    expect(byId.get("chapter3-vaelith-standard")!.winRate).toBeGreaterThanOrEqual(.66);

    expect(byId.get("chapter3-hroth-iron_guild")!.wipeRate)
      .toBeGreaterThanOrEqual(byId.get("chapter3-hroth-standard")!.wipeRate);
    expect(byId.get("chapter3-vaelith-iron_guild")!.winRate)
      .toBeLessThan(byId.get("chapter3-vaelith-standard")!.winRate);
  }, 240_000);

  it("makes preparation materially matter for Vaelith on Veteran", () => {
    const prepared = simulateCombatScenario({
      id: "chapter3-vaelith-veteran-prepared",
      questId: "vaelith_pale_echo_boss",
      heroLevel: 6,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 6,
      seed: 32_200,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    });
    const underprepared = simulateCombatScenario({
      id: "chapter3-vaelith-veteran-underprepared",
      questId: "vaelith_pale_echo_boss",
      heroLevel: 5,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 6,
      seed: 32_200,
      gearProfile: "lagged_basic",
      progressionProfile: "base",
    });

    console.table([prepared, underprepared]);
    expect(prepared.stalled + underprepared.stalled).toBe(0);
    expect(prepared.winRate, "prepared Veteran Vaelith viability").toBeGreaterThanOrEqual(.66);
    expect(underprepared.wipeRate, "underprepared Veteran Vaelith should sometimes wipe").toBeGreaterThanOrEqual(.16);
    expect(underprepared.victoriesWithAnyFallRate, "underprepared Veteran wins should usually cost heroes").toBeGreaterThanOrEqual(.66);
    expect(prepared.winRate, "preparation should improve the Vaelith outcome").toBeGreaterThan(underprepared.winRate);
    expect(prepared.averageFallenHeroesOnWins, "preparation should reduce casualties").toBeLessThan(underprepared.averageFallenHeroesOnWins);
  }, 180_000);

  it("keeps Iron Vaelith viable for sensible prepared compositions while preserving casualties", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
      { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
    ] as const;

    const results = parties.map((party, partyIndex) =>
      simulateCombatScenario({
        id: `chapter3-vaelith-iron-${party.id}`,
        questId: "vaelith_pale_echo_boss",
        heroLevel: 6,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 6,
        seed: 33_100 + partyIndex * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    const viable = results.filter((result) => result.wins > 0);
    expect(viable.length, "Iron Vaelith should not require one exact party").toBeGreaterThanOrEqual(3);
    expect(
      results.some((result) => result.averageFallenHeroesOnWins >= 1.5),
      "Iron should create heavy casualty pressure in at least one sensible matchup",
    ).toBe(true);
    expect(
      results.some((result) => result.victoriesWithTwoPlusFallsRate >= .50),
      "Iron wins should sometimes cost two or more heroes",
    ).toBe(true);
  }, 240_000);
});
