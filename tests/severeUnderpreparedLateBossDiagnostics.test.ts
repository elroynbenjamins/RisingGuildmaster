import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late boss preparation separation diagnostics", () => {
  it("compares prepared, underprepared and severely underprepared profiles", () => {
    const bosses = [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", preparedLevel: 13, seed: 10960 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", preparedLevel: 15, seed: 11970 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", preparedLevel: 17, seed: 12980 },
    ] as const;
    for (const boss of bosses) {
      for (const profile of [
        { suffix: "prepared", heroLevel: boss.preparedLevel, gearProfile: "optional_progression" as const },
        { suffix: "underprepared", heroLevel: boss.preparedLevel - 1, gearProfile: "optional_progression" as const },
        { suffix: "severe", heroLevel: boss.preparedLevel - 1, gearProfile: "lagged_basic" as const },
      ]) {
        console.log("PROFILE", simulateCombatScenario({
          id: `${boss.id}-${profile.suffix}`,
          questId: boss.questId,
          heroLevel: profile.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 12,
          seed: boss.seed,
          gearProfile: profile.gearProfile,
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 360_000);
});
