import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late party composition diagnostic", () => {
  it("checks whether the aggressive late party still rewards preparation", () => {
    const scenarios = [
      { id: "nhal-prepared", questId: "admiral_nhal_veyr_boss", level: 15, gearProfile: "optional_progression" as const, seed: 13_800 },
      { id: "nhal-underlevel", questId: "admiral_nhal_veyr_boss", level: 14, gearProfile: "optional_progression" as const, seed: 13_800 },
      { id: "nhal-gear-lagged", questId: "admiral_nhal_veyr_boss", level: 14, gearProfile: "lagged_basic" as const, seed: 13_800 },
      { id: "serekh-prepared", questId: "serekh_chartmaker_boss", level: 17, gearProfile: "optional_progression" as const, seed: 13_900 },
      { id: "serekh-underlevel", questId: "serekh_chartmaker_boss", level: 16, gearProfile: "optional_progression" as const, seed: 13_900 },
      { id: "serekh-gear-lagged", questId: "serekh_chartmaker_boss", level: 16, gearProfile: "lagged_basic" as const, seed: 13_900 },
    ] as const;

    for (const scenario of scenarios) {
      console.log("AGGRESSIVE_PREP", simulateCombatScenario({
        id: scenario.id,
        questId: scenario.questId,
        heroLevel: scenario.level,
        partyClasses: ["warrior", "berserker", "cleric", "ranger"],
        difficultyId: "standard",
        runs: 8,
        seed: scenario.seed,
        gearProfile: scenario.gearProfile,
        progressionProfile: "subclass_ready",
      }));
    }
  }, 360_000);
});
