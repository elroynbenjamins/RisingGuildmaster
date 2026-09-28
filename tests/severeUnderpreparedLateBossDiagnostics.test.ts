import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("severely underprepared late boss diagnostics", () => {
  it("measures level-behind parties with lagged basic gear", () => {
    const scenarios = [
      { id: "severe-ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 12, seed: 9960 },
      { id: "severe-ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 14, seed: 9970 },
      { id: "severe-ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 16, seed: 9980 },
    ] as const;
    for (const scenario of scenarios) {
      console.log("SEVERE", simulateCombatScenario({
        ...scenario,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 8,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      }));
    }
  }, 240_000);
});
