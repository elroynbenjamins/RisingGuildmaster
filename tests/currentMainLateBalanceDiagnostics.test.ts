import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("current main late balance diagnostics", () => {
  it("checks the attrition-focused Serekh profile", () => {
    for (const profile of [
      { suffix: "prepared", heroLevel: 17, gearProfile: "optional_progression" as const },
      { suffix: "underprepared", heroLevel: 16, gearProfile: "optional_progression" as const },
      { suffix: "severely-underprepared", heroLevel: 16, gearProfile: "lagged_basic" as const },
    ]) {
      console.log("PROFILE", simulateCombatScenario({
        id: `serekh-${profile.suffix}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: profile.heroLevel,
        partyClasses: ["warrior","ranger","cleric","mage"],
        difficultyId: "standard",
        runs: 8,
        seed: 9500,
        gearProfile: profile.gearProfile,
        progressionProfile: "subclass_ready",
      }));
    }
    for (const difficultyId of ["veteran","iron_guild"] as const) {
      console.log("HARD", simulateCombatScenario({
        id: `serekh-${difficultyId}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: ["warrior","ranger","cleric","mage"],
        difficultyId,
        runs: 4,
        seed: 8975,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }
  }, 180_000);
});
