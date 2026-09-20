import type { CombatStats } from "./combatTypes";
import type { CombatSkillDefinition } from "./skillTypes";

export const BASE_HIT_CHANCE = 0.90;
export const CRITICAL_DAMAGE_MULTIPLIER = 1.50;
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export function calculateHitChance(skill: CombatSkillDefinition, targetEvasion: number, attackerAccuracy = 0): number {
  return clamp(BASE_HIT_CHANCE + attackerAccuracy + (skill.accuracyModifier ?? 0) - targetEvasion, 0.05, 0.95);
}

export function calculateCriticalChance(attackerCriticalChance: number, skill: CombatSkillDefinition): number {
  return clamp(attackerCriticalChance + (skill.criticalChanceModifier ?? 0), 0, 1);
}

export function calculateSkillDamage(attacker: CombatStats, defender: CombatStats, skill: CombatSkillDefinition, critical = false, damageModifier = 0): number {
  if (!skill.damageType || skill.damageMultiplier === undefined) return 0;
  const attack = skill.damageType === "magic" ? attacker.magicDamage : attacker.physicalDamage;
  const rawDamage = attack * skill.damageMultiplier * (1 + damageModifier);
  const defense = skill.damageType === "physical" ? defender.physicalDefense : skill.damageType === "magic" ? defender.magicDefense : 0;
  const afterDefense = rawDamage * (skill.damageType === "true" ? 1 : 100 / (100 + Math.max(0, defense)));
  return Math.max(1, Math.round(afterDefense * (critical ? CRITICAL_DAMAGE_MULTIPLIER : 1)));
}
