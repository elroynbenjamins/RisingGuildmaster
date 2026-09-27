import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUESTS } from "../src/data/quests/quests";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("global balance diagnostics", () => {
  it("isolates prepared Serekh Hard pressure cheaply", () => {
    for (const encounterLimit of [1, 2, 3] as const) {
      console.log("SEREKH_HARD_STAGE", simulateCombatScenario({
        id: `serekh-veteran-limit${encounterLimit}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: party,
        difficultyId: "veteran",
        runs: 2,
        seed: 8975,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
        encounterLimit,
      }));
    }

    const quest = QUESTS.serekh_chartmaker_boss!;
    const originalRecovery = quest.betweenEncounterHpRecoveryRatio;
    for (const recovery of [.15, .20, .25] as const) {
      quest.betweenEncounterHpRecoveryRatio = recovery;
      console.log("SEREKH_HARD_RECOVERY", recovery, simulateCombatScenario({
        id: `serekh-veteran-r${recovery}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: party,
        difficultyId: "veteran",
        runs: 2,
        seed: 8975,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
      console.log("SEREKH_IRON_RECOVERY", recovery, simulateCombatScenario({
        id: `serekh-iron-r${recovery}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: party,
        difficultyId: "iron_guild",
        runs: 1,
        seed: 8975,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }
    quest.betweenEncounterHpRecoveryRatio = originalRecovery;
  }, 240_000);
});
