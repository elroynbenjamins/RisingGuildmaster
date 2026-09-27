import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late casualty profile diagnostics", () => {
  it("pinpoints Serekh Hard stage pressure against Standard", () => {
    for (const difficultyId of ["standard", "veteran", "iron_guild"] as const) {
      for (const encounterLimit of [1, 2, 3] as const) {
        console.log("STAGE", simulateCombatScenario({
          id: `serekh-${difficultyId}-limit${encounterLimit}`,
          questId: "serekh_chartmaker_boss",
          heroLevel: 17,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId,
          runs: 8,
          seed: 8975,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
          encounterLimit,
        }));
      }
    }
  }, 300_000);
});
