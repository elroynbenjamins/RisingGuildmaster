import type { RandomSource } from "../../utils/random";
import { applyCombatCondition } from "./conditionResolver";
import { getConditionAttackRollMode, getConditionAttacksAgainstRollMode, getConditionFlatModifier, getConditionStatPercentage } from "./conditionResolver";
import { calculateSkillDamage } from "./damageCalculator";
import { rollAttack } from "./dice/attackRoll";
import { applySkillModifiers, getModifiedCombatStat } from "./modifierService";
import type { CombatStats, CombatUnit, SkillHitResult, SkillResolution } from "./combatTypes";
import type { CombatSkillDefinition, SkillModifier } from "./skillTypes";
import { combineD20RollModes, type D20RollMode } from "./dice/d20RollMode";

export interface ResolveSkillOptions {
  actorModifiers?: SkillModifier[];
  healingReceivedModifier?: (target: CombatUnit) => number;
  conditionChance?: (target: CombatUnit, conditionId: string, baseChance: number, resistanceKey?: string) => number;
  reactiveDefenseModifiers?: (target: CombatUnit, incomingDamageType: NonNullable<CombatSkillDefinition["damageType"]>) => SkillModifier[];
  attackRollMode?: D20RollMode;
}
export interface ResolveSkillResult { actor: CombatUnit; targets: CombatUnit[]; resolution: SkillResolution }

function effectiveStats(unit: CombatUnit, external: readonly SkillModifier[] = []): CombatStats {
  const conditionModifiers: SkillModifier[] = [];
  for (const stat of ["physicalDamage", "magicDamage", "speed"] as const) { const value = getConditionStatPercentage(unit, stat); if (value) conditionModifiers.push({ stat, operation: "percentage", value, durationTurns: -1 }); }
  for (const stat of ["attackRollModifier", "armorClass", "magicDefenseScore"] as const) { const value = getConditionFlatModifier(unit, stat); if (value) conditionModifiers.push({ stat, operation: "flat", value, durationTurns: -1 }); }
  const modifiers = [...external, ...conditionModifiers];
  return {
    physicalDamage: getModifiedCombatStat(unit, "physicalDamage", modifiers), physicalDefense: getModifiedCombatStat(unit, "physicalDefense", modifiers),
    magicDamage: getModifiedCombatStat(unit, "magicDamage", modifiers), magicDefense: getModifiedCombatStat(unit, "magicDefense", modifiers),
    speed: getModifiedCombatStat(unit, "speed", modifiers), initiativeBonus: unit.stats.initiativeBonus, evasion: getModifiedCombatStat(unit, "evasion", modifiers),
    criticalChance: getModifiedCombatStat(unit, "criticalChance", modifiers), accuracy: getModifiedCombatStat(unit, "accuracy", modifiers),
    healingPower: unit.stats.healingPower + [...unit.activeModifiers, ...modifiers].filter((modifier) => modifier.stat === "healingPower").reduce((sum, modifier) => sum + modifier.value, 0),
    physicalAttackBonus: getModifiedCombatStat(unit, "physicalAttackBonus", modifiers), magicAttackBonus: getModifiedCombatStat(unit, "magicAttackBonus", modifiers),
    armorClass: getModifiedCombatStat(unit, "armorClass", modifiers), magicDefenseScore: getModifiedCombatStat(unit, "magicDefenseScore", modifiers),
    attackRollModifier: getModifiedCombatStat(unit, "attackRollModifier", modifiers), rangedAttackRollModifier: getModifiedCombatStat(unit, "rangedAttackRollModifier", modifiers),
  };
}

function percentageFor(modifiers: readonly SkillModifier[], ...stats: string[]): number {
  return modifiers.filter((modifier) => stats.includes(modifier.stat) && modifier.operation === "percentage").reduce((sum, modifier) => sum + modifier.value, 0);
}

export function resolveSkill(actor: CombatUnit, targets: readonly CombatUnit[], skill: CombatSkillDefinition, random: RandomSource, options: ResolveSkillOptions = {}): ResolveSkillResult {
  const external = options.actorModifiers ?? [];
  const attackerStats = effectiveStats(actor, external);
  const baseDamageBonus = percentageFor([...actor.activeModifiers, ...external], "damage");
  const updatedTargets: CombatUnit[] = [];
  const hits: SkillHitResult[] = [];
  for (const originalTarget of targets) {
    const defenderStats = effectiveStats(originalTarget);
    const causesDamage = skill.damageType !== undefined && skill.damageMultiplier !== undefined;
    const rangedBonus = (skill.range ?? 1) > 1 ? attackerStats.rangedAttackRollModifier : 0;
    const attackBonus = (skill.damageType === "magic" ? attackerStats.magicAttackBonus : attackerStats.physicalAttackBonus) + attackerStats.attackRollModifier + rangedBonus;
    const targetValue = skill.damageType === "magic" ? defenderStats.magicDefenseScore : defenderStats.armorClass;
    const rollMode = combineD20RollModes(skill.attackRollMode, options.attackRollMode, getConditionAttackRollMode(actor), getConditionAttacksAgainstRollMode(originalTarget));
    const attackRoll = causesDamage ? rollAttack(random, attackBonus, skill.attackRollModifier ?? 0, targetValue, rollMode) : undefined;
    const hit = attackRoll?.hit ?? true;
    const critical = attackRoll?.critical ?? false;
    const factionDamageBonus = originalTarget.factionId ? skill.factionDamageModifiers?.[originalTarget.factionId] ?? 0 : 0;
    const queuedDamageReduction = Math.max(-.50, percentageFor(originalTarget.activeModifiers, "nextIncomingDamage"));
    const unreducedDamage = causesDamage && hit ? calculateSkillDamage(attackerStats, defenderStats, skill, critical, baseDamageBonus + factionDamageBonus) : 0;
    const damage = unreducedDamage > 0 ? Math.max(1, Math.round(unreducedDamage * (1 + queuedDamageReduction))) : 0;
    const healingReceived = percentageFor(originalTarget.activeModifiers, "healingReceived") + (options.healingReceivedModifier?.(originalTarget) ?? 0);
    const rawHealing = skill.healMaxHpModifier ? originalTarget.maxHP * skill.healMaxHpModifier * (1 + attackerStats.healingPower) * Math.max(0, 1 + healingReceived) : 0;
    const healing = Math.round(rawHealing + 1e-9);
    const remainingModifiers = damage > 0 ? originalTarget.activeModifiers.filter((modifier) => modifier.stat !== "nextIncomingDamage") : originalTarget.activeModifiers;
    let target = { ...originalTarget, activeModifiers: remainingModifiers, currentHP: Math.min(originalTarget.maxHP, Math.max(0, originalTarget.currentHP - damage + healing)) };
    target.isAlive = target.currentHP > 0;
    const appliedConditionIds: string[] = [];
    if (hit && target.isAlive) {
      for (const application of skill.conditionApplications ?? []) {
        const chance = options.conditionChance?.(target, application.conditionId, application.chance, application.resistanceKey) ?? application.chance;
        if (random.next() < chance) {
          target = { ...target, activeConditions: applyCombatCondition(target.activeConditions, application.conditionId, application.durationTurns) };
          appliedConditionIds.push(application.conditionId);
        }
      }
      if (skill.targetModifiers?.length) target = { ...target, activeModifiers: [...target.activeModifiers, ...skill.targetModifiers.map((modifier) => ({ ...modifier, sourceSkillId: skill.id }))] };
      if (damage > 0 && skill.damageType) {
        const reactive = options.reactiveDefenseModifiers?.(target, skill.damageType) ?? [];
        if (reactive.length) target = { ...target, activeModifiers: [...target.activeModifiers, ...reactive.map((modifier) => ({ ...modifier, sourceSkillId: "equipment_reactive_defense" }))] };
      }
    }
    updatedTargets.push(target);
    hits.push({ targetId: target.combatantId, hit, critical, damage, appliedConditionIds, ...(attackRoll ? { diceRoll: attackRoll.diceRoll, diceRolls: attackRoll.diceRolls, rollMode: attackRoll.rollMode, attackBonus: attackRoll.attackBonus, skillAttackModifier: attackRoll.skillModifier, attackTotal: attackRoll.total, targetValue: attackRoll.targetValue, rollResult: attackRoll.result } : {}) });
  }
  const selfModifiers = skill.selfModifiers ?? [];
  const withModifiers = selfModifiers.length ? { ...actor, activeModifiers: [...actor.activeModifiers, ...selfModifiers.map((modifier) => ({ ...modifier, sourceSkillId: skill.id }))] } : actor;
  const selfDamage = skill.selfMaxHpDamageModifier ? Math.round(actor.maxHP * skill.selfMaxHpDamageModifier) : 0;
  const lifeSteal = Math.round(hits.reduce((sum, hit) => sum + hit.damage, 0) * (skill.lifeStealModifier ?? 0));
  const afterSelfDamage = selfDamage ? { ...withModifiers, currentHP: Math.max(1, withModifiers.currentHP - selfDamage) } : withModifiers;
  const updatedActor = lifeSteal ? { ...afterSelfDamage, currentHP: Math.min(afterSelfDamage.maxHP, afterSelfDamage.currentHP + lifeSteal) } : afterSelfDamage;
  return { actor: updatedActor, targets: updatedTargets, resolution: { skillId: skill.id, actorId: actor.combatantId, targetIds: updatedTargets.map((target) => target.combatantId), hits } };
}

export { applySkillModifiers };
