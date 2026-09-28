import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late role substitution diagnostic", () => {
  it("checks role-correct Berserker and Monk damage substitutions", () => {
    const bosses = [
      { id: "nhal", questId: "admiral_nhal_veyr_boss", level: 15, seed: 15_800 },
      { id: "serekh", questId: "serekh_chartmaker_boss", level: 17, seed: 15_900 },
    ] as const;
    const parties = [
      { id: "damage-berserker", classes: ["warrior", "berserker", "cleric", "mage"] as const },
      { id: "damage-monk", classes: ["warrior", "monk", "cleric", "mage"] as const },
    ] as const;

    for (const boss of bosses) {
      for (const party of parties) {
        console.log("ROLE_CORRECT", simulateCombatScenario({
          id: `${boss.id}-${party.id}`,
          questId: boss.questId,
          heroLevel: boss.level,
          partyClasses: party.classes,
          difficultyId: "standard",
          runs: 8,
          seed: boss.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 300_000);
});
