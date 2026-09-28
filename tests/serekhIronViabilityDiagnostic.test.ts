import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Serekh Iron viability diagnostic", () => {
  it("samples a larger prepared Iron seed set", () => {
    for (const seed of [8975, 9100, 9300, 9700]) {
      console.log("SEREKH_IRON_12", simulateCombatScenario({
        id: `prepared-serekh-iron-${seed}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "iron_guild",
        runs: 12,
        seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }
  }, 420_000);
});
