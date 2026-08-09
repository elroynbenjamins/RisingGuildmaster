import type { EnemyCalculatedStats, EnemyBaseStats, EnemyDefinition, EnemyStatScaling } from "./enemyTypes";

function scaled(base: number, modifier: number, scaling: EnemyStatScaling): number {
  return base * (1 + modifier) * (scaling.levelMultiplier ?? 1) * (scaling.difficultyMultiplier ?? 1);
}

/** Applies definition percentages to shared base stats; level/difficulty scaling remains caller-configurable. */
export function calculateEnemyStats(base: EnemyBaseStats, enemy: EnemyDefinition, scaling: EnemyStatScaling = {}): EnemyCalculatedStats {
  return {
    hp: scaled(base.hp, enemy.hpModifier, scaling),
    physicalDamage: scaled(base.physicalDamage, enemy.physicalDamageModifier, scaling),
    physicalDefense: scaled(base.physicalDefense, enemy.physicalDefenseModifier, scaling),
    magicDamage: scaled(base.magicDamage, enemy.magicDamageModifier, scaling),
    magicDefense: scaled(base.magicDefense, enemy.magicDefenseModifier, scaling),
    speed: scaled(base.speed, enemy.speedModifier, scaling),
  };
}

export function clampResistance(value: number): number { return Math.min(1, Math.max(0, value)); }

export function calculateEffectiveConditionChance(baseChance: number, resistance: number): number {
  const chance = Math.min(1, Math.max(0, baseChance));
  return chance * (1 - clampResistance(resistance));
}

export function getConditionApplicationChance(enemy: EnemyDefinition, conditionId: string, resistanceKey: string, baseChance: number): number {
  if (enemy.conditionImmunities.includes(conditionId)) return 0;
  return calculateEffectiveConditionChance(baseChance, enemy.resistanceModifiers[resistanceKey] ?? 0);
}
