import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const missions = [
  { id: "skyvault", questId: "siege_of_skyvault", preparedLevel: 13, seed: 81_100 },
  { id: "tidewatch", questId: "siege_of_tidewatch", preparedLevel: 15, seed: 82_100 },
  { id: "chain", questId: "chain_beneath_fleet", preparedLevel: 17, seed: 83_100 },
] as const;

describe("Chapter 7-9 non-boss cross-difficulty robustness", () => {
  for (const mission of missions) {
    it(`keeps ${mission.id} prepared difficulty curve ordered`, () => {
      const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `late-nonboss-${mission.id}-${difficultyId}`,
          questId: mission.questId,
          heroLevel: mission.preparedLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId,
          runs: 3,
          seed: mission.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }),
      );

      console.table(results);
      expect(results.every((result) => result.stalled === 0)).toBe(true);

      const [standard, veteran, iron] = results;
      expect(standard!.winRate, `${mission.id} Standard should not be harder than Veteran`).toBeGreaterThanOrEqual(veteran!.winRate);
      expect(veteran!.winRate, `${mission.id} Veteran should not be easier than Iron`).toBeGreaterThanOrEqual(iron!.winRate);
      expect(standard!.winRate, `${mission.id} prepared Standard viability`).toBeGreaterThanOrEqual(2 / 3);
      expect(veteran!.wins, `${mission.id} prepared Veteran should retain a winning path`).toBeGreaterThan(0);
    }, 240_000);
  }

  it("keeps one-level-behind Veteran parties meaningfully worse than prepared parties", () => {
    const results = missions.flatMap((mission) => {
      const prepared = simulateCombatScenario({
        id: `late-nonboss-${mission.id}-veteran-prepared`,
        questId: mission.questId,
        heroLevel: mission.preparedLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "veteran",
        runs: 4,
        seed: mission.seed + 500,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      });
      const behind = simulateCombatScenario({
        id: `late-nonboss-${mission.id}-veteran-behind`,
        questId: mission.questId,
        heroLevel: mission.preparedLevel - 1,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "veteran",
        runs: 4,
        seed: mission.seed + 500,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      });
      return [{ mission, result: prepared }, { mission, result: behind }] as const;
    });

    console.table(results.map(({ result }) => result));
    expect(results.every(({ result }) => result.stalled === 0)).toBe(true);

    for (const mission of missions) {
      const prepared = results.find(({ result }) => result.scenarioId === `late-nonboss-${mission.id}-veteran-prepared`)!.result;
      const behind = results.find(({ result }) => result.scenarioId === `late-nonboss-${mission.id}-veteran-behind`)!.result;

      expect(prepared.winRate, `${mission.id} preparation should not reduce win rate`).toBeGreaterThanOrEqual(behind.winRate);
      expect(
        behind.wipeRate > prepared.wipeRate
          || behind.averageFallenHeroesOnWins > prepared.averageFallenHeroesOnWins
          || behind.averageRemainingHpRatioOnWins < prepared.averageRemainingHpRatioOnWins,
        `${mission.id} one-level-behind party should feel more pressure`,
      ).toBe(true);
    }
  }, 300_000);
});
