import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late casualty profile diagnostics", () => {
  it("checks final Serekh recovery across preparation profiles", () => {
    for (const profile of [
      { suffix: "prepared", heroLevel: 17, gearProfile: "optional_progression" as const },
      { suffix: "slightly-under", heroLevel: 16, gearProfile: "optional_progression" as const },
      { suffix: "severely-under", heroLevel: 16, gearProfile: "lagged_basic" as const },
    ]) {
      console.log("PROFILE", simulateCombatScenario({
        id: `ch9-serekh-${profile.suffix}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: profile.heroLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 8,
        seed: 9500,
        gearProfile: profile.gearProfile,
        progressionProfile: "subclass_ready",
      }));
    }
  }, 180_000);
});
