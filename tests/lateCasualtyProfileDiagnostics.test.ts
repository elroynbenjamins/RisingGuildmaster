import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late casualty profile diagnostics", () => {
  it("checks Serekh Hard and Iron across sensible prepared party compositions", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "alternate-support", classes: ["paladin", "ranger", "bard", "mage"] as const },
      { id: "heavy-frontline", classes: ["warrior", "berserker", "cleric", "spellbow"] as const },
    ];
    for (const difficultyId of ["veteran", "iron_guild"] as const) {
      for (const party of parties) {
        console.log("PROFILE", simulateCombatScenario({
          id: `serekh-${difficultyId}-${party.id}`,
          questId: "serekh_chartmaker_boss",
          heroLevel: 17,
          partyClasses: party.classes,
          difficultyId,
          runs: 4,
          seed: 8975,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 300_000);
});
