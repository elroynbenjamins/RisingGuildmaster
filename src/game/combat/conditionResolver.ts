import { COMBAT_CONDITIONS } from "../../data/conditions/combatConditions";
import type { ActiveCombatCondition, CombatUnit } from "./combatTypes";

export function applyCombatCondition(current: readonly ActiveCombatCondition[], conditionId: string, durationTurns: number): ActiveCombatCondition[] {
  const definition = COMBAT_CONDITIONS[conditionId];
  if (!definition) throw new Error(`Unknown combat condition: ${conditionId}`);
  if (!definition.stackable && current.some((item) => item.conditionId === conditionId)) return current.map((item) => item.conditionId === conditionId ? { ...item, remainingTurns: durationTurns } : item);
  return [...current, { conditionId, remainingTurns: durationTurns }];
}

export function resolveStartOfTurnConditions(unit: CombatUnit): { unit: CombatUnit; skipTurn: boolean; damage: number } {
  let damage = 0;
  let skipTurn = false;
  for (const active of unit.activeConditions) {
    const definition = COMBAT_CONDITIONS[active.conditionId];
    if (!definition) continue;
    skipTurn ||= definition.skipTurn ?? false;
    if (definition.damageMaxHpModifierPerTurn) damage += Math.max(1, Math.round(unit.maxHP * definition.damageMaxHpModifierPerTurn));
  }
  const currentHP = Math.max(0, unit.currentHP - damage);
  return { unit: { ...unit, currentHP, isAlive: currentHP > 0 }, skipTurn, damage };
}

export function advanceCombatConditions(current: readonly ActiveCombatCondition[]): ActiveCombatCondition[] { return current.map((item) => ({ ...item, remainingTurns: item.remainingTurns - 1 })).filter((item) => item.remainingTurns > 0); }

export function getConditionStatPercentage(unit: CombatUnit, stat: string): number {
  return unit.activeConditions.reduce((sum, active) => {
    const definition = COMBAT_CONDITIONS[active.conditionId];
    return sum + (stat === "physicalDamage" ? definition?.physicalDamageModifier ?? 0 : 0);
  }, 0);
}
