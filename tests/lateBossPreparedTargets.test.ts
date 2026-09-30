import { describe, expect, it } from "vitest";
import {
  PREPARED_BALANCE_WIN_RATE_TARGETS,
  PREPARED_BALANCE_WIN_RATE_TOLERANCE,
} from "../src/config/balanceTargets";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const bosses = [
  { id: "varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 91_100 },
  { id: "nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 92_100 },
  { id: "serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 93_100 },
] as const;

const preparedParty = {
  partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
  skillPathIndices: [1, 0, 0, 0] as const,
  gearProfile: "prepared_minus_two" as const,
  progressionProfile: "subclass_ready" as const,
  tacticsProfile: "skilled" as const,
};

// Target calibration rerun after difficulty-specific encounter tuning.
describe("Chapter 7-9 boss prepared-party target bands", () => {
  for (const boss of bosses) {
    it(`keeps ${boss.id} near the 85/75/60 prepared targets`, () => {
      const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `late-boss-target-${boss.id}-${difficultyId}`,
          questId: boss.questId,
          heroLevel: boss.heroLevel,
          ...preparedParty,
          difficultyId,
          runs: 10,
          seed: boss.seed,
        }),
      );

      console.table(results);
      expect(results.every((result) => result.stalled === 0)).toBe(true);

      const [standard, veteran, iron] = results;
      expect(standard!.winRate).toBeGreaterThanOrEqual(veteran!.winRate);
      expect(veteran!.winRate).toBeGreaterThanOrEqual(iron!.winRate);

      for (const result of results) {
        const difficultyId = result.scenarioId.endsWith("-standard")
          ? "standard"
          : result.scenarioId.endsWith("-veteran")
            ? "veteran"
            : "iron_guild";
        const target = PREPARED_BALANCE_WIN_RATE_TARGETS[difficultyId];
        expect(
          Math.abs(result.winRate - target),
          `${boss.id} ${difficultyId} should stay close to prepared target ${target}`,
        ).toBeLessThanOrEqual(PREPARED_BALANCE_WIN_RATE_TOLERANCE + 0.0001);
      }
    }, 600_000);
  }
});
