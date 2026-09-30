import { describe, expect, it } from "vitest";
import {
  PREPARED_BALANCE_WIN_RATE_TARGETS,
  PREPARED_BALANCE_WIN_RATE_TOLERANCE,
} from "../src/config/balanceTargets";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { createSimulationParty, simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const missions = [
  { id: "skyvault", questId: "siege_of_skyvault", preparedLevel: 13, seed: 81_100 },
  { id: "tidewatch", questId: "siege_of_tidewatch", preparedLevel: 15, seed: 82_100 },
  { id: "chain", questId: "chain_beneath_fleet", preparedLevel: 17, seed: 83_100 },
] as const;

const preparedParty = {
  partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
  // Bulwark / Marksman / Lifebringer / Elementalist: durable frontline,
  // focused ranged damage, strong recovery, and dependable area pressure.
  skillPathIndices: [1, 0, 0, 0] as const,
  gearProfile: "prepared_minus_two" as const,
  progressionProfile: "subclass_ready" as const,
};

describe("Chapter 7-9 non-boss cross-difficulty robustness", () => {
  it("keeps the prepared benchmark gear close to two levels behind", () => {
    const party = createSimulationParty(
      preparedParty.partyClasses,
      15,
      80_500,
      preparedParty.gearProfile,
      preparedParty.progressionProfile,
      preparedParty.skillPathIndices,
    );
    const slots = ["weapon", "armor", "helmet", "boots", "accessory1", "accessory2"] as const;
    const lags = party.flatMap((hero) =>
      slots.flatMap((slot) => {
        const itemId = hero.equipment[slot];
        const item = itemId ? EQUIPMENT[itemId] : undefined;
        return item ? [hero.level - item.levelRequirement] : [];
      }),
    );

    expect(lags.length).toBe(party.length * slots.length);
    expect(Math.min(...lags)).toBeGreaterThanOrEqual(2);
    const averageLag = lags.reduce((sum, lag) => sum + lag, 0) / lags.length;
    expect(averageLag).toBeGreaterThanOrEqual(2);
    expect(averageLag).toBeLessThanOrEqual(2.5);
  });

  for (const mission of missions) {
    it(`keeps ${mission.id} prepared win rates near the 85/75/60 targets`, () => {
      const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `late-nonboss-${mission.id}-${difficultyId}`,
          questId: mission.questId,
          heroLevel: mission.preparedLevel,
          ...preparedParty,
          difficultyId,
          runs: 10,
          seed: mission.seed,
        }),
      );

      console.table(results);
      expect(results.every((result) => result.stalled === 0)).toBe(true);

      const [standard, veteran, iron] = results;
      expect(standard!.winRate, `${mission.id} Standard should not be harder than Veteran`).toBeGreaterThanOrEqual(veteran!.winRate);
      expect(veteran!.winRate, `${mission.id} Veteran should not be easier than Iron`).toBeGreaterThanOrEqual(iron!.winRate);

      for (const result of results) {
        const difficultyId = result.scenarioId.endsWith("-standard")
          ? "standard"
          : result.scenarioId.endsWith("-veteran")
            ? "veteran"
            : "iron_guild";
        const target = PREPARED_BALANCE_WIN_RATE_TARGETS[difficultyId];
        expect(
          Math.abs(result.winRate - target),
          `${mission.id} ${difficultyId} should stay close to the prepared-party target ${target}`,
        ).toBeLessThanOrEqual(PREPARED_BALANCE_WIN_RATE_TOLERANCE + 0.0001);
      }
    }, 600_000);
  }

  for (const mission of missions) {
    it(`keeps ${mission.id} one-level-behind Veteran pressure above prepared pressure`, () => {
      const prepared = simulateCombatScenario({
        id: `late-nonboss-${mission.id}-veteran-prepared`,
        questId: mission.questId,
        heroLevel: mission.preparedLevel,
        ...preparedParty,
        difficultyId: "veteran",
        runs: 4,
        seed: mission.seed + 500,
      });
      const behind = simulateCombatScenario({
        id: `late-nonboss-${mission.id}-veteran-behind`,
        questId: mission.questId,
        heroLevel: mission.preparedLevel - 1,
        partyClasses: preparedParty.partyClasses,
        skillPathIndices: preparedParty.skillPathIndices,
        difficultyId: "veteran",
        runs: 4,
        seed: mission.seed + 500,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      });

      console.table([prepared, behind]);
      expect(prepared.stalled + behind.stalled).toBe(0);
      expect(prepared.winRate, `${mission.id} preparation should improve win rate`).toBeGreaterThan(behind.winRate);
    }, 240_000);
  }
});
