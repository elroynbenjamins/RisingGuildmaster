import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("Serekh final settle diagnostics", () => {
  it("checks the 0.65 prelude candidate", () => {
    const first = QUEST_ENCOUNTERS.chart_hall_guard!;
    const second = QUEST_ENCOUNTERS.collapsing_tidal_engine!;
    const originalFirst = first.enemies.map((g) => g.difficultyMultiplier);
    const originalSecond = second.enemies.map((g) => g.difficultyMultiplier);
    first.enemies.forEach((g) => { g.difficultyMultiplier = .65; });
    second.enemies.forEach((g) => { g.difficultyMultiplier = .65; });

    const scenarios = [
      { id: "prepared-standard", level: 17, difficultyId: "standard" as const, seed: 8950 },
      { id: "underprepared-standard", level: 16, difficultyId: "standard" as const, seed: 8980 },
      { id: "prepared-hard", level: 17, difficultyId: "veteran" as const, seed: 8975 },
      { id: "prepared-iron", level: 17, difficultyId: "iron_guild" as const, seed: 8975 },
    ];
    for (const scenario of scenarios) {
      console.log("SEREKH65", scenario.id, simulateCombatScenario({
        id: `serekh65-${scenario.id}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: scenario.level,
        partyClasses: party,
        difficultyId: scenario.difficultyId,
        runs: 2,
        seed: scenario.seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }

    first.enemies.forEach((g, i) => { g.difficultyMultiplier = originalFirst[i]; });
    second.enemies.forEach((g, i) => { g.difficultyMultiplier = originalSecond[i]; });
  }, 150_000);
});
