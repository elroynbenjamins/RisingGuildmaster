import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Chapter 2 cross-difficulty robustness", () => {
  it("keeps the intended Chapter 2 difficulty curve ordered without stalls", () => {
    const encounters = [
      { id: "broken-carts", questId: "road_of_broken_carts", heroLevel: 3, seed: 21_100 },
      { id: "flintwatch", questId: "fires_of_flintwatch", heroLevel: 4, seed: 21_200 },
      { id: "chainbreaker", questId: "ghorak_chainbreaker_boss", heroLevel: 4, seed: 21_300 },
      { id: "hollow-warden", questId: "hollow_warden_boss", heroLevel: 5, seed: 21_400 },
    ] as const;

    const results = encounters.flatMap((encounter) =>
      (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `chapter2-${encounter.id}-${difficultyId}`,
          questId: encounter.questId,
          heroLevel: encounter.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId,
          runs: 4,
          seed: encounter.seed,
          gearProfile: "lagged_basic",
          progressionProfile: encounter.heroLevel >= 5 ? "subclass_ready" : "base",
        }),
      ),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    for (const encounter of encounters) {
      const standard = results.find((result) => result.scenarioId === `chapter2-${encounter.id}-standard`)!;
      const veteran = results.find((result) => result.scenarioId === `chapter2-${encounter.id}-veteran`)!;
      const iron = results.find((result) => result.scenarioId === `chapter2-${encounter.id}-iron_guild`)!;

      expect(standard.winRate, `${encounter.id} Standard should not be harder than Veteran`).toBeGreaterThanOrEqual(veteran.winRate);
      expect(veteran.winRate, `${encounter.id} Veteran should not be easier than Iron`).toBeGreaterThanOrEqual(iron.winRate);
      expect(standard.averageSurvivingHeroes, `${encounter.id} Standard survivors`).toBeGreaterThanOrEqual(iron.averageSurvivingHeroes);
    }

    const byId = new Map(results.map((result) => [result.scenarioId, result]));
    expect(byId.get("chapter2-broken-carts-standard")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter2-flintwatch-standard")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter2-chainbreaker-standard")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter2-hollow-warden-standard")!.winRate).toBeGreaterThanOrEqual(.50);

    expect(byId.get("chapter2-flintwatch-iron_guild")!.averageFallenHeroesOnWins)
      .toBeGreaterThanOrEqual(byId.get("chapter2-flintwatch-standard")!.averageFallenHeroesOnWins);
    expect(byId.get("chapter2-chainbreaker-iron_guild")!.averageFallenHeroesOnWins)
      .toBeGreaterThanOrEqual(byId.get("chapter2-chainbreaker-standard")!.averageFallenHeroesOnWins);
    expect(byId.get("chapter2-hollow-warden-iron_guild")!.winRate)
      .toBeLessThan(byId.get("chapter2-hollow-warden-standard")!.winRate);
  }, 240_000);

  it("makes preparation materially matter for Hollow Warden on Veteran", () => {
    const prepared = simulateCombatScenario({
      id: "chapter2-hollow-veteran-prepared",
      questId: "hollow_warden_boss",
      heroLevel: 5,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 10,
      seed: 22_200,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    });
    const underprepared = simulateCombatScenario({
      id: "chapter2-hollow-veteran-underprepared",
      questId: "hollow_warden_boss",
      heroLevel: 4,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 10,
      seed: 22_200,
      gearProfile: "lagged_basic",
      progressionProfile: "base",
    });

    console.table([prepared, underprepared]);
    expect(prepared.stalled + underprepared.stalled).toBe(0);
    expect(prepared.winRate, "prepared Veteran Hollow Warden viability").toBeGreaterThanOrEqual(.50);
    expect(underprepared.wipeRate, "underprepared Veteran Hollow Warden wipe pressure").toBeGreaterThanOrEqual(.50);
    expect(prepared.winRate, "preparation should improve the Hollow Warden outcome").toBeGreaterThan(underprepared.winRate);
  }, 180_000);

  it("keeps Iron Hollow Warden possible for more than one sensible prepared composition", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
      { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
    ] as const;

    const results = parties.map((party, partyIndex) =>
      simulateCombatScenario({
        id: `chapter2-hollow-iron-${party.id}`,
        questId: "hollow_warden_boss",
        heroLevel: 5,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 10,
        seed: 23_100 + partyIndex * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    const viable = results.filter((result) => result.wins > 0);
    expect(viable.length, "Iron Hollow Warden should not require one exact party").toBeGreaterThanOrEqual(2);
    expect(results.some((result) => result.wipeRate >= .50), "Iron should still punish weak matchups").toBe(true);
  }, 300_000);
});
