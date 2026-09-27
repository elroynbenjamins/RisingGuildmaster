import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late casualty profile diagnostics", () => {
  it("compares slightly and severely underprepared boss parties", () => {
    const bosses = [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", preparedLevel: 13, seed: 8960 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", preparedLevel: 15, seed: 8970 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", preparedLevel: 17, seed: 8980 },
    ] as const;
    for (const boss of bosses) {
      for (const profile of [
        { suffix: "slightly-under", heroLevel: boss.preparedLevel - 1, gearProfile: "optional_progression" as const },
        { suffix: "gear-lag", heroLevel: boss.preparedLevel, gearProfile: "lagged_basic" as const },
        { suffix: "severely-under", heroLevel: boss.preparedLevel - 1, gearProfile: "lagged_basic" as const },
      ]) {
        console.log("PROFILE", simulateCombatScenario({
          id: `${boss.id}-${profile.suffix}`,
          questId: boss.questId,
          heroLevel: profile.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 6,
          seed: boss.seed,
          gearProfile: profile.gearProfile,
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 240_000);
});
