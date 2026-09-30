import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const missions = [
  { id: "skyvault", questId: "siege_of_skyvault", heroLevel: 13, seed: 81_100 },
  { id: "tidewatch", questId: "siege_of_tidewatch", heroLevel: 15, seed: 82_100 },
  { id: "chain", questId: "chain_beneath_fleet", heroLevel: 17, seed: 83_100 },
] as const;

describe("Chapter 7-9 prepared non-boss cross-difficulty robustness", () => {
  for (const mission of missions) {
    it(`measures ${mission.id} across Standard, Veteran, and Iron`, () => {
      const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `late-mid-${mission.id}-${difficultyId}`,
          questId: mission.questId,
          heroLevel: mission.heroLevel,
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
      expect(standard!.winRate, `${mission.id} Standard ordering`).toBeGreaterThanOrEqual(veteran!.winRate);
      expect(veteran!.winRate, `${mission.id} Veteran ordering`).toBeGreaterThanOrEqual(iron!.winRate);
      expect(standard!.winRate, `${mission.id} prepared Standard viability`).toBeGreaterThanOrEqual(2 / 3);
      expect(veteran!.wins, `${mission.id} prepared Veteran should remain possible`).toBeGreaterThan(0);
    }, 240_000);
  }

  it("keeps prepared Veteran Skyvault and Tidewatch viable while one-level-behind parties wipe", () => {
    const veteranMissions = missions.filter((mission) => mission.id !== "chain");
    const results = veteranMissions.flatMap((mission, index) => {
      const prepared = simulateCombatScenario({
        id: `late-mid-${mission.id}-veteran-prepared`,
        questId: mission.questId,
        heroLevel: mission.heroLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "veteran",
        runs: 6,
        seed: 84_100 + index * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      });
      const behind = simulateCombatScenario({
        id: `late-mid-${mission.id}-veteran-behind`,
        questId: mission.questId,
        heroLevel: mission.heroLevel - 1,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "veteran",
        runs: 6,
        seed: 84_100 + index * 100,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      });
      return [prepared, behind];
    });

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    for (const mission of veteranMissions) {
      const prepared = results.find((result) => result.scenarioId === `late-mid-${mission.id}-veteran-prepared`)!;
      const behind = results.find((result) => result.scenarioId === `late-mid-${mission.id}-veteran-behind`)!;
      expect(prepared.winRate, `${mission.id} prepared Veteran viability`).toBeGreaterThanOrEqual(.50);
      expect(prepared.winRate, `${mission.id} preparation should improve the outcome`).toBeGreaterThan(behind.winRate);
      expect(behind.wipeRate, `${mission.id} underprepared wipe pressure`).toBeGreaterThanOrEqual(.66);
    }
  }, 360_000);
});
