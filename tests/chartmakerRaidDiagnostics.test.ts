import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "paladin", "cleric", "ranger", "berserker", "mage", "cleric", "ranger"] as const;

describe("Chartmaker raid diagnostics", () => {
  it("settles Serekh escort pressure", () => {
    const final = QUEST_ENCOUNTERS.raid_chartmaker_final!;
    const original = final.enemies.map((group) => ({ ...group, spawnPositions: [...group.spawnPositions] }));

    for (const bossScale of [1.20, 1.25] as const) {
      final.enemies = original.map((group) => ({ ...group, spawnPositions: [...group.spawnPositions] }));
      const boss = final.enemies.find((group) => group.enemyDefinitionId === "serekh_chartmaker")!;
      boss.difficultyMultiplier = bossScale;
      final.enemies.push(
        {
          enemyDefinitionId: "drowned_legionary",
          count: 2,
          level: 18,
          spawnPositions: [{ x: 14, y: 5 }, { x: 14, y: 9 }],
        },
        {
          enemyDefinitionId: "tideglass_stalker",
          count: 2,
          level: 18,
          spawnPositions: [{ x: 14, y: 6 }, { x: 14, y: 8 }],
        },
      );
      console.log("RAID3", bossScale, simulateCombatScenario({
        id: `raid-chartmaker-escort-boss${bossScale}`,
        questId: "raid_chartmaker_ascendant",
        heroLevel: 18,
        partyClasses: party,
        difficultyId: "standard",
        runs: 6,
        seed: 15500,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }

    final.enemies = original;
  }, 180_000);
});
