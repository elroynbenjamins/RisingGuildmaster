import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Chapter 1 cross-difficulty robustness", () => {
  it("keeps the Chieftain viable on Standard with ordinary starter preparation", () => {
    const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
      simulateCombatScenario({
        id: `chapter1-chieftain-starter-${difficultyId}`,
        questId: "goblin_chieftain_boss",
        heroLevel: 2,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId,
        runs: 6,
        seed: 11_100,
        gearProfile: "starter",
        progressionProfile: "base",
      }),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    const [standard, veteran, iron] = results;
    expect(standard!.winRate, "Standard Chieftain should be viable without optional gear grind").toBeGreaterThanOrEqual(.66);
    expect(standard!.winRate).toBeGreaterThanOrEqual(veteran!.winRate);
    expect(veteran!.winRate).toBeGreaterThanOrEqual(iron!.winRate);
    expect(iron!.wipeRate).toBeGreaterThanOrEqual(veteran!.wipeRate);
  }, 180_000);

  it("makes optional early preparation materially improve harder Chieftain attempts", () => {
    const starterVeteran = simulateCombatScenario({
      id: "chapter1-chieftain-veteran-starter",
      questId: "goblin_chieftain_boss",
      heroLevel: 2,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 8,
      seed: 11_200,
      gearProfile: "starter",
      progressionProfile: "base",
    });
    const preparedVeteran = simulateCombatScenario({
      id: "chapter1-chieftain-veteran-prepared",
      questId: "goblin_chieftain_boss",
      heroLevel: 2,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "veteran",
      runs: 8,
      seed: 11_200,
      gearProfile: "optional_progression",
      progressionProfile: "base",
    });

    console.table([starterVeteran, preparedVeteran]);
    expect(starterVeteran.stalled + preparedVeteran.stalled).toBe(0);
    expect(preparedVeteran.winRate, "prepared Veteran Chieftain should remain a real winning route").toBeGreaterThanOrEqual(.50);
    expect(preparedVeteran.winRate).toBeGreaterThanOrEqual(starterVeteran.winRate);
    expect(
      preparedVeteran.averageRemainingHpRatioOnWins > starterVeteran.averageRemainingHpRatioOnWins
        || preparedVeteran.averageFallenHeroesOnWins < starterVeteran.averageFallenHeroesOnWins
        || preparedVeteran.winRate > starterVeteran.winRate,
      "early preparation should produce a measurable survival benefit",
    ).toBe(true);
  }, 180_000);

  it("does not require one exact prepared party shape", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "defensive", classes: ["warrior", "paladin", "cleric", "ranger"] as const },
      { id: "alternate-support", classes: ["paladin", "ranger", "bard", "mage"] as const },
    ] as const;

    const results = parties.map((party, index) =>
      simulateCombatScenario({
        id: `chapter1-chieftain-veteran-${party.id}`,
        questId: "goblin_chieftain_boss",
        heroLevel: 2,
        partyClasses: party.classes,
        difficultyId: "veteran",
        runs: 6,
        seed: 11_300 + index * 100,
        gearProfile: "optional_progression",
        progressionProfile: "base",
      }),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.filter((result) => result.wins > 0).length, "Veteran Chieftain should support multiple sensible party shapes").toBeGreaterThanOrEqual(2);
  }, 180_000);
});
