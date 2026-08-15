import type { EncounterDefinition } from "../../game/quests/questTypes";

const heroes = [{ x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 1, y: 5 }];

export const FROSTMARCH_CRISIS_ENCOUNTERS: Record<string, EncounterDefinition> = {
  fallen_aurora_road: {
    id: "fallen_aurora_road",
    battlefieldId: "fallen_aurora_road",
    heroSpawnPositions: heroes,
    enemies: [
      { enemyDefinitionId: "frost_wisp", count: 3, level: 7, spawnPositions: [{ x: 11, y: 3 }, { x: 12, y: 5 }, { x: 11, y: 7 }] },
      { enemyDefinitionId: "dire_wolf", count: 2, level: 7, spawnPositions: [{ x: 10, y: 2 }, { x: 10, y: 8 }] },
    ],
  },
  northwatch_signal_crown: {
    id: "northwatch_signal_crown",
    battlefieldId: "northwatch_signal_crown",
    heroSpawnPositions: heroes,
    enemies: [
      { enemyDefinitionId: "ironbound_sentry", count: 2, level: 8, difficultyMultiplier: 1.08, spawnPositions: [{ x: 11, y: 4 }, { x: 11, y: 6 }] },
      { enemyDefinitionId: "wardstone_wisp", count: 2, level: 8, spawnPositions: [{ x: 12, y: 2 }, { x: 12, y: 8 }] },
      { enemyDefinitionId: "frost_wisp", count: 1, level: 8, difficultyMultiplier: 1.15, spawnPositions: [{ x: 13, y: 5 }] },
    ],
  },
};
