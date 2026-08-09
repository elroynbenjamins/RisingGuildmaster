import { CLASSES } from "../../data/classes/classes";
import { COMBAT_CONDITIONS } from "../../data/conditions/combatConditions";
import { HERO_SKILLS } from "../../data/skills/heroSkills";
import { RACES } from "../../data/races/races";
import { calculateHero } from "../heroes/heroCalculator";
import type { Hero } from "../heroes/types";
import { getHeroSkillIds, getSubclassModifierValue } from "../progression/subclasses/subclassService";
import type { CombatUnit, HeroCombatInstance } from "./combatTypes";
import { calculateMaxMana, calculateMaxStamina } from "./resourceService";
import type { SkillModifier } from "./skillTypes";
import { calculateArmorClass, calculateMagicAttackBonus, calculateMagicDefenseScore, calculatePhysicalAttackBonus } from "./tacticalStats";
import { calculateMovementRange } from "./grid/movementService";

export function createHeroCombatInstance(hero: Hero): HeroCombatInstance {
  const calculated = calculateHero(hero); const maxMana = calculateMaxMana(calculated.attributes); const maxStamina = calculateMaxStamina(calculated.attributes);
  const activeConditions = hero.conditions.filter((item) => COMBAT_CONDITIONS[item.conditionId]).map((item) => ({ conditionId: item.conditionId, remainingTurns: item.remainingDuration }));
  const movement = calculateMovementRange(calculated.stats.speed, CLASSES[hero.classId], RACES[hero.raceId]) + getSubclassModifierValue(hero, "movementRange", "flat");
  return { heroId: hero.id, currentHP: Math.min(hero.currentHP, calculated.stats.maxHP), maxHP: calculated.stats.maxHP, currentMana: maxMana, maxMana, currentStamina: maxStamina, maxStamina, activeConditions, activeCooldowns: {}, isAlive: hero.currentHP > 0, position: { x: 0, y: 0 }, movementRange: Math.min(5, Math.max(2, movement)) };
}
export function createHeroCombatUnit(hero: Hero, instance: HeroCombatInstance): CombatUnit {
  const calculated = calculateHero(hero); const classDefinition = CLASSES[hero.classId]; const race = RACES[hero.raceId]; const hpRatio = instance.maxHP ? instance.currentHP / instance.maxHP : 0;
  return { combatantId: hero.id, side: "heroes", currentHP: instance.currentHP, maxHP: instance.maxHP, stats: {
    physicalDamage: calculated.stats.physicalAttack * (1 + classDefinition.tactical.physicalDamageModifier + getSubclassModifierValue(hero, "physicalDamage", "percentage", hpRatio)), physicalDefense: calculated.stats.physicalDefense,
    magicDamage: calculated.stats.magicPower * (1 + classDefinition.tactical.magicDamageModifier + getSubclassModifierValue(hero, "magicPower", "percentage", hpRatio)), magicDefense: calculated.stats.magicDefense,
    speed: calculated.stats.speed, evasion: 0, criticalChance: calculated.stats.criticalChance, accuracy: 0,
    healingPower: classDefinition.tactical.healingPowerModifier + getSubclassModifierValue(hero, "healingPower", "percentage"),
    physicalAttackBonus: calculatePhysicalAttackBonus(calculated.attributes, hero.level), magicAttackBonus: calculateMagicAttackBonus(calculated.attributes, hero.level),
    armorClass: calculateArmorClass(calculated.attributes, 0, classDefinition.tactical.armorClassModifier + race.tactical.armorClassModifier + getSubclassModifierValue(hero, "armorClass", "flat")),
    magicDefenseScore: calculateMagicDefenseScore(calculated.attributes, 0, classDefinition.tactical.magicDefenseScoreModifier + getSubclassModifierValue(hero, "magicDefenseScore", "flat")),
    attackRollModifier: race.tactical.attackRollModifier, rangedAttackRollModifier: race.tactical.rangedAttackRollModifier + getSubclassModifierValue(hero, "rangedAttackRoll", "flat"),
  }, activeConditions: instance.activeConditions, activeModifiers: getHeroPermanentPassiveModifiers(hero).map((modifier) => ({ ...modifier, sourceSkillId: "class_or_subclass_passive" })), isAlive: instance.isAlive, position: instance.position, movementRange: instance.movementRange };
}
export function getHeroPermanentPassiveModifiers(hero: Hero): SkillModifier[] { return getHeroSkillIds(hero).flatMap((id) => HERO_SKILLS[id]?.type === "passive" ? HERO_SKILLS[id]?.selfModifiers ?? [] : []); }
export function getHeroConditionalPassiveModifiers(hero: Hero, self: CombatUnit): SkillModifier[] { const ratio = self.maxHP > 0 ? self.currentHP / self.maxHP : 0; return getHeroSkillIds(hero).flatMap((id) => HERO_SKILLS[id]?.conditionalModifiers ?? []).filter((entry) => (entry.conditions.selfHpRatioMin === undefined || ratio >= entry.conditions.selfHpRatioMin) && (entry.conditions.selfHpRatioMax === undefined || ratio <= entry.conditions.selfHpRatioMax)).flatMap((entry) => entry.modifiers); }
