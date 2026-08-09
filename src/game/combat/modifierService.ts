import type { CombatUnit } from "./combatTypes";
import type { SkillModifier } from "./skillTypes";

export function applySkillModifiers(base: number, stat: string, modifiers: readonly SkillModifier[]): number {
  const applicable = modifiers.filter((modifier) => modifier.stat === stat);
  const withFlat = base + applicable.filter((modifier) => modifier.operation === "flat").reduce((sum, modifier) => sum + modifier.value, 0);
  const percentage = applicable.filter((modifier) => modifier.operation === "percentage").reduce((sum, modifier) => sum + modifier.value, 0);
  return withFlat * (1 + percentage);
}
export function getModifiedCombatStat(unit: CombatUnit, stat: keyof CombatUnit["stats"], external: readonly SkillModifier[] = []): number {
  return applySkillModifiers(unit.stats[stat], stat, [...unit.activeModifiers, ...external]);
}
export function advanceSkillModifiers(unit: CombatUnit): CombatUnit {
  return { ...unit, activeModifiers: unit.activeModifiers.map((modifier) => modifier.durationTurns < 0 ? modifier : { ...modifier, durationTurns: modifier.durationTurns - 1 }).filter((modifier) => modifier.durationTurns !== 0) };
}
