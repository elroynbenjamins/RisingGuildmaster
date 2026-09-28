import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late preparation gradient diagnostics", () => {
  it("compares prepared, mildly underprepared, and severely underprepared parties on identical seeds", () => {
    for (const boss of [
      { id: "varkesh", questId: "varkesh_gilded_rupture_boss", preparedLevel: 13, seed: 9600 },
      { id: "nhal", questId: "admiral_nhal_veyr_boss", preparedLevel: 15, seed: 9700 },
      { id: "serekh", questId: "serekh_chartmaker_boss", preparedLevel: 17, seed: 9800 },
    ] as const) {
      for (const profile of [
        { suffix: "prepared", level: boss.preparedLevel, gearProfile: "optional_progression" as const },
        { suffix: "mild", level: boss.preparedLevel - 1, gearProfile: "optional_progression" as const },
        { suffix: "severe", level: boss.preparedLevel - 1, gearProfile: "lagged_basic" as const },
      ]) {
        console.log("GRADIENT", simulateCombatScenario({
          id: `${boss.id}-${profile.suffix}`,
          questId: boss.questId,
          heroLevel: profile.level,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 8,
          seed: boss.seed,
          gearProfile: profile.gearProfile,
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 300_000);
});
