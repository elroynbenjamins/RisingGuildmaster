import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

type LateBoss = {
  id: "varkesh" | "nhal" | "serekh";
  questId: string;
  heroLevel: number;
  seed: number;
};

const bosses: readonly LateBoss[] = [
  { id: "varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 71_100 },
  { id: "nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 72_100 },
  { id: "serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 73_100 },
];

function runDifficultyCurve(boss: LateBoss) {
  return (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
    simulateCombatScenario({
      id: `late-${boss.id}-${difficultyId}`,
      questId: boss.questId,
      heroLevel: boss.heroLevel,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId,
      runs: 3,
      seed: boss.seed,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }),
  );
}

describe("Chapter 7-9 prepared cross-difficulty boss robustness", () => {
  for (const boss of bosses) {
    it(`keeps ${boss.id} difficulty curve ordered`, () => {
      const results = runDifficultyCurve(boss);
      console.table(results);

      expect(results.every((result) => result.stalled === 0)).toBe(true);
      const [standard, veteran, iron] = results;
      expect(standard!.winRate, `${boss.id} Standard should not be harder than Veteran`).toBeGreaterThanOrEqual(veteran!.winRate);
      expect(veteran!.winRate, `${boss.id} Veteran should not be easier than Iron`).toBeGreaterThanOrEqual(iron!.winRate);
      expect(veteran!.winRate, `${boss.id} prepared Veteran viability`).toBeGreaterThanOrEqual(.50);
      expect(iron!.averageSurvivingHeroes, `${boss.id} Iron pressure`).toBeLessThanOrEqual(veteran!.averageSurvivingHeroes);
    }, 240_000);
  }

  it("keeps prepared Iron late bosses possible with sensible tactical parties", () => {
    const scenarios = [
      {
        id: "varkesh-defensive",
        questId: "varkesh_gilded_rupture_boss",
        heroLevel: 13,
        classes: ["warrior", "paladin", "cleric", "mage"] as const,
        seed: 74_100,
      },
      {
        id: "nhal-aggressive",
        questId: "admiral_nhal_veyr_boss",
        heroLevel: 15,
        classes: ["warrior", "berserker", "cleric", "ranger"] as const,
        seed: 74_200,
      },
      {
        id: "serekh-defensive",
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        classes: ["warrior", "paladin", "cleric", "mage"] as const,
        seed: 74_300,
      },
    ] as const;

    const results = scenarios.map((scenario) =>
      simulateCombatScenario({
        id: `late-iron-${scenario.id}`,
        questId: scenario.questId,
        heroLevel: scenario.heroLevel,
        partyClasses: scenario.classes,
        difficultyId: "iron_guild",
        runs: 6,
        seed: scenario.seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    for (const result of results) {
      expect(result.wins, `${result.scenarioId} should remain beatable on Iron`).toBeGreaterThan(0);
      expect(
        result.wipeRate > 0 || result.averageFallenHeroesOnWins >= .5,
        `${result.scenarioId} should remain dangerous on Iron`,
      ).toBe(true);
    }
  }, 360_000);
});
