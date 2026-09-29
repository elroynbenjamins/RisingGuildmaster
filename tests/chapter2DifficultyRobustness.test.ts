import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Chapter 2 cross-difficulty robustness", () => {
  it("keeps intended-level lagged parties ordered across Standard, Veteran and Iron", () => {
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
          runs: 6,
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
      expect(veteran.winRate, `${encounter.id} Veteran should not be harder than Iron`).toBeGreaterThanOrEqual(iron.winRate);
      expect(standard.averageSurvivingHeroes, `${encounter.id} Standard survivors`).toBeGreaterThanOrEqual(iron.averageSurvivingHeroes);
    }

    const byId = new Map(results.map((result) => [result.scenarioId, result]));
    expect(byId.get("chapter2-broken-carts-standard")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter2-flintwatch-standard")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter2-chainbreaker-standard")!.winRate).toBeGreaterThanOrEqual(.50);
    expect(byId.get("chapter2-hollow-warden-standard")!.winRate).toBeGreaterThanOrEqual(.50);
    expect(byId.get("chapter2-hollow-warden-standard")!.averageSurvivingHeroes).toBeLessThan(3.25);
  }, 300_000);

  it("rewards preparation on Veteran and Iron instead of making Chapter 2 a level wall", () => {
    const encounters = [
      {
        id: "chainbreaker",
        questId: "ghorak_chainbreaker_boss",
        preparedLevel: 4,
        underpreparedLevel: 3,
        seed: 22_100,
      },
      {
        id: "hollow-warden",
        questId: "hollow_warden_boss",
        preparedLevel: 5,
        underpreparedLevel: 4,
        seed: 22_200,
      },
    ] as const;

    const results = encounters.flatMap((encounter) =>
      (["veteran", "iron_guild"] as const).flatMap((difficultyId) => [
        simulateCombatScenario({
          id: `chapter2-${encounter.id}-${difficultyId}-prepared`,
          questId: encounter.questId,
          heroLevel: encounter.preparedLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId,
          runs: 6,
          seed: encounter.seed,
          gearProfile: "optional_progression",
          progressionProfile: encounter.preparedLevel >= 5 ? "subclass_ready" : "base",
        }),
        simulateCombatScenario({
          id: `chapter2-${encounter.id}-${difficultyId}-underprepared`,
          questId: encounter.questId,
          heroLevel: encounter.underpreparedLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId,
          runs: 6,
          seed: encounter.seed,
          gearProfile: "lagged_basic",
          progressionProfile: "base",
        }),
      ]),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    for (const encounter of encounters) {
      for (const difficultyId of ["veteran", "iron_guild"] as const) {
        const prepared = results.find((result) => result.scenarioId === `chapter2-${encounter.id}-${difficultyId}-prepared`)!;
        const underprepared = results.find((result) => result.scenarioId === `chapter2-${encounter.id}-${difficultyId}-underprepared`)!;

        expect(prepared.winRate, `${encounter.id} ${difficultyId} preparation win-rate benefit`).toBeGreaterThanOrEqual(underprepared.winRate);
        expect(prepared.averageSurvivingHeroes, `${encounter.id} ${difficultyId} preparation survivor benefit`).toBeGreaterThanOrEqual(underprepared.averageSurvivingHeroes);
      }
    }

    const preparedVeteran = results.filter((result) => result.scenarioId.includes("-veteran-prepared"));
    expect(preparedVeteran.every((result) => result.wins > 0), "prepared Veteran parties should remain viable").toBe(true);

    const preparedIron = results.filter((result) => result.scenarioId.includes("-iron_guild-prepared"));
    expect(preparedIron.filter((result) => result.wins > 0).length, "prepared Iron should remain possible in Chapter 2").toBeGreaterThanOrEqual(1);

    const underpreparedIron = results.filter((result) => result.scenarioId.includes("-iron_guild-underprepared"));
    expect(underpreparedIron.some((result) => result.wipeRate >= .5), "underprepared Iron should create real wipe pressure").toBe(true);
  }, 300_000);

  it("does not require one exact four-class party to clear the Chapter 2 finale", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "alternate-support", classes: ["paladin", "ranger", "bard", "mage"] as const },
      { id: "heavy-frontline", classes: ["warrior", "berserker", "cleric", "spellbow"] as const },
    ] as const;

    const results = parties.flatMap((party, partyIndex) =>
      (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `chapter2-hollow-${party.id}-${difficultyId}`,
          questId: "hollow_warden_boss",
          heroLevel: 5,
          partyClasses: party.classes,
          difficultyId,
          runs: 4,
          seed: 23_100 + partyIndex * 100,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }),
      ),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    const standard = results.filter((result) => result.scenarioId.endsWith("-standard"));
    const veteran = results.filter((result) => result.scenarioId.endsWith("-veteran"));
    const iron = results.filter((result) => result.scenarioId.endsWith("-iron_guild"));

    expect(standard.every((result) => result.wins > 0), "all sensible prepared parties should clear Standard").toBe(true);
    expect(veteran.filter((result) => result.wins > 0).length, "Veteran should support more than one viable composition").toBeGreaterThanOrEqual(2);
    expect(iron.filter((result) => result.wins > 0).length, "Iron should remain possible with at least one sensible composition").toBeGreaterThanOrEqual(1);

    const ironCasualtyPressure = iron.reduce((sum, result) => sum + result.averageFallenHeroesOnWins, 0) / iron.length;
    expect(ironCasualtyPressure, "Iron prepared-party casualty pressure").toBeGreaterThanOrEqual(.75);
  }, 240_000);
});
