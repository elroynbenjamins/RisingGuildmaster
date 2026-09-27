import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late casualty profile diagnostics", () => {
  it("pinpoints paired prepared Nhal and Serekh stage failures", () => {
    const bosses = [
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 9400 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 9500 },
    ] as const;
    for (const boss of bosses) {
      for (const encounterLimit of [1, 2, 3] as const) {
        console.log("STAGE", simulateCombatScenario({
          id: `${boss.id}-prepared-limit${encounterLimit}`,
          questId: boss.questId,
          heroLevel: boss.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 8,
          seed: boss.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
          encounterLimit,
        }));
      }
    }
  }, 300_000);
});
