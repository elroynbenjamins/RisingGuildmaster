import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Serekh real-entry stage diagnostics", () => {
  it("compares minimum, normal, and completionist Serekh pressure by stage", () => {
    for (const profile of [
      { suffix: "minimum", level: 17 },
      { suffix: "normal", level: 18 },
      { suffix: "completionist", level: 19 },
    ] as const) {
      for (const encounterLimit of [1, 2, 3] as const) {
        console.log("SEREKH_STAGE", simulateCombatScenario({
          id: `serekh-${profile.suffix}-limit${encounterLimit}`,
          questId: "serekh_chartmaker_boss",
          heroLevel: profile.level,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 12,
          seed: 9940,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
          encounterLimit,
        }));
      }
    }
  }, 300_000);
});
