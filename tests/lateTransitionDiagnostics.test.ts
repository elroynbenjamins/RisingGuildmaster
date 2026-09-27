import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late transition diagnostics", () => {
  it("pinpoints prepared Varkesh/Nhal attrition and realistic underprepared boss pressure", () => {
    const prepared = [
      { id: "prepared-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 8910 },
      { id: "prepared-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 8930 },
    ] as const;
    for (const scenario of prepared) {
      for (const encounterLimit of [1, 2, 3] as const) {
        console.log("PREPARED_STAGE", simulateCombatScenario({
          ...scenario,
          id: `${scenario.id}-limit${encounterLimit}`,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 6,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
          encounterLimit,
        }));
      }
    }

    const underprepared = [
      { id: "underprepared-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 8960 },
      { id: "underprepared-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 8970 },
      { id: "underprepared-serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 8980 },
    ] as const;
    for (const scenario of underprepared) {
      console.log("UNDERPREPARED", simulateCombatScenario({
        ...scenario,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 6,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      }));
    }
  }, 180_000);
});
