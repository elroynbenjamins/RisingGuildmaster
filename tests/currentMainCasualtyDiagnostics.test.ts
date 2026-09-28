import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("current main casualty diagnostics", () => {
  it("compares prepared and one-level-behind bosses on identical seeds", () => {
    for (const boss of [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", preparedLevel: 13, seed: 9300 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", preparedLevel: 15, seed: 9400 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", preparedLevel: 17, seed: 9500 },
    ] as const) {
      for (const profile of [
        { suffix: "prepared", heroLevel: boss.preparedLevel },
        { suffix: "one-level-behind", heroLevel: boss.preparedLevel - 1 },
      ] as const) {
        console.log("PAIR", simulateCombatScenario({
          id: `${boss.id}-${profile.suffix}`,
          questId: boss.questId,
          heroLevel: profile.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 6,
          seed: boss.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 300_000);
});
