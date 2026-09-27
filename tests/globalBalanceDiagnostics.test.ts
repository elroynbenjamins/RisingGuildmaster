import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("global balance diagnostics", () => {
  it("settles Serekh Iron pre-boss pressure", () => {
    const first = QUEST_ENCOUNTERS.chart_hall_guard!;
    const second = QUEST_ENCOUNTERS.collapsing_tidal_engine!;
    const originalFirst = first.enemies.map((g) => g.difficultyMultiplier);
    const originalSecond = second.enemies.map((g) => g.difficultyMultiplier);

    for (const pre of [.80, .75, .70] as const) {
      first.enemies.forEach((g) => { g.difficultyMultiplier = pre; });
      second.enemies.forEach((g) => { g.difficultyMultiplier = pre; });
      for (const difficultyId of ["veteran", "iron_guild"] as const) {
        console.log("SEREKH_IRON_SETTLE", pre, difficultyId, simulateCombatScenario({
          id: `serekh-pre${pre}-${difficultyId}`,
          questId: "serekh_chartmaker_boss",
          heroLevel: 17,
          partyClasses: party,
          difficultyId,
          runs: 2,
          seed: 8975,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }

    first.enemies.forEach((g, i) => { g.difficultyMultiplier = originalFirst[i]; });
    second.enemies.forEach((g, i) => { g.difficultyMultiplier = originalSecond[i]; });
  }, 180_000);
});
