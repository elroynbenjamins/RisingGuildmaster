import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const bosses = [
  { id: "varkesh", questId: "varkesh_gilded_rupture_boss", level: 13, seed: 14_700 },
  { id: "nhal", questId: "admiral_nhal_veyr_boss", level: 15, seed: 14_800 },
  { id: "serekh", questId: "serekh_chartmaker_boss", level: 17, seed: 14_900 },
] as const;

describe("current-main Spellbow late-campaign stress diagnostic", () => {
  it("checks whether the clean Serekh Spellbow result generalizes across Chapters 7-9 and weaker gear", () => {
    for (const boss of bosses) {
      for (const gearProfile of ["optional_progression", "lagged_basic"] as const) {
        const result = simulateCombatScenario({
          id: `spellbow-${boss.id}-${gearProfile}`,
          questId: boss.questId,
          heroLevel: boss.level,
          partyClasses: ["warrior", "ranger", "cleric", "spellbow"],
          difficultyId: "standard",
          runs: 12,
          seed: boss.seed,
          gearProfile,
          progressionProfile: "subclass_ready",
        });
        console.log("SPELLBOW_LATE_STRESS", result);
        expect(result.stalled, result.scenarioId).toBe(0);
      }
    }
  }, 540_000);
});
