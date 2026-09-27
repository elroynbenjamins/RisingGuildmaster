import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late casualty profile diagnostics", () => {
  it("pinpoints the remaining paired Serekh stage failures", () => {
    for (const profile of [
      { suffix: "prepared", heroLevel: 17, gearProfile: "optional_progression" as const },
      { suffix: "slightly-under", heroLevel: 16, gearProfile: "optional_progression" as const },
    ]) {
      for (const encounterLimit of [1, 2, 3] as const) {
        console.log("STAGE", simulateCombatScenario({
          id: `ch9-serekh-${profile.suffix}-limit${encounterLimit}`,
          questId: "serekh_chartmaker_boss",
          heroLevel: profile.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 8,
          seed: 9500,
          gearProfile: profile.gearProfile,
          progressionProfile: "subclass_ready",
          encounterLimit,
        }));
      }
    }
  }, 240_000);
});
