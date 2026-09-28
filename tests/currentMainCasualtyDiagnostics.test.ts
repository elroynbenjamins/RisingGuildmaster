import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("current main casualty diagnostics", () => {
  it("measures prepared late missions and preparation separation", () => {
    const preparedScenarios = [
      { id: "prepared-ch7-siege", questId: "siege_of_skyvault", heroLevel: 13, seed: 8900 },
      { id: "prepared-ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 9300 },
      { id: "prepared-ch8-siege", questId: "siege_of_tidewatch", heroLevel: 15, seed: 8920 },
      { id: "prepared-ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 9400 },
      { id: "prepared-ch9-chain", questId: "chain_beneath_fleet", heroLevel: 17, seed: 8940 },
      { id: "prepared-ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 9500 },
    ] as const;
    for (const scenario of preparedScenarios) {
      console.log("PREPARED", simulateCombatScenario({
        ...scenario,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 8,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }

    for (const boss of [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", preparedLevel: 13, seed: 9300 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", preparedLevel: 15, seed: 9400 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", preparedLevel: 17, seed: 9500 },
    ] as const) {
      for (const profile of [
        { suffix: "slightly-under", heroLevel: boss.preparedLevel - 1, gearProfile: "optional_progression" as const },
        { suffix: "severely-under", heroLevel: boss.preparedLevel - 1, gearProfile: "lagged_basic" as const },
      ]) {
        console.log("UNDER", simulateCombatScenario({
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
  }, 360_000);
});
