import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late casualty profile diagnostics", () => {
  it("checks the durable Serekh profile across Standard, Hard and underprepared parties", () => {
    const scenarios = [
      { id: "serekh-standard-canonical", heroLevel: 17, difficultyId: "standard" as const, runs: 6, seed: 8950, gearProfile: "optional_progression" as const },
      { id: "serekh-standard-paired", heroLevel: 17, difficultyId: "standard" as const, runs: 8, seed: 9500, gearProfile: "optional_progression" as const },
      { id: "serekh-underprepared-paired", heroLevel: 16, difficultyId: "standard" as const, runs: 8, seed: 9500, gearProfile: "optional_progression" as const },
      { id: "serekh-hard", heroLevel: 17, difficultyId: "veteran" as const, runs: 8, seed: 8975, gearProfile: "optional_progression" as const },
      { id: "serekh-iron", heroLevel: 17, difficultyId: "iron_guild" as const, runs: 8, seed: 8975, gearProfile: "optional_progression" as const },
    ] as const;
    for (const scenario of scenarios) {
      console.log("PROFILE", simulateCombatScenario({
        ...scenario,
        questId: "serekh_chartmaker_boss",
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        progressionProfile: "subclass_ready",
      }));
    }
  }, 300_000);
});
