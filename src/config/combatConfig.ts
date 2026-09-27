import type { EnemyBaseStats } from "../game/enemies/enemyTypes";
export const ENEMY_BASE_STATS: EnemyBaseStats = { hp: 100, physicalDamage: 24, physicalDefense: 18, magicDamage: 18, magicDefense: 15, speed: 18 };

/** Existing early-game growth is retained through Level 6. */
export const ENEMY_LEVEL_STAT_GROWTH = 0.18;
export const ENEMY_EARLY_GROWTH_LEVEL_CAP = 6;

/**
 * After Level 6, enemy scaling tapers by category. HP can keep extending fights,
 * while damage, defense and especially speed no longer compound at the same
 * rate as HP. D20 accuracy is handled separately by proficiency/bounded rolls.
 */
export const ENEMY_LATE_LEVEL_GROWTH = {
  hp: 0.08,
  damage: 0.06,
  defense: 0.04,
  speed: 0.02,
} as const;

function taperedLevelMultiplier(level: number, lateGrowth: number): number {
  const steps = Math.max(0, Math.floor(level) - 1);
  const earlySteps = Math.min(steps, ENEMY_EARLY_GROWTH_LEVEL_CAP - 1);
  const lateSteps = Math.max(0, steps - earlySteps);
  return 1 + earlySteps * ENEMY_LEVEL_STAT_GROWTH + lateSteps * lateGrowth;
}

export function getEnemyLevelStatMultipliers(level: number) {
  return {
    hpLevelMultiplier: taperedLevelMultiplier(level, ENEMY_LATE_LEVEL_GROWTH.hp),
    damageLevelMultiplier: taperedLevelMultiplier(level, ENEMY_LATE_LEVEL_GROWTH.damage),
    defenseLevelMultiplier: taperedLevelMultiplier(level, ENEMY_LATE_LEVEL_GROWTH.defense),
    speedLevelMultiplier: taperedLevelMultiplier(level, ENEMY_LATE_LEVEL_GROWTH.speed),
  };
}
