import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late party composition diagnostic", () => {
  it("expands the late composition outliers against classic baselines", () => {
    const scenarios = [
      { id: "ch7-classic", questId: "varkesh_gilded_rupture_boss", level: 13, seed: 12_700, classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "ch7-base-defensive", questId: "varkesh_gilded_rupture_boss", level: 13, seed: 12_700, classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "ch8-classic", questId: "admiral_nhal_veyr_boss", level: 15, seed: 12_800, classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "ch8-base-aggressive", questId: "admiral_nhal_veyr_boss", level: 15, seed: 12_800, classes: ["warrior", "berserker", "cleric", "ranger"] as const },
      { id: "ch9-classic", questId: "serekh_chartmaker_boss", level: 17, seed: 12_900, classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "ch9-base-aggressive", questId: "serekh_chartmaker_boss", level: 17, seed: 12_900, classes: ["warrior", "berserker", "cleric", "ranger"] as const },
    ] as const;

    for (const scenario of scenarios) {
      console.log("LATE_PARTY_EXPANDED", simulateCombatScenario({
        id: scenario.id,
        questId: scenario.questId,
        heroLevel: scenario.level,
        partyClasses: scenario.classes,
        difficultyId: "standard",
        runs: 18,
        seed: scenario.seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }
  }, 540_000);
});
