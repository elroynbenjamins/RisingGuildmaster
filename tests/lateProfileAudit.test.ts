import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("candidate late campaign profile audit", () => {
  it("compares prepared, one-level-behind and badly-geared boss parties", () => {
    const bosses = [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", preparedLevel: 13, seed: 10300 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", preparedLevel: 15, seed: 10400 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", preparedLevel: 17, seed: 10500 },
    ] as const;

    for (const boss of bosses) {
      for (const profile of [
        { suffix: "prepared", heroLevel: boss.preparedLevel, gearProfile: "optional_progression" as const },
        { suffix: "one-level-behind", heroLevel: boss.preparedLevel - 1, gearProfile: "optional_progression" as const },
        { suffix: "badly-geared", heroLevel: boss.preparedLevel - 1, gearProfile: "lagged_basic" as const },
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
