import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const difficulties = ["standard", "veteran", "iron_guild"] as const;

describe("Chapter 1-2 preparation-route diagnostic", () => {
  it("samples optional catch-up fights across all difficulties", () => {
    const scenarios = [
      { id: "brambleway-caravan", questId: "brambleway_caravan", heroLevel: 2, gearProfile: "starter" as const, progressionProfile: "base" as const, seed: 28_100 },
      { id: "thirteen-ladders", questId: "night_of_thirteen_ladders", heroLevel: 3, gearProfile: "lagged_basic" as const, progressionProfile: "base" as const, seed: 28_200 },
      { id: "last-lift-l4", questId: "last_lift_of_flintwatch", heroLevel: 4, gearProfile: "lagged_basic" as const, progressionProfile: "base" as const, seed: 28_300 },
      { id: "last-lift-l5-prepared", questId: "last_lift_of_flintwatch", heroLevel: 5, gearProfile: "optional_progression" as const, progressionProfile: "subclass_ready" as const, seed: 28_400 },
      { id: "hollow-forge-descent", questId: "descent_to_hollow_forge", heroLevel: 5, gearProfile: "lagged_basic" as const, progressionProfile: "subclass_ready" as const, seed: 28_500 },
    ] as const;

    const results = scenarios.flatMap((scenario) => difficulties.map((difficultyId) =>
      simulateCombatScenario({
        ...scenario,
        id: `${scenario.id}-${difficultyId}`,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId,
        runs: 3,
      }),
    ));

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 240_000);
});
