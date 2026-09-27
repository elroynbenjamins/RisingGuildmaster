import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late transition diagnostics", () => {
  it("isolates Nhal prepared-party pressure by stage", () => {
    for (const encounterLimit of [1, 2, 3] as const) {
      console.log("NHAL_PREPARED_STAGE", simulateCombatScenario({
        id: `prepared-nhal-limit${encounterLimit}`,
        questId: "admiral_nhal_veyr_boss",
        heroLevel: 15,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 6,
        seed: 8930,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
        encounterLimit,
      }));
    }
    console.log("NHAL_UNDERPREPARED_SAME_SEED", simulateCombatScenario({
      id: "underprepared-nhal-same-seed",
      questId: "admiral_nhal_veyr_boss",
      heroLevel: 14,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 6,
      seed: 8930,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));
  }, 120_000);
});
