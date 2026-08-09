import { CLASSES } from "../../data/classes/classes";
import { CONDITIONS } from "../../data/conditions/conditions";
import { EQUIPMENT } from "../../data/equipment/equipment";
import { RACES } from "../../data/races/races";
import { TRAITS } from "../../data/traits/traits";
import { calculateDerivedStats } from "../attributes/derivedStats";
import { applyAttributeModifiers, applyDerivedModifiers } from "../modifiers/modifierEngine";
import type { Modifier } from "../modifiers/types";
import type { CalculatedHero, Hero } from "./types";
import { SUBCLASSES } from "../../data/subclasses/subclasses";

export function collectHeroModifiers(hero: Hero): Modifier[] {
  const equipment = Object.values(hero.equipment).flatMap((id) => id ? (EQUIPMENT[id]?.modifiers ?? []) : []);
  const conditions = hero.conditions.flatMap((instance) => CONDITIONS[instance.conditionId].modifiers);
  return [
    ...RACES[hero.raceId].modifiers,
    ...CLASSES[hero.classId].modifiers,
    ...(hero.subclassId ? SUBCLASSES[hero.subclassId]?.modifiers ?? [] : []),
    ...hero.traitIds.flatMap((id) => TRAITS[id].modifiers),
    ...conditions,
    ...equipment,
  ];
}

export function calculateHero(hero: Hero): CalculatedHero {
  const modifiers = collectHeroModifiers(hero);
  // First calculate max HP without HP-ratio effects, then use it as conditional context.
  const initialAttributes = applyAttributeModifiers(hero.baseAttributes, modifiers);
  const initialStats = applyDerivedModifiers(calculateDerivedStats(initialAttributes), modifiers);
  const context = { currentHP: hero.currentHP, maxHP: initialStats.maxHP };
  const attributes = applyAttributeModifiers(hero.baseAttributes, modifiers, context);
  const stats = applyDerivedModifiers(calculateDerivedStats(attributes), modifiers, context);
  return { attributes, stats };
}
