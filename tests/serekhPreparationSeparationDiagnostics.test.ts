import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Serekh preparation separation", () => {
  it("compares prepared, underprepared, and badly-geared parties", () => {
    for (const profile of [
      { suffix: "prepared", heroLevel: 17, gearProfile: "optional_progression" as const },
      { suffix: "underprepared", heroLevel: 16, gearProfile: "optional_progression" as const },
      { suffix: "severely-underprepared", heroLevel: 16, gearProfile: "lagged_basic" as const },
    ]) {
      console.log("PROFILE", simulateCombatScenario({
        id: `serekh-${profile.suffix}`,
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
