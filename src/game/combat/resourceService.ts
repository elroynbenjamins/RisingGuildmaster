import type { Attributes } from "../attributes/types";
import type { HeroCombatInstance } from "./combatTypes";
import type { CombatSkillDefinition } from "./skillTypes";

export function calculateMaxMana(attributes: Attributes): number { return 20 + attributes.intelligence * 3 + attributes.wisdom * 2; }
export function calculateMaxStamina(attributes: Attributes): number { return 30 + attributes.constitution * 2 + attributes.strength * 2 + attributes.dexterity; }
export function regenerateHeroResources(instance: HeroCombatInstance): HeroCombatInstance {
  return { ...instance, currentMana: Math.min(instance.maxMana, instance.currentMana + Math.max(1, Math.round(instance.maxMana * .05))), currentStamina: Math.min(instance.maxStamina, instance.currentStamina + Math.max(1, Math.round(instance.maxStamina * .10))) };
}
export function recoverBetweenEncounters(instance: HeroCombatInstance, hpRecoveryRatio = 0): HeroCombatInstance {
  return { ...instance, currentHP: Math.min(instance.maxHP, instance.currentHP + Math.round(instance.maxHP * Math.max(0, hpRecoveryRatio))), currentMana: Math.min(instance.maxMana, instance.currentMana + Math.round(instance.maxMana * .10)), currentStamina: Math.min(instance.maxStamina, instance.currentStamina + Math.round(instance.maxStamina * .20)) };
}
export function canPaySkillCost(instance: HeroCombatInstance, skill: CombatSkillDefinition): boolean {
  const cost = skill.resourceCost ?? 0;
  return skill.resourceType === "mana" ? instance.currentMana >= cost : skill.resourceType === "stamina" ? instance.currentStamina >= cost : true;
}
export function paySkillCost(instance: HeroCombatInstance, skill: CombatSkillDefinition): HeroCombatInstance {
  if (!canPaySkillCost(instance, skill)) throw new Error(`Not enough ${skill.resourceType ?? "resource"}`);
  const cost = skill.resourceCost ?? 0;
  if (skill.resourceType === "mana") return { ...instance, currentMana: instance.currentMana - cost };
  if (skill.resourceType === "stamina") return { ...instance, currentStamina: instance.currentStamina - cost };
  return instance;
}
