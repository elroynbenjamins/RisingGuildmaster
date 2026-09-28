import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("severe late underprepared diagnostics", () => {
  it("measures one-level-behind parties with lagged basic gear", () => {
    for (const boss of [
      { id: "varkesh", questId: "varkesh_gilded_rupture_boss", level: 12, seed: 9600 },
      { id: "nhal", questId: "admiral_nhal_veyr_boss", level: 14, seed: 9700 },
      { id: "serekh", questId: "serekh_chartmaker_boss", level: 16, seed: 9800 },
    ] as const) {
      console.log("SEVERE", simulateCombatScenario({
        id: `severe-${boss.id}`,
        questId: boss.questId,
        heroLevel: boss.level,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 8,
        seed: boss.seed,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      }));
    }
  }, 240_000);
});
