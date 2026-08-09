import type { CombatUnit } from "../src/game/combat/combatTypes";
import type { RandomSource } from "../src/utils/random";
export function combatUnit(id: string, side: CombatUnit["side"] = "heroes", overrides: Partial<CombatUnit> = {}): CombatUnit {
  return { combatantId: id, side, currentHP: 100, maxHP: 100, stats: { physicalDamage: 80, physicalDefense: 50, magicDamage: 60, magicDefense: 40, speed: 20, evasion: 0, criticalChance: 0, accuracy: 0, healingPower: 0, physicalAttackBonus: 5, magicAttackBonus: 5, armorClass: 14, magicDefenseScore: 14, attackRollModifier: 0, rangedAttackRollModifier: 0 }, activeConditions: [], activeModifiers: [], isAlive: true, position: { x: side === "heroes" ? 1 : 5, y: 2 }, movementRange: 3, ...overrides };
}
export function sequenceRandom(values: number[]): RandomSource {
  let index = 0;
  const next = () => values[index++] ?? 0;
  return { next, int: (min, max) => Math.floor(next() * (max - min + 1)) + min, pick: <T>(items: readonly T[]) => items[Math.min(items.length - 1, Math.floor(next() * items.length))] as T };
}
