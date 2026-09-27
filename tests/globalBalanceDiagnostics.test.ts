import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("global balance diagnostics", () => {
  it("tests boss-focused Serekh redistribution", () => {
    const first = QUEST_ENCOUNTERS.chart_hall_guard!;
    const second = QUEST_ENCOUNTERS.collapsing_tidal_engine!;
    const final = QUEST_ENCOUNTERS.serekh_abyss_platform!;
    const originalFirst = first.enemies.map((g) => g.difficultyMultiplier);
    const originalSecond = second.enemies.map((g) => g.difficultyMultiplier);
    const boss = final.enemies.find((g) => g.enemyDefinitionId === "serekh_chartmaker")!;
    const originalBoss = boss.difficultyMultiplier;

    const variants = [
      { id: "pre60-boss120", pre: .60, boss: 1.20 },
      { id: "pre55-boss125", pre: .55, boss: 1.25 },
    ] as const;

    for (const variant of variants) {
      first.enemies.forEach((g) => { g.difficultyMultiplier = variant.pre; });
      second.enemies.forEach((g) => { g.difficultyMultiplier = variant.pre; });
      boss.difficultyMultiplier = variant.boss;
      for (const difficultyId of ["standard", "veteran", "iron_guild"] as const) {
        console.log("SEREKH_BOSS_FOCUS", variant.id, difficultyId, simulateCombatScenario({
          id: `serekh-${variant.id}-${difficultyId}`,
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
