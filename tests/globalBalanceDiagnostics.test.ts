import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUESTS } from "../src/data/quests/quests";

describe("global balance diagnostics", () => {
  it("isolates prepared Serekh pressure across difficulty and recovery", () => {
    const quest = QUESTS.serekh_chartmaker_boss!;
    const originalRecovery = quest.betweenEncounterHpRecoveryRatio;

    for (const difficultyId of ["standard", "veteran", "iron_guild"] as const) {
      console.log("SEREKH_FULL", simulateCombatScenario({
        id: `serekh-${difficultyId}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId,
        runs: 8,
        seed: 9475,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }

    for (const encounterLimit of [1, 2, 3] as const) {
      console.log("SEREKH_HARD_STAGE", simulateCombatScenario({
        id: `serekh-veteran-limit${encounterLimit}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "veteran",
        runs: 8,
        seed: 9525,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
        encounterLimit,
      }));
    }

    for (const recovery of [.15, .20, .25] as const) {
      quest.betweenEncounterHpRecoveryRatio = recovery;
      for (const difficultyId of ["veteran", "iron_guild"] as const) {
        console.log("SEREKH_RECOVERY", recovery, simulateCombatScenario({
          id: `serekh-${difficultyId}-r${recovery}`,
          questId: "serekh_chartmaker_boss",
          heroLevel: 17,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId,
          runs: 8,
          seed: 9575,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }

    quest.betweenEncounterHpRecoveryRatio = originalRecovery;
  }, 300_000);
});
