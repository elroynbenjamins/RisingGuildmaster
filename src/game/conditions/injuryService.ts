import type { ConditionId, ConditionInstance } from "../heroes/types";
import { addCondition } from "./conditionService";

export type InjurySeverity = "minor" | "major";

export const OUTCOME_INJURY_POOLS: Record<InjurySeverity, readonly ConditionId[]> = {
  minor: ["sprained_ankle", "concussion", "cracked_ribs"],
  major: ["broken_arm", "cracked_ribs", "concussion", "deep_wound"],
};

function stableIndex(value: string, length: number): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

/** Selects a reproducible wound without consuming quest reward RNG. */
export function selectOutcomeInjury(heroId: string, severity: InjurySeverity): ConditionId {
  const pool = OUTCOME_INJURY_POOLS[severity];
  return pool[stableIndex(`${heroId}:${severity}`, pool.length)]!;
}

export function applyOutcomeInjury(current: readonly ConditionInstance[], heroId: string, severity: InjurySeverity): ConditionInstance[] {
  return addCondition(current, selectOutcomeInjury(heroId, severity));
}
