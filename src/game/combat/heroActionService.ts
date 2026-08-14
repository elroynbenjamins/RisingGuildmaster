import { HERO_SKILLS } from "../../data/skills/heroSkills";
import type { RandomSource } from "../../utils/random";
import type { Hero } from "../heroes/types";
import { isSkillReady, setSkillCooldown } from "./cooldownService";
import type { CombatUnit, HeroCombatInstance } from "./combatTypes";
import { getHeroConditionalPassiveModifiers } from "./heroCombatFactory";
import { canPaySkillCost, paySkillCost } from "./resourceService";
import { resolveSkill, type ResolveSkillResult } from "./skillResolver";
import { getValidTargets } from "./targetSelector";
import type { CombatSkillDefinition } from "./skillTypes";
import type { CombatBoardState } from "./grid/gridTypes";
import { getTargetsInSkillRange } from "./targetSelector";
import { RACES } from "../../data/races/races";
import { getHeroSkillIds, getHeroSkillRange } from "../progression/subclasses/subclassService";
import { getHeroEquipmentSpecialEffects } from "../equipment/equipmentSpecialEffectService";
import { blocksMagicSkills } from "./conditionResolver";

export interface SkillAvailability { skill: CombatSkillDefinition; enabled: boolean; reasons: string[] }
export function getHeroSkillAvailability(hero: Hero, instance: HeroCombatInstance, actor: CombatUnit, skillId: string, heroes: readonly CombatUnit[], enemies: readonly CombatUnit[], board?: CombatBoardState): SkillAvailability {
  const skill = HERO_SKILLS[skillId]; const reasons: string[] = [];
  if (!skill || !getHeroSkillIds(hero).includes(skillId)) return { skill: skill ?? { id: skillId, name: skillId, type: "active" }, enabled: false, reasons: ["Skill is not available to this class"] };
  if (skill.type === "passive" || skill.type === "aura") reasons.push("Passive skills cannot be selected");
  if (!isSkillReady(instance.activeCooldowns, skill.id)) reasons.push(`${instance.activeCooldowns[skill.id]} turn cooldown remaining`);
  if (!canPaySkillCost(instance, skill)) reasons.push(`Not enough ${skill.resourceType}`);
  if (blocksMagicSkills(actor) && skill.resourceType === "mana") reasons.push("Silenced: mana-based skills are unavailable");
  const validTargets = skill.targetType ? getValidTargets(skill.targetType, actor, heroes, enemies) : [];
  const inRange = board && skill ? getTargetsInSkillRange(skill, actor, validTargets, board, getHeroSkillRange(hero, skill)) : validTargets;
  if (!skill.targetType || inRange.length === 0) reasons.push("No valid target in range");
  return { skill, enabled: reasons.length === 0, reasons };
}

export function resolveHeroAction(hero: Hero, instance: HeroCombatInstance, actor: CombatUnit, targets: readonly CombatUnit[], skillId: string, random: RandomSource, relationship?: { attackRollModifier: number; physicalDamageModifier: number; healingReceivedModifier(target: CombatUnit): number }): { instance: HeroCombatInstance; actor: CombatUnit; targets: CombatUnit[]; skillResult: ResolveSkillResult } {
  const skill = HERO_SKILLS[skillId]; if (!skill || !getHeroSkillIds(hero).includes(skillId)) throw new Error("Invalid hero skill");
  if (blocksMagicSkills(actor) && skill.resourceType === "mana") throw new Error("Silenced heroes cannot use mana-based skills");
  let paid = paySkillCost(instance, skill);
  paid = { ...paid, activeCooldowns: setSkillCooldown(paid.activeCooldowns, skill.id, skill.cooldownTurns ?? 0) };
  const modifiers = getHeroConditionalPassiveModifiers(hero, actor);
  if (relationship?.attackRollModifier) modifiers.push({ stat: "attackRollModifier", operation: "flat", value: relationship.attackRollModifier, durationTurns: -1 });
  if (relationship?.physicalDamageModifier) modifiers.push({ stat: "physicalDamage", operation: "percentage", value: relationship.physicalDamageModifier, durationTurns: -1 });
  if ((skill.range ?? 1) <= 1 && skill.damageType === "physical" && RACES[hero.raceId].tactical.meleeDamageModifier) modifiers.push({ stat: "physicalDamage", operation: "percentage", value: RACES[hero.raceId].tactical.meleeDamageModifier, durationTurns: -1 });
  const equipmentApplications = getHeroEquipmentSpecialEffects(hero).filter((effect) => effect.conditionApplication && ((effect.trigger === "on_physical_hit" && skill.damageType === "physical") || (effect.trigger === "on_magic_hit" && skill.damageType === "magic"))).map((effect) => effect.conditionApplication!);
  const resolvedSkill = equipmentApplications.length ? { ...skill, conditionApplications: [...(skill.conditionApplications ?? []), ...equipmentApplications] } : skill;
  const skillResult = resolveSkill(actor, targets, resolvedSkill, random, { actorModifiers: modifiers, healingReceivedModifier: relationship?.healingReceivedModifier });
  paid = { ...paid, currentHP: skillResult.actor.currentHP, isAlive: skillResult.actor.isAlive, activeConditions: skillResult.actor.activeConditions };
  return { instance: paid, actor: skillResult.actor, targets: skillResult.targets, skillResult };
}
