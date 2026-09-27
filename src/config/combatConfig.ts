import type { EnemyBaseStats } from "../game/enemies/enemyTypes";
export const ENEMY_BASE_STATS: EnemyBaseStats = { hp: 100, physicalDamage: 24, physicalDefense: 18, magicDamage: 18, magicDefense: 15, speed: 18 };

/** Early and midgame enemies keep the original 18% complete-stat growth through Level 11. */
export const ENEMY_LEVEL_STAT_GROWTH = 0.18;
/**
 * From Level 12 onward, complete-stat growth tapers sharply. Late chapters already
 * gain difficulty from stronger enemy definitions, higher attack bonuses, denser
 * mechanics and boss phases; continuing the full 18% compounding overwhelms the
 * hero attribute/equipment curve.
 */
export const ENEMY_LATE_LEVEL_STAT_GROWTH = 0.02;
export const ENEMY_LATE_LEVEL_GROWTH_START = 11;

export function getEnemyLevelStatMultiplier(level: number): number {
  const normalizedLevel = Math.max(1, Math.round(level));
  const earlySteps = Math.min(normalizedLevel - 1, ENEMY_LATE_LEVEL_GROWTH_START - 1);
  const lateSteps = Math.max(0, normalizedLevel - ENEMY_LATE_LEVEL_GROWTH_START);
  return 1 + earlySteps * ENEMY_LEVEL_STAT_GROWTH + lateSteps * ENEMY_LATE_LEVEL_STAT_GROWTH;
}
