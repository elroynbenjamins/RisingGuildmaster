import type { EnemyBaseStats } from "../game/enemies/enemyTypes";
export const ENEMY_BASE_STATS: EnemyBaseStats = { hp: 100, physicalDamage: 24, physicalDefense: 18, magicDamage: 18, magicDefense: 15, speed: 18 };

/** Early campaign enemies grow quickly so level gaps matter immediately. */
export const ENEMY_LEVEL_STAT_GROWTH = 0.18;
/** After level 10, gear, subclasses, and build choices carry more of the difficulty curve. */
export const ENEMY_LATE_LEVEL_STAT_GROWTH = 0.03;
export const ENEMY_FULL_GROWTH_LEVEL_CAP = 10;

export function enemyLevelStatMultiplier(level: number): number {
  const normalizedLevel = Math.max(1, Math.round(level));
  const earlyGrowthSteps = Math.min(normalizedLevel - 1, ENEMY_FULL_GROWTH_LEVEL_CAP - 1);
  const lateGrowthSteps = Math.max(0, normalizedLevel - ENEMY_FULL_GROWTH_LEVEL_CAP);
  return 1 + earlyGrowthSteps * ENEMY_LEVEL_STAT_GROWTH + lateGrowthSteps * ENEMY_LATE_LEVEL_STAT_GROWTH;
}
