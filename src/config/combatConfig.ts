import type { EnemyBaseStats } from "../game/enemies/enemyTypes";
export const ENEMY_BASE_STATS: EnemyBaseStats = { hp: 100, physicalDamage: 24, physicalDefense: 18, magicDamage: 18, magicDefense: 15, speed: 18 };
/** Each enemy level adds 18% to its complete stat line. */
export const ENEMY_LEVEL_STAT_GROWTH = 0.18;
