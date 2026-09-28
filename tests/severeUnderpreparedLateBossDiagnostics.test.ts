import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late boss tuning diagnostics", () => {
  it("isolates Nhal stage pressure and rechecks Serekh preparation bands", () => {
    for (const profile of [
      { suffix: "prepared", heroLevel: 15, gearProfile: "optional_progression" as const },
      { suffix: "underprepared", heroLevel: 14, gearProfile: "optional_progression" as const },
    ]) {
      for (const encounterLimit of [1, 2, 3] as const) {
        console.log("NHAL", simulateCombatScenario({
          id: `ch8-nhal-${profile.suffix}-limit${encounterLimit}`,
          questId: "admiral_nhal_veyr_boss",
          heroLevel: profile.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 8,
          seed: 11970,
          gearProfile: profile.gearProfile,
          progressionProfile: "subclass_ready",
          encounterLimit,
        }));
      }
    }
    for (const profile of [
      { suffix: "prepared", heroLevel: 17, gearProfile: "optional_progression" as const },
      { suffix: "underprepared", heroLevel: 16, gearProfile: "optional_progression" as const },
      { suffix: "severe", heroLevel: 16, gearProfile: "lagged_basic" as const },
    ]) {
      console.log("SEREKH", simulateCombatScenario({
        id: `ch9-serekh-${profile.suffix}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: profile.heroLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 8,
        seed: 12980,
        gearProfile: profile.gearProfile,
        progressionProfile: "subclass_ready",
      }));
    }
  }, 300_000);
});
