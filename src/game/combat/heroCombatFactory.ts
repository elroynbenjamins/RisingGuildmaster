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
import { calculateArmorClass, calculateD20AbilityModifier, calculateMagicAttackBonus, calculateMagicDefenseScore, calculatePhysicalAttackBonus } from "./tacticalStats";
import { calculateMovementRange } from "./grid/movementService";
import { getTraitFlat, getTraitPercentage } from "../traits/traitService";
import { getBackgroundModifier } from "../../data/backgrounds/backgrounds";
import { getEquipmentSpecialModifierValue, getHeroIgnoredTerrainMovementCosts } from "../equipment/equipmentSpecialEffectService";
import { getPersistentConditionModifierValue } from "../conditions/conditionService";
import { CONDITIONS } from "../../data/conditions/conditions";
import { resolveEquipmentDefinition } from "../equipment/equipmentResolver";

function equipmentModifier(hero: Hero, target: string, operation: "flat" | "percentage"): number {
  return Object.values(hero.equipment).reduce((sum, key) => sum + (key ? resolveEquipmentDefinition(key)?.modifiers.filter((modifier) => modifier.target === target && modifier.operation === operation).reduce((value, modifier) => value + modifier.value, 0) ?? 0 : 0), 0);
}

function persistentConditionCombatModifiers(hero: Hero): SkillModifier[] {
  const modifiers: SkillModifier[] = [];
  for (const stat of ["physicalDamage", "magicDamage", "damage", "healingReceived"] as const) {
    const value = hero.conditions.reduce((sum, condition) => {
      const tacticalDefinition = COMBAT_CONDITIONS[condition.conditionId];
      if (stat === "physicalDamage" && tacticalDefinition?.physicalDamageModifier !== undefined) return sum;
      if (stat === "magicDamage" && tacticalDefinition?.magicDamageModifier !== undefined) return sum;
      return sum + CONDITIONS[condition.conditionId].modifiers.filter((modifier) => modifier.target === stat && modifier.operation === "percentage").reduce((conditionSum, modifier) => conditionSum + modifier.value, 0);
    }, 0);
    if (value) modifiers.push({ stat, operation: "percentage", value, durationTurns: -1 });
  }
  for (const stat of ["attackRoll", "armorClass", "magicDefenseScore"] as const) {
    const value = getPersistentConditionModifierValue(hero.conditions, stat, "flat");
    if (value) modifiers.push({ stat: stat === "attackRoll" ? "attackRollModifier" : stat, operation: "flat", value, durationTurns: -1 });
  }
  return modifiers;
}

export function createHeroCombatInstance(hero: Hero): HeroCombatInstance {
  const calculated = calculateHero(hero); const maxMana = calculateMaxMana(calculated.attributes); const maxStamina = calculateMaxStamina(calculated.attributes);
  const activeConditions = hero.conditions.filter((item) => COMBAT_CONDITIONS[item.conditionId]).map((item) => ({ conditionId: item.conditionId, remainingTurns: item.remainingDuration }));
  const movement = calculateMovementRange(calculated.stats.speed, CLASSES[hero.classId], RACES[hero.raceId]) + getSubclassModifierValue(hero, "movementRange", "flat") + getEquipmentSpecialModifierValue(hero, "movementRange", "flat", { currentHP: hero.currentHP, maxHP: calculated.stats.maxHP }) + getPersistentConditionModifierValue(hero.conditions, "movementRange", "flat");
  return { heroId: hero.id, currentHP: Math.min(hero.currentHP, calculated.stats.maxHP), maxHP: calculated.stats.maxHP, currentMana: maxMana, maxMana, currentStamina: maxStamina, maxStamina, activeConditions, activeCooldowns: {}, isAlive: hero.currentHP > 0, position: { x: 0, y: 0 }, movementRange: Math.min(5, Math.max(2, movement)), ignoredTerrainMovementCosts: getHeroIgnoredTerrainMovementCosts(hero) };
}
export function createHeroCombatUnit(hero: Hero, instance: HeroCombatInstance): CombatUnit {
  const calculated = calculateHero(hero); const classDefinition = CLASSES[hero.classId]; const race = RACES[hero.raceId]; const hpRatio = instance.maxHP ? instance.currentHP / instance.maxHP : 0; const equipmentContext = { currentHP: instance.currentHP, maxHP: instance.maxHP };
  return { combatantId: hero.id, side: "heroes", currentHP: instance.currentHP, maxHP: instance.maxHP, stats: {
    physicalDamage: calculated.stats.physicalAttack * (1 + classDefinition.tactical.physicalDamageModifier + getSubclassModifierValue(hero, "physicalDamage", "percentage", hpRatio) + getTraitPercentage(hero, "physicalDamage", { currentHP: instance.currentHP, maxHP: instance.maxHP }) + getBackgroundModifier(hero.backgroundId, "physicalDamage") + equipmentModifier(hero, "physicalDamage", "percentage") + getEquipmentSpecialModifierValue(hero, "physicalDamage", "percentage", equipmentContext)), physicalDefense: calculated.stats.physicalDefense,
    magicDamage: calculated.stats.magicPower * (1 + classDefinition.tactical.magicDamageModifier + getSubclassModifierValue(hero, "magicPower", "percentage", hpRatio) + getTraitPercentage(hero, "magicDamage", equipmentContext) + getEquipmentSpecialModifierValue(hero, "magicDamage", "percentage", equipmentContext)), magicDefense: calculated.stats.magicDefense,
    speed: calculated.stats.speed, initiativeBonus: calculateD20AbilityModifier(calculated.attributes.dexterity) + getTraitFlat(hero, "initiative", equipmentContext) + getEquipmentSpecialModifierValue(hero, "initiative", "flat", equipmentContext), evasion: 0, criticalChance: calculated.stats.criticalChance, accuracy: 0,
    healingPower: classDefinition.tactical.healingPowerModifier + getSubclassModifierValue(hero, "healingPower", "percentage") + getTraitPercentage(hero, "healingPower", equipmentContext) + getEquipmentSpecialModifierValue(hero, "healingPower", "percentage", equipmentContext),
    physicalAttackBonus: calculatePhysicalAttackBonus(calculated.attributes, hero.level), magicAttackBonus: calculateMagicAttackBonus(calculated.attributes, hero.level),
    armorClass: calculateArmorClass(calculated.attributes, 0, classDefinition.tactical.armorClassModifier + race.tactical.armorClassModifier + getSubclassModifierValue(hero, "armorClass", "flat") + getTraitFlat(hero, "armorClass", equipmentContext) + getEquipmentSpecialModifierValue(hero, "armorClass", "flat", equipmentContext)),
    magicDefenseScore: calculateMagicDefenseScore(calculated.attributes, 0, classDefinition.tactical.magicDefenseScoreModifier + getSubclassModifierValue(hero, "magicDefenseScore", "flat") + getTraitFlat(hero, "magicDefenseScore", equipmentContext) + getEquipmentSpecialModifierValue(hero, "magicDefenseScore", "flat", equipmentContext)),
    attackRollModifier: race.tactical.attackRollModifier + equipmentModifier(hero, "attackRoll", "flat"), rangedAttackRollModifier: race.tactical.rangedAttackRollModifier + getSubclassModifierValue(hero, "rangedAttackRoll", "flat"),
  }, activeConditions: instance.activeConditions, activeModifiers: [...getHeroPermanentPassiveModifiers(hero).map((modifier) => ({ ...modifier, sourceSkillId: "class_or_subclass_passive" })), ...persistentConditionCombatModifiers(hero).map((modifier) => ({ ...modifier, sourceSkillId: "persistent_condition" }))], isAlive: instance.isAlive, position: instance.position, movementRange: instance.movementRange, ignoredTerrainMovementCosts: instance.ignoredTerrainMovementCosts ?? getHeroIgnoredTerrainMovementCosts(hero) };
}
export function getHeroPermanentPassiveModifiers(hero: Hero): SkillModifier[] { return getHeroSkillIds(hero).flatMap((id) => HERO_SKILLS[id]?.type === "passive" ? HERO_SKILLS[id]?.selfModifiers ?? [] : []); }
export function getHeroConditionalPassiveModifiers(hero: Hero, self: CombatUnit): SkillModifier[] { const ratio = self.maxHP > 0 ? self.currentHP / self.maxHP : 0; return getHeroSkillIds(hero).flatMap((id) => HERO_SKILLS[id]?.conditionalModifiers ?? []).filter((entry) => (entry.conditions.selfHpRatioMin === undefined || ratio >= entry.conditions.selfHpRatioMin) && (entry.conditions.selfHpRatioMax === undefined || ratio <= entry.conditions.selfHpRatioMax)).flatMap((entry) => entry.modifiers); }
