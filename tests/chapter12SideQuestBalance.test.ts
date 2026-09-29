import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const difficulties = ["standard", "veteran", "iron_guild"] as const;

describe("Chapter 1-2 preparation side-quest balance", () => {
  it("keeps authored catch-up routes useful across difficulty modes", () => {
    const scenarios = [
      {
        id: "brambleway-caravan-l2",
        questId: "brambleway_caravan",
        heroLevel: 2,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "starter" as const,
        progressionProfile: "base" as const,
        runs: 6,
        seed: 26_100,
      },
      {
        id: "thirteen-ladders-l3-lagged",
        questId: "night_of_thirteen_ladders",
        heroLevel: 3,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "lagged_basic" as const,
        progressionProfile: "base" as const,
        runs: 6,
        seed: 26_200,
      },
      {
        id: "last-lift-l4-lagged",
        questId: "last_lift_of_flintwatch",
        heroLevel: 4,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "lagged_basic" as const,
        progressionProfile: "base" as const,
        runs: 6,
        seed: 26_300,
      },
      {
        id: "last-lift-l5-prepared",
        questId: "last_lift_of_flintwatch",
        heroLevel: 5,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "optional_progression" as const,
        progressionProfile: "subclass_ready" as const,
        runs: 6,
        seed: 26_400,
      },
      {
        id: "hollow-forge-descent-l5",
        questId: "descent_to_hollow_forge",
        heroLevel: 5,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "lagged_basic" as const,
        progressionProfile: "subclass_ready" as const,
        runs: 6,
        seed: 26_500,
      },
    ] as const;

    const results = scenarios.flatMap((scenario) => difficulties.map((difficultyId) =>
      simulateCombatScenario({
        ...scenario,
        difficultyId,
        id: `${scenario.id}-${difficultyId}`,
      }),
    ));

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 360_000);
});
