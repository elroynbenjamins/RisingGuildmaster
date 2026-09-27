import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late transition diagnostics", () => {
  it("prints stage-by-stage prepared and underprepared pressure", () => {
    const scenarios = [
      { id: "prepared-ch7-siege", questId: "siege_of_skyvault", heroLevel: 13, seed: 8900, gearProfile: "optional_progression" as const },
      { id: "underprepared-ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 12, seed: 8960, gearProfile: "lagged_basic" as const },
      { id: "prepared-ch8-siege", questId: "siege_of_tidewatch", heroLevel: 15, seed: 8920, gearProfile: "optional_progression" as const },
      { id: "prepared-ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 8930, gearProfile: "optional_progression" as const },
      { id: "underprepared-ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 16, seed: 8980, gearProfile: "lagged_basic" as const },
    ] as const;
    for (const scenario of scenarios) {
      for (const encounterLimit of [1, 2, 3] as const) {
        console.log("STAGE", simulateCombatScenario({
          ...scenario,
          id: `${scenario.id}-limit${encounterLimit}`,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 1,
          progressionProfile: "subclass_ready",
          encounterLimit,
        }));
      }
    }
  }, 120_000);
});
