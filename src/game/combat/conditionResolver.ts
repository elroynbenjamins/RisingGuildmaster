import { COMBAT_CONDITIONS } from "../../data/conditions/combatConditions";
import type { ActiveCombatCondition, CombatUnit } from "./combatTypes";
import { combineD20RollModes, type D20RollMode } from "./dice/d20RollMode";

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
    if (!definition) return sum;
    if (stat === "physicalDamage") return sum + (definition.physicalDamageModifier ?? 0);
    if (stat === "magicDamage") return sum + (definition.magicDamageModifier ?? 0);
    if (stat === "speed") return sum + (definition.speedModifier ?? 0);
    return sum;
  }, 0);
}

export function getConditionFlatModifier(unit: CombatUnit, stat: string): number {
  return unit.activeConditions.reduce((sum, active) => {
    const definition = COMBAT_CONDITIONS[active.conditionId];
    if (!definition) return sum;
    if (stat === "attackRollModifier") return sum + (definition.attackRollModifier ?? 0);
    if (stat === "armorClass") return sum + (definition.armorClassModifier ?? 0);
    if (stat === "magicDefenseScore") return sum + (definition.magicDefenseScoreModifier ?? 0);
    return sum;
  }, 0);
}

export function getEffectiveMovementRange(unit: CombatUnit): number {
  const definitions = unit.activeConditions.map((active) => COMBAT_CONDITIONS[active.conditionId]).filter(Boolean);
  const overrides = definitions.map((definition) => definition.movementRangeOverride).filter((value): value is number => value !== undefined);
  if (overrides.length) return Math.max(0, Math.min(...overrides));
  return Math.max(0, unit.movementRange + definitions.reduce((sum, definition) => sum + (definition.movementRangeModifier ?? 0), 0));
}

export function blocksMagicSkills(unit: CombatUnit): boolean { return unit.activeConditions.some((active) => COMBAT_CONDITIONS[active.conditionId]?.blocksMagicSkills); }

export function getConditionAttackRollMode(unit: CombatUnit): D20RollMode {
  return combineD20RollModes(...unit.activeConditions.map((active) => COMBAT_CONDITIONS[active.conditionId]?.attackRollMode));
}

export function getConditionAttacksAgainstRollMode(unit: CombatUnit): D20RollMode {
  return combineD20RollModes(...unit.activeConditions.map((active) => COMBAT_CONDITIONS[active.conditionId]?.attacksAgainstRollMode));
}
