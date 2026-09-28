import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late replacement hero diagnostic", () => {
  it("measures one two-level-behind replacement across each late boss role slot", () => {
    const bosses = [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", level: 13, seed: 13_700 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", level: 15, seed: 13_800 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", level: 17, seed: 13_900 },
    ] as const;
    const classes = ["warrior", "ranger", "cleric", "mage"] as const;

    for (const boss of bosses) {
      console.log("REPLACEMENT_BASELINE", simulateCombatScenario({
        id: `${boss.id}-baseline`,
        questId: boss.questId,
        heroLevel: boss.level,
        partyClasses: classes,
        difficultyId: "standard",
        runs: 8,
        seed: boss.seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
      for (let replacementIndex = 0; replacementIndex < classes.length; replacementIndex += 1) {
        const partyLevels = classes.map((_, index) => index === replacementIndex ? boss.level - 2 : boss.level);
        console.log("REPLACEMENT_CASE", simulateCombatScenario({
          id: `${boss.id}-replace-${classes[replacementIndex]}`,
          questId: boss.questId,
          heroLevel: boss.level,
          partyLevels,
          partyClasses: classes,
          difficultyId: "standard",
          runs: 8,
          seed: boss.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 600_000);
});
