import { CLASSES } from "../../../data/classes/classes";
import { SUBCLASSES } from "../../../data/subclasses/subclasses";
import type { Hero } from "../../heroes/types";
import type { ModifierTarget } from "../../modifiers/types";
import { validateSubclassSelection } from "./subclassValidator";
import type { CombatSkillDefinition } from "../../combat/skillTypes";
import { CLASS_SKILL_TREES } from "../../../data/skills/classSkillTrees";
import { getLearnedClassSkillIds } from "../skills/skillProgressionService";
import { MASTERIES } from "../../../data/masteries/masteries";
export function getSubclassChoices(hero: Hero) { return Object.values(SUBCLASSES).filter((definition) => definition.baseClassId === hero.classId); }
export function selectSubclass(hero: Hero, subclassId: string): Hero { const errors = validateSubclassSelection(hero, subclassId); if (errors.length) throw new Error(errors.join(", ")); return { ...hero, subclassId }; }
export function getHeroSkillIds(hero: Hero): string[] { return [CLASS_SKILL_TREES[hero.classId].basicSkillId, ...getLearnedClassSkillIds(hero), ...(hero.subclassId ? SUBCLASSES[hero.subclassId]?.addedSkillIds ?? [] : []), ...(hero.masteryId ? MASTERIES[hero.masteryId]?.addedSkillIds ?? [] : [])]; }
export function getSubclassModifierValue(hero: Hero, target: ModifierTarget, operation: "flat" | "percentage", hpRatio = 1): number { return [...(hero.subclassId ? SUBCLASSES[hero.subclassId]?.modifiers ?? [] : []), ...(hero.masteryId ? MASTERIES[hero.masteryId]?.modifiers ?? [] : [])].filter((modifier) => modifier.target === target && modifier.operation === operation && (!modifier.condition || hpRatio <= modifier.condition.value)).reduce((sum, modifier) => sum + modifier.value, 0); }
export function getHeroSkillRange(hero: Hero, skill: CombatSkillDefinition): number { const base = skill.range ?? 1; return base + (base > 1 ? CLASSES[hero.classId].tactical.rangedSkillRangeModifier + getSubclassModifierValue(hero, "rangedSkillRange", "flat") : 0); }
