import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late balance diagnostics", () => {
  it("pinpoints the failing stage after the late-curve rebalance", () => {
    const scenarios = [
      { id: "ch7-siege", questId: "siege_of_skyvault", heroLevel: 13, seed: 8900, stages: 3 },
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 8910, stages: 3 },
      { id: "ch8-siege", questId: "siege_of_tidewatch", heroLevel: 15, seed: 8920, stages: 3 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 8930, stages: 3 },
      { id: "ch9-chain", questId: "chain_beneath_fleet", heroLevel: 17, seed: 8940, stages: 2 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 8950, stages: 3 },
    ] as const;
    for (const scenario of scenarios) {
      for (let encounterLimit = 1; encounterLimit <= scenario.stages; encounterLimit += 1) {
        console.log("STAGE", simulateCombatScenario({
          id: `${scenario.id}-limit${encounterLimit}`,
          questId: scenario.questId,
          heroLevel: scenario.heroLevel,
          partyClasses: ["warrior","ranger","cleric","mage"],
          difficultyId: "standard",
          runs: 1,
          seed: scenario.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
          encounterLimit,
        }));
      }
    }
  }, 120_000);
});
