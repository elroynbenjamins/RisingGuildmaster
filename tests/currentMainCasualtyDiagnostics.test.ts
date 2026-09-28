import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("current main casualty diagnostics", () => {
  it("measures severely underprepared late boss pressure", () => {
    for (const boss of [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 12, seed: 9300 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 14, seed: 9400 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 16, seed: 9500 },
    ] as const) {
      console.log("SEVERE", simulateCombatScenario({
        id: `${boss.id}-severely-under`,
        questId: boss.questId,
        heroLevel: boss.heroLevel,
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
