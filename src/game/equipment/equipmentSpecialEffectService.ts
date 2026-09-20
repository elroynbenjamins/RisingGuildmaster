import { ENCHANTMENTS } from "../../data/crafting/enchantments";
import { EQUIPMENT_SPECIAL_EFFECTS } from "../../data/equipment/specialEffects";
import type { Hero } from "../heroes/types";
import type { Modifier, ModifierContext, ModifierTarget } from "../modifiers/types";
import { applyModifiers } from "../modifiers/modifierEngine";
import { resolveEquipmentDefinition } from "./equipmentResolver";
import type { EquipmentSpecialEffectDefinition } from "./specialEffectTypes";
import type { ConditionId } from "../heroes/types";
import type { TerrainType } from "../combat/grid/gridTypes";
import type { DamageType, SkillModifier } from "../combat/skillTypes";

export function getHeroEquipmentSpecialEffects(hero: Hero): EquipmentSpecialEffectDefinition[] {
  const seen = new Set<string>();
  return Object.values(hero.equipment).flatMap((key) => key ? resolveEquipmentDefinition(key)?.specialEffectIds ?? [] : []).flatMap((id) => {
    if (id.startsWith("enchantment:") || seen.has(id)) return [];
    seen.add(id); const definition = EQUIPMENT_SPECIAL_EFFECTS[id]; return definition ? [definition] : [];
  });
}

export function getHeroEquipmentSpecialModifiers(hero: Hero): Modifier[] { return getHeroEquipmentSpecialEffects(hero).flatMap((effect) => effect.modifiers); }
export function getHeroEquipmentConditionResistance(hero: Hero, conditionId: ConditionId): number { return Math.min(1, Math.max(0, getHeroEquipmentSpecialEffects(hero).reduce((sum, effect) => sum + (effect.conditionResistanceModifiers?.[conditionId] ?? 0), 0))); }
export function getHeroIgnoredTerrainMovementCosts(hero: Hero): TerrainType[] { return [...new Set(getHeroEquipmentSpecialEffects(hero).flatMap((effect) => effect.ignoredTerrainMovementCosts ?? []))]; }
export function getHeroReactiveDefenseModifiers(hero: Hero, incomingDamageType: DamageType): SkillModifier[] {
  const trigger = incomingDamageType === "magic" ? "after_receiving_magic_hit" : incomingDamageType === "physical" ? "after_receiving_physical_hit" : null;
  if (!trigger) return [];
  return getHeroEquipmentSpecialEffects(hero).filter((effect) => effect.trigger === trigger && effect.nextIncomingDamageReduction).map((effect) => ({ stat: "nextIncomingDamage", operation: "percentage", value: -Math.min(.50, Math.max(0, effect.nextIncomingDamageReduction!)), durationTurns: -1 }));
}
export function getEquipmentSpecialModifierValue(hero: Hero, target: ModifierTarget, operation: Modifier["operation"], context: ModifierContext = {}): number {
  const modifiers = getHeroEquipmentSpecialModifiers(hero).filter((item) => item.target === target && item.operation === operation);
  return operation === "flat" ? applyModifiers(0, target, modifiers, context) : applyModifiers(1, target, modifiers, context) - 1;
}
export function describeEquipmentSpecialEffect(id: string): { name: string; description: string } | undefined {
  if (id.startsWith("enchantment:")) { const enchantment = ENCHANTMENTS[id.slice("enchantment:".length)]; return enchantment ? { name: enchantment.name, description: enchantment.description } : undefined; }
  const effect = EQUIPMENT_SPECIAL_EFFECTS[id]; return effect ? { name: effect.name, description: effect.description } : undefined;
}
