import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late casualty profile diagnostics", () => {
  it("reports final prepared and underprepared late-chapter bands", () => {
    console.log("PROFILE", simulateCombatScenario({
      id: "ch7-skyvault-prepared",
      questId: "siege_of_skyvault",
      heroLevel: 13,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 8,
      seed: 9200,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));

    for (const boss of [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", preparedLevel: 13, seed: 9300 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", preparedLevel: 15, seed: 9400 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", preparedLevel: 17, seed: 9500 },
    ] as const) {
      for (const profile of [
        { suffix: "prepared", heroLevel: boss.preparedLevel, gearProfile: "optional_progression" as const },
        { suffix: "slightly-under", heroLevel: boss.preparedLevel - 1, gearProfile: "optional_progression" as const },
        { suffix: "severely-under", heroLevel: boss.preparedLevel - 1, gearProfile: "lagged_basic" as const },
      ]) {
        console.log("PROFILE", simulateCombatScenario({
          id: `${boss.id}-${profile.suffix}`,
          questId: boss.questId,
          heroLevel: profile.heroLevel,
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
