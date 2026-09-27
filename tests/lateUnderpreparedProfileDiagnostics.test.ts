import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late underprepared profile diagnostics", () => {
  it("compares level and gear deficits without forcing a wipe-heavy target", () => {
    const bosses = [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", intendedLevel: 13, seed: 9260 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", intendedLevel: 15, seed: 9270 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", intendedLevel: 17, seed: 9280 },
    ] as const;
    const results = bosses.flatMap((boss) => [
      simulateCombatScenario({
        id: `${boss.id}-level-behind-basic`,
        questId: boss.questId,
        heroLevel: boss.intendedLevel - 1,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 4,
        seed: boss.seed,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      }),
      simulateCombatScenario({
        id: `${boss.id}-level-behind-normal-gear`,
        questId: boss.questId,
        heroLevel: boss.intendedLevel - 1,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 4,
        seed: boss.seed + 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
      simulateCombatScenario({
        id: `${boss.id}-intended-level-basic`,
        questId: boss.questId,
        heroLevel: boss.intendedLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 4,
        seed: boss.seed + 200,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      }),
    ]);
    console.table(results);
  }, 180_000);
});
