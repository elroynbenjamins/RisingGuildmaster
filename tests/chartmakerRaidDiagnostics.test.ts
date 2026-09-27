import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "paladin", "cleric", "ranger", "berserker", "mage", "cleric", "ranger"] as const;

describe("Chartmaker raid diagnostics", () => {
  it("tests final-room add pressure without reducing prepared viability", () => {
    const first = QUEST_ENCOUNTERS.raid_chartroom_false_map!;
    const final = QUEST_ENCOUNTERS.raid_chartmaker_final!;
    const originalFirst = first.enemies.map((group) => ({ ...group, spawnPositions: [...group.spawnPositions] }));
    const originalFinal = final.enemies.map((group) => ({ ...group, spawnPositions: [...group.spawnPositions] }));

    const variants = [
      { id: "baseline", firstAdds: false, finalAdds: 0, bossScale: 1.0 },
      { id: "two-guards", firstAdds: false, finalAdds: 2, bossScale: 1.0 },
      { id: "two-guards-boss115", firstAdds: false, finalAdds: 2, bossScale: 1.15 },
      { id: "full-raid-pressure", firstAdds: true, finalAdds: 2, bossScale: 1.10 },
    ] as const;

    for (const variant of variants) {
      first.enemies = originalFirst.map((group) => ({ ...group, spawnPositions: [...group.spawnPositions] }));
      final.enemies = originalFinal.map((group) => ({ ...group, spawnPositions: [...group.spawnPositions] }));
      const boss = final.enemies.find((group) => group.enemyDefinitionId === "serekh_chartmaker")!;
      boss.difficultyMultiplier = variant.bossScale;
      if (variant.firstAdds) {
        first.enemies.push({
          enemyDefinitionId: "tideglass_stalker",
          count: 2,
          level: 18,
          spawnPositions: [{ x: 14, y: 6 }, { x: 14, y: 8 }],
        });
      }
      if (variant.finalAdds === 2) {
        final.enemies.push({
          enemyDefinitionId: "drowned_legionary",
          count: 2,
          level: 18,
          spawnPositions: [{ x: 14, y: 5 }, { x: 14, y: 9 }],
        });
      }
      console.log("RAID", variant.id, simulateCombatScenario({
        id: `raid-chartmaker-${variant.id}`,
        questId: "raid_chartmaker_ascendant",
        heroLevel: 18,
        partyClasses: party,
        difficultyId: "standard",
        runs: 8,
        seed: 15500,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }

    first.enemies = originalFirst;
    final.enemies = originalFinal;
  }, 240_000);
});
