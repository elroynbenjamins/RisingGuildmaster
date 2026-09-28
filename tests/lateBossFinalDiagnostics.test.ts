import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late boss final diagnostics", () => {
  it("measures Nhal over a larger paired sample and Serekh at 0.90 pre-boss pressure", () => {
    for (const profile of [
      { suffix: "prepared", heroLevel: 15, gearProfile: "optional_progression" as const },
      { suffix: "underprepared", heroLevel: 14, gearProfile: "optional_progression" as const },
    ]) {
      console.log("NHAL24", simulateCombatScenario({
        id: `ch8-nhal-${profile.suffix}`,
        questId: "admiral_nhal_veyr_boss",
        heroLevel: profile.heroLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 24,
        seed: 15970,
        gearProfile: profile.gearProfile,
        progressionProfile: "subclass_ready",
      }));
    }

    for (const profile of [
      { suffix: "prepared", heroLevel: 17, gearProfile: "optional_progression" as const },
      { suffix: "underprepared", heroLevel: 16, gearProfile: "optional_progression" as const },
      { suffix: "gear-lagged", heroLevel: 16, gearProfile: "lagged_basic" as const },
    ]) {
      console.log("SEREKH16", simulateCombatScenario({
        id: `ch9-serekh-${profile.suffix}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: profile.heroLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 16,
        seed: 16980,
        gearProfile: profile.gearProfile,
        progressionProfile: "subclass_ready",
      }));
    }
  }, 360_000);
});
