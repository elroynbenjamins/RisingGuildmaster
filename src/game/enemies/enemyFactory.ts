import { getEnemyDefinition } from "../../data/enemies";
import type { RandomSource } from "../../utils/random";
import { calculateEnemyStats } from "./enemyCalculator";
import type { EnemyBaseStats, EnemyInstance, EnemyStatScaling } from "./enemyTypes";

export interface CreateEnemyOptions { level?: number; scaling?: EnemyStatScaling }

export function createEnemyInstance(enemyDefinitionId: string, baseStats: EnemyBaseStats, random: RandomSource, options: CreateEnemyOptions = {}): EnemyInstance {
  const level = Math.max(1, Math.round(options.level ?? 1));
  const definition = getEnemyDefinition(enemyDefinitionId);
  const maxHP = calculateEnemyStats(baseStats, definition, options.scaling).hp;
  return {
    instanceId: `enemy-${random.int(100000, 999999)}-${random.int(100000, 999999)}`,
    enemyDefinitionId,
    level,
    currentHP: maxHP,
    maxHP,
    activeConditionIds: [],
    activeConditions: [],
    activeCooldowns: {},
    isAlive: true,
    position: { x: 0, y: 0 },
    movementRange: 3,
  };
}

export function createEncounterInstances(entries: readonly { enemyDefinitionId: string; count: number }[], baseStats: EnemyBaseStats, random: RandomSource, options: CreateEnemyOptions = {}): EnemyInstance[] {
  return entries.flatMap((entry) => Array.from({ length: entry.count }, () => createEnemyInstance(entry.enemyDefinitionId, baseStats, random, options)));
}
