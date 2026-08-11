import type { Attributes } from "../attributes/types";
export function calculateD20AbilityModifier(attribute: number): number { return Math.floor((attribute - 10) / 2); }
export function calculateEnemyInitiativeBonus(speed: number): number { return Math.floor((speed - 10) / 4); }
export function calculatePhysicalAttackBonus(attributes: Attributes, level: number): number { return Math.floor(attributes.strength / 4) + Math.floor(attributes.dexterity / 6) + level; }
export function calculateMagicAttackBonus(attributes: Attributes, level: number): number { return Math.floor(attributes.intelligence / 4) + Math.floor(attributes.wisdom / 6) + level; }
export function calculateArmorClass(attributes: Attributes, equipmentArmorClass = 0, modifier = 0): number { return 10 + Math.floor(attributes.dexterity / 5) + Math.floor(attributes.constitution / 5) + equipmentArmorClass + modifier; }
export function calculateMagicDefenseScore(attributes: Attributes, equipmentMagicDefense = 0, modifier = 0): number { return 10 + Math.floor(attributes.wisdom / 4) + Math.floor(attributes.intelligence / 6) + equipmentMagicDefense + modifier; }
