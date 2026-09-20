import type { EncounterDefinition } from "../../game/quests/questTypes";

const chaseHeroes = [{ x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 1, y: 5 }];

export const STONEGATE_ASSASSIN_ENCOUNTERS: Record<string, EncounterDefinition> = {
  gloam_knives_rooftop_pursuit: { id: "gloam_knives_rooftop_pursuit", battlefieldId: "stonegate_midnight_chase", heroSpawnPositions: chaseHeroes, enemies: [{ enemyDefinitionId: "gloam_knife_assassin", count: 2, level: 5, difficultyMultiplier: 1.08, spawnPositions: [{ x: 11, y: 2 }, { x: 11, y: 8 }] }, { enemyDefinitionId: "nightglass_trapper", count: 1, level: 5, difficultyMultiplier: 1.05, spawnPositions: [{ x: 13, y: 5 }] }] },
  bell_of_measures_killbox: { id: "bell_of_measures_killbox", battlefieldId: "stonegate_midnight_chase", heroSpawnPositions: chaseHeroes, enemies: [{ enemyDefinitionId: "seressa_vane", count: 1, level: 5, difficultyMultiplier: 1.18, spawnPositions: [{ x: 14, y: 5 }] }, { enemyDefinitionId: "gloam_knife_assassin", count: 2, level: 5, difficultyMultiplier: 1.10, spawnPositions: [{ x: 12, y: 2 }, { x: 12, y: 8 }] }, { enemyDefinitionId: "nightglass_trapper", count: 1, level: 5, difficultyMultiplier: 1.08, spawnPositions: [{ x: 10, y: 5 }] }] },
};
