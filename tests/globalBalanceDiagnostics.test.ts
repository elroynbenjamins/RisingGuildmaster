import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("global balance diagnostics", () => {
  it("settles Serekh prelude normalization", () => {
    const first = QUEST_ENCOUNTERS.chart_hall_guard!;
    const second = QUEST_ENCOUNTERS.collapsing_tidal_engine!;
    const final = QUEST_ENCOUNTERS.serekh_abyss_platform!;
    const originalFirst = first.enemies.map((g) => g.difficultyMultiplier);
    const originalSecond = second.enemies.map((g) => g.difficultyMultiplier);
    const boss = final.enemies.find((g) => g.enemyDefinitionId === "serekh_chartmaker")!;
    const originalBoss = boss.difficultyMultiplier;

    for (const pre of [.75, .70] as const) {
      first.enemies.forEach((g) => { g.difficultyMultiplier = pre; });
      second.enemies.forEach((g) => { g.difficultyMultiplier = pre; });
      boss.difficultyMultiplier = 1.10;
      for (const difficultyId of ["standard", "veteran", "iron_guild"] as const) {
        console.log("SEREKH_FINAL_TUNE", pre, difficultyId, simulateCombatScenario({
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
    boss.difficultyMultiplier = originalBoss;
  }, 180_000);
});
