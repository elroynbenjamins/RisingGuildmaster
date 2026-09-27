import type { Attributes } from "../attributes/types";
import { calculateAbilityModifier } from "../attributes/dndAttributes";
export { calculateAbilityModifier as calculateD20AbilityModifier } from "../attributes/dndAttributes";

/** Normal player-character D&D ability scores are bounded at 20 for roll math. */
export function calculatePlayerD20AbilityModifier(score: number): number {
  return calculateAbilityModifier(Math.min(20, score));
}

/** D&D 5e-style proficiency: +2 at 1-4, +3 at 5-8, ... +6 at 17-20+. */
export function calculateProficiencyBonus(level: number): number {
  return Math.min(6, 2 + Math.floor((Math.max(1, Math.floor(level)) - 1) / 4));
}

export function calculateEnemyInitiativeBonus(speed: number): number { return Math.floor((speed - 10) / 4); }

/**
 * Physical attacks use the better of Strength or Dexterity, matching the
 * project's mix of melee, finesse and ranged physical classes.
 */
export function calculatePhysicalAttackBonus(attributes: Attributes, level: number): number {
  return Math.max(calculatePlayerD20AbilityModifier(attributes.strength), calculatePlayerD20AbilityModifier(attributes.dexterity)) + calculateProficiencyBonus(level);
}

/** Spell attacks use the hero's best supported spellcasting attribute. */
export function calculateMagicAttackBonus(attributes: Attributes, level: number): number {
  return Math.max(
    calculatePlayerD20AbilityModifier(attributes.intelligence),
    calculatePlayerD20AbilityModifier(attributes.wisdom),
    calculatePlayerD20AbilityModifier(attributes.charisma),
  ) + calculateProficiencyBonus(level);
}

/**
 * Enemies do not own D&D ability-score blocks, so their authored stat block
 * contributes a modest fixed ability-equivalent modifier plus proficiency.
 */
export function calculateEnemyPhysicalAttackBonus(level: number, difficultyModifier = 0): number {
  return calculateProficiencyBonus(level) + 2 + difficultyModifier;
}
export function calculateEnemyMagicAttackBonus(level: number, difficultyModifier = 0): number {
  return calculateProficiencyBonus(level) + 1 + difficultyModifier;
}

export function calculateArmorClass(attributes: Attributes, equipmentArmorClass = 0, modifier = 0): number { return 10 + Math.floor(attributes.dexterity / 5) + Math.floor(attributes.constitution / 5) + equipmentArmorClass + modifier; }
export function calculateMagicDefenseScore(attributes: Attributes, equipmentMagicDefense = 0, modifier = 0): number { return 10 + Math.floor(attributes.wisdom / 4) + Math.floor(attributes.intelligence / 6) + equipmentMagicDefense + modifier; }
