import type { CombatUnit, CombatVisualEvent } from "./combatTypes";

export type CombatHealthState = "healthy" | "wounded" | "critical" | "defeated";
export type CombatImpactKind = "none" | "hit" | "heavy" | "critical" | "defeat";

export interface CombatImpactSummary {
  kind: CombatImpactKind;
  critical: boolean;
  defeatedTargetIds: string[];
  maxDamageRatio: number;
  shakeStrength: number;
}

export function getCombatHealthState(currentHP: number, maxHP: number): CombatHealthState {
  if (currentHP <= 0) return "defeated";
  if (maxHP <= 0) return "critical";
  const ratio = currentHP / maxHP;
  if (ratio <= 0.3) return "critical";
  if (ratio <= 0.6) return "wounded";
  return "healthy";
}

export function getCombatImpactSummary(event: CombatVisualEvent | null | undefined, units: readonly CombatUnit[]): CombatImpactSummary {
  if (!event || event.kind !== "skill" || !event.effects.length) return { kind: "none", critical: false, defeatedTargetIds: [], maxDamageRatio: 0, shakeStrength: 0 };
  const byId = new Map(units.map((unit) => [unit.combatantId, unit]));
  let maxDamageRatio = 0;
  let critical = false;
  const defeatedTargetIds: string[] = [];
  let anyHit = false;
  for (const effect of event.effects) {
    if (!effect.hit || effect.damage <= 0) continue;
    anyHit = true;
    critical ||= effect.critical;
    const target = byId.get(effect.targetId);
    if (target) {
      maxDamageRatio = Math.max(maxDamageRatio, effect.damage / Math.max(1, target.maxHP));
      if (!target.isAlive || target.currentHP <= 0) defeatedTargetIds.push(target.combatantId);
    }
  }
  const uniqueDefeated = [...new Set(defeatedTargetIds)];
  if (uniqueDefeated.length) return { kind: "defeat", critical, defeatedTargetIds: uniqueDefeated, maxDamageRatio, shakeStrength: 3 };
  if (critical) return { kind: "critical", critical, defeatedTargetIds: [], maxDamageRatio, shakeStrength: 3 };
  if (maxDamageRatio >= 0.25) return { kind: "heavy", critical: false, defeatedTargetIds: [], maxDamageRatio, shakeStrength: 2 };
  if (anyHit) return { kind: "hit", critical: false, defeatedTargetIds: [], maxDamageRatio, shakeStrength: 1 };
  return { kind: "none", critical: false, defeatedTargetIds: [], maxDamageRatio, shakeStrength: 0 };
}
