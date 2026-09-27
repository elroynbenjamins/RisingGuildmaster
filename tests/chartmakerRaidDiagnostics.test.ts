import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "paladin", "cleric", "ranger", "berserker", "mage", "cleric", "ranger"] as const;

describe("Chartmaker raid diagnostics", () => {
  it("tests a real final-room escort around Serekh", () => {
    const final = QUEST_ENCOUNTERS.raid_chartmaker_final!;
    const original = final.enemies.map((group) => ({ ...group, spawnPositions: [...group.spawnPositions] }));

    const variants = [
      { id: "four-guards-boss115", bossScale: 1.15, guards: 4, lantern: false, stalkers: false },
      { id: "two-guards-lantern-boss115", bossScale: 1.15, guards: 2, lantern: true, stalkers: false },
      { id: "two-guards-two-stalkers-boss115", bossScale: 1.15, guards: 2, lantern: false, stalkers: true },
      { id: "two-guards-lantern-boss125", bossScale: 1.25, guards: 2, lantern: true, stalkers: false },
    ] as const;

    for (const variant of variants) {
      final.enemies = original.map((group) => ({ ...group, spawnPositions: [...group.spawnPositions] }));
      const boss = final.enemies.find((group) => group.enemyDefinitionId === "serekh_chartmaker")!;
      boss.difficultyMultiplier = variant.bossScale;
      if (variant.guards === 4) {
        final.enemies.push({
          enemyDefinitionId: "drowned_legionary",
          count: 4,
          level: 18,
          spawnPositions: [{ x: 14, y: 3 }, { x: 14, y: 5 }, { x: 14, y: 9 }, { x: 14, y: 11 }],
        });
      } else {
        final.enemies.push({
          enemyDefinitionId: "drowned_legionary",
          count: 2,
          level: 18,
          spawnPositions: [{ x: 14, y: 5 }, { x: 14, y: 9 }],
        });
      }
      if (variant.lantern) {
        final.enemies.push({
          enemyDefinitionId: "abyssal_lanternbearer",
          count: 1,
          level: 18,
          spawnPositions: [{ x: 16, y: 7 }],
        });
      }
      if (variant.stalkers) {
        final.enemies.push({
          enemyDefinitionId: "tideglass_stalker",
          count: 2,
          level: 18,
          spawnPositions: [{ x: 14, y: 6 }, { x: 14, y: 8 }],
        });
      }
      console.log("RAID2", variant.id, simulateCombatScenario({
        id: `raid-chartmaker-${variant.id}`,
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
  }, 240_000);
});
