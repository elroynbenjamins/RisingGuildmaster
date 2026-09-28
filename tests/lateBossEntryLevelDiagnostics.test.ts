import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late boss real-entry combat diagnostics", () => {
  it("measures normal and completionist boss entry levels", () => {
    for (const boss of [
      { id: "varkesh", questId: "varkesh_gilded_rupture_boss", normalLevel: 13, completionistLevel: 14, seed: 9900 },
      { id: "nhal", questId: "admiral_nhal_veyr_boss", normalLevel: 16, completionistLevel: 17, seed: 9910 },
      { id: "serekh", questId: "serekh_chartmaker_boss", normalLevel: 18, completionistLevel: 19, seed: 9920 },
    ] as const) {
      for (const profile of [
        { suffix: "normal", level: boss.normalLevel },
        { suffix: "completionist", level: boss.completionistLevel },
      ] as const) {
        console.log("ENTRY_COMBAT", simulateCombatScenario({
          id: `${boss.id}-${profile.suffix}-entry`,
          questId: boss.questId,
          heroLevel: profile.level,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 8,
          seed: boss.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 240_000);
});
