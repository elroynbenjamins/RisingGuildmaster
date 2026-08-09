import { CONDITIONS } from "../../data/conditions/conditions";
import type { ConditionId, ConditionInstance } from "../heroes/types";

export function addCondition(current: readonly ConditionInstance[], conditionId: ConditionId): ConditionInstance[] {
  const definition = CONDITIONS[conditionId];
  if (!definition.stackable && current.some((item) => item.conditionId === conditionId)) {
    return current.map((item) => item.conditionId === conditionId ? { ...item, remainingDuration: definition.durationDays } : item);
  }
  return [...current, { conditionId, remainingDuration: definition.durationDays }];
}

export function advanceConditions(current: readonly ConditionInstance[], days = 1): ConditionInstance[] {
  if (days < 0) throw new Error("Days cannot be negative");
  return current.map((item) => ({ ...item, remainingDuration: item.remainingDuration - days })).filter((item) => item.remainingDuration > 0);
}
