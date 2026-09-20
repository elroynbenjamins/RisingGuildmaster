import { TRAITS } from "../../data/traits/traits";
import type { Hero } from "../heroes/types";
import { isModifierActive } from "../modifiers/modifierEngine";
import type { Modifier, ModifierContext, ModifierTarget } from "../modifiers/types";

export function getHeroTraitModifiers(hero: Hero): Modifier[] {
  return hero.traitIds.flatMap((id) => TRAITS[id]?.modifiers ?? []);
}

export function getTraitPercentage(hero: Hero, target: ModifierTarget, context: ModifierContext = {}): number {
  return getHeroTraitModifiers(hero).filter((modifier) => modifier.target === target && modifier.operation === "percentage" && isModifierActive(modifier, context)).reduce((sum, modifier) => sum + modifier.value, 0);
}

export function getTraitFlat(hero: Hero, target: ModifierTarget, context: ModifierContext = {}): number {
  return getHeroTraitModifiers(hero).filter((modifier) => modifier.target === target && modifier.operation === "flat" && isModifierActive(modifier, context)).reduce((sum, modifier) => sum + modifier.value, 0);
}
