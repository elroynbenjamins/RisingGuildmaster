import { ATTRIBUTE_KEYS, type Attributes, type DerivedStats } from "../attributes/types";
import type { Modifier, ModifierContext, ModifierTarget } from "./types";

export function isModifierActive(modifier: Modifier, context: ModifierContext): boolean {
  if (!modifier.condition) return true;
  if (modifier.condition.type === "hpRatioAtMost") {
    if (context.currentHP === undefined || !context.maxHP) return false;
    return context.currentHP / context.maxHP <= modifier.condition.value;
  }
  return false;
}

export function applyModifiers(base: number, target: ModifierTarget, modifiers: readonly Modifier[], context: ModifierContext = {}): number {
  const applicable = modifiers.filter((m) => m.target === target && isModifierActive(m, context));
  const withFlat = base + applicable.filter((m) => m.operation === "flat").reduce((sum, m) => sum + m.value, 0);
  const percentage = applicable.filter((m) => m.operation === "percentage").reduce((sum, m) => sum + m.value, 0);
  return withFlat * (1 + percentage);
}

export function applyAttributeModifiers(base: Attributes, modifiers: readonly Modifier[], context: ModifierContext = {}): Attributes {
  return Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, applyModifiers(base[key], key, modifiers, context)])) as unknown as Attributes;
}

export function applyDerivedModifiers(base: DerivedStats, modifiers: readonly Modifier[], context: ModifierContext = {}): DerivedStats {
  return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, applyModifiers(value, key as keyof DerivedStats, modifiers, context)])) as unknown as DerivedStats;
}
