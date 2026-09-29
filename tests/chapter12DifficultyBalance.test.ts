import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const difficulties = ["standard", "veteran", "iron_guild"] as const;

describe("Chapter 1-2 fast balance diagnostic", () => {
  it("samples the main early-game difficulty curve", () => {
    const scenarios = [
      { id: "ch1-chieftain", questId: "goblin_chieftain_boss", heroLevel: 2, gearProfile: "starter" as const, progressionProfile: "base" as const, seed: 27_100 },
      { id: "ch2-broken-carts", questId: "road_of_broken_carts", heroLevel: 3, gearProfile: "lagged_basic" as const, progressionProfile: "base" as const, seed: 27_200 },
      { id: "ch2-flintwatch", questId: "fires_of_flintwatch", heroLevel: 4, gearProfile: "lagged_basic" as const, progressionProfile: "base" as const, seed: 27_300 },
      { id: "ch2-chainbreaker", questId: "ghorak_chainbreaker_boss", heroLevel: 4, gearProfile: "lagged_basic" as const, progressionProfile: "base" as const, seed: 27_400 },
      { id: "ch2-warden-lagged", questId: "hollow_warden_boss", heroLevel: 5, gearProfile: "lagged_basic" as const, progressionProfile: "base" as const, seed: 27_500 },
      { id: "ch2-warden-prepared", questId: "hollow_warden_boss", heroLevel: 5, gearProfile: "optional_progression" as const, progressionProfile: "subclass_ready" as const, seed: 27_600 },
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
