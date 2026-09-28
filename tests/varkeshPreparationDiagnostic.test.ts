import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Varkesh preparation diagnostic", () => {
  it("compares prepared and one-level-behind parties by stage", () => {
    for (const profile of [
      { suffix: "prepared", heroLevel: 13 },
      { suffix: "underprepared", heroLevel: 12 },
    ] as const) {
      for (const encounterLimit of [1, 2, 3] as const) {
        console.log("VARKESH", simulateCombatScenario({
          id: `varkesh-${profile.suffix}-limit${encounterLimit}`,
          questId: "varkesh_gilded_rupture_boss",
          heroLevel: profile.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 8,
          seed: 9300,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
          encounterLimit,
        }));
      }
    }
  }, 180_000);
});
