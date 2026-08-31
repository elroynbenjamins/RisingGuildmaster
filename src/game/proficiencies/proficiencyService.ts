import type { BackgroundId, ClassId, Hero } from "../heroes/types";
import type { SkillId } from "./proficiencyTypes";

export const CLASS_SKILL_PROFICIENCIES: Record<ClassId, readonly SkillId[]> = { warrior: ["athletics", "intimidation"], ranger: ["survival", "perception"], mage: ["arcana", "history"], cleric: ["religion", "medicine"], paladin: ["persuasion", "religion"], berserker: ["athletics", "survival"], monk: ["acrobatics", "insight"], bard: ["performance", "persuasion"], spellbow: ["arcana", "perception"], bulwark: ["athletics", "insight"], summoner:["arcana","animal_handling"] };
export const BACKGROUND_SKILL_PROFICIENCIES: Record<BackgroundId, readonly SkillId[]> = { farmhand: ["animal_handling", "nature"], scholar: ["history", "investigation"], street_urchin: ["stealth", "sleight_of_hand"], noble: ["persuasion", "history"], mercenary: ["athletics", "intimidation"] };
export function getProficiencyBonus(level: number): number { return 2 + Math.floor((Math.max(1, Math.min(20, level)) - 1) / 4); }
export function generateSkillProficiencies(classId: ClassId, backgroundId: BackgroundId): SkillId[] { return [...new Set([...CLASS_SKILL_PROFICIENCIES[classId], ...BACKGROUND_SKILL_PROFICIENCIES[backgroundId]])]; }
export function getSkillProficiencyMultiplier(hero: Hero, skillId: SkillId): number { const proficiencies = hero.skillProficiencyIds ?? generateSkillProficiencies(hero.classId, hero.backgroundId ?? "mercenary"); return hero.skillExpertiseIds?.includes(skillId) ? 2 : proficiencies.includes(skillId) ? 1 : 0; }
export function getHeroSkillBonus(hero: Hero, skillId: SkillId): number { return getProficiencyBonus(hero.level) * getSkillProficiencyMultiplier(hero, skillId); }
