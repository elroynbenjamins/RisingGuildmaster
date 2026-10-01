import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const missions = [
  { id: "hollow-warden", questId: "hollow_warden_boss", preparedLevel: 5, underpreparedLevel: 4, seed: 81_100 },
  { id: "road-of-glass", questId: "road_of_glass", preparedLevel: 8, underpreparedLevel: 7, seed: 81_200 },
  { id: "laurel-law", questId: "laurel_law", preparedLevel: 10, underpreparedLevel: 9, seed: 81_300 },
  { id: "varkesh", questId: "varkesh_gilded_rupture_boss", preparedLevel: 13, underpreparedLevel: 12, seed: 81_400 },
] as const;

function casualtyEventRate(result: ReturnType<typeof simulateCombatScenario>) {
  return result.wipeRate + result.winRate * result.victoriesWithAnyFallRate;
}

describe("global casualty frequency guard", () => {
  it("makes a realistically underprepared roster need recovery roughly every other battle", () => {
    const pairs = missions.map((mission) => {
      const prepared = simulateCombatScenario({
        id: `casualty-${mission.id}-prepared`,
        questId: mission.questId,
        heroLevel: mission.preparedLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 5,
        seed: mission.seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      });

      const underprepared = simulateCombatScenario({
        id: `casualty-${mission.id}-underprepared`,
        questId: mission.questId,
        heroLevel: mission.underpreparedLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 5,
        seed: mission.seed,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      });

      return { mission, prepared, underprepared };
    });

    console.table(pairs.flatMap(({ prepared, underprepared }) => [prepared, underprepared]));

    expect(pairs.every(({ prepared, underprepared }) => prepared.stalled + underprepared.stalled === 0)).toBe(true);
    expect(pairs.every(({ prepared }) => prepared.winRate >= .60), "prepared Standard parties should remain viable").toBe(true);

    const underpreparedRates = pairs.map(({ underprepared }) => casualtyEventRate(underprepared));
    const preparedRates = pairs.map(({ prepared }) => casualtyEventRate(prepared));
    const underpreparedAverage = underpreparedRates.reduce((sum, rate) => sum + rate, 0) / underpreparedRates.length;
    const preparedAverage = preparedRates.reduce((sum, rate) => sum + rate, 0) / preparedRates.length;

    expect(
      underpreparedRates.filter((rate) => rate >= .50).length,
      "most underprepared representative missions should create a casualty or wipe at least every other attempt",
    ).toBeGreaterThanOrEqual(3);
    expect(
      underpreparedAverage,
      "underprepared aggregate casualty frequency should keep Temple/revive relevant",
    ).toBeGreaterThanOrEqual(.50);
    expect(
      underpreparedAverage,
      "preparation should materially reduce aggregate casualty pressure",
    ).toBeGreaterThan(preparedAverage);
    expect(
      pairs.filter(({ underprepared }) => underprepared.wins > 0).length,
      "underprepared play should remain recoverable rather than becoming universal wipes",
    ).toBeGreaterThanOrEqual(3);
    expect(
      preparedAverage,
      "prepared representative fights should not become a constant casualty spiral",
    ).toBeLessThanOrEqual(.70);
  }, 300_000);
});
