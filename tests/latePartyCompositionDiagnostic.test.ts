import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late party composition diagnostic", () => {
  it("compares sensible prepared parties through Chapters 7-9 on Standard", () => {
    const bosses = [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", level: 13, seed: 12_700 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", level: 15, seed: 12_800 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", level: 17, seed: 12_900 },
    ] as const;
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "base-defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "base-aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
      { id: "premium-flex", classes: ["bulwark", "spellbow", "bard", "mage"] as const },
    ] as const;

    for (const boss of bosses) {
      for (const party of parties) {
        console.log("LATE_PARTY", simulateCombatScenario({
          id: `${boss.id}-${party.id}`,
          questId: boss.questId,
          heroLevel: boss.level,
          partyClasses: party.classes,
          difficultyId: "standard",
          runs: 6,
          seed: boss.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 540_000);
});
