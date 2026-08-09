import type { RandomSource } from "../../utils/random";
import { applyCombatCondition } from "./conditionResolver";
import { getConditionStatPercentage } from "./conditionResolver";
import { calculateSkillDamage } from "./damageCalculator";
import { rollAttack } from "./dice/attackRoll";
import { applySkillModifiers, getModifiedCombatStat } from "./modifierService";
import type { CombatStats, CombatUnit, SkillHitResult, SkillResolution } from "./combatTypes";
import type { CombatSkillDefinition, SkillModifier } from "./skillTypes";

export interface ResolveSkillOptions {
  actorModifiers?: SkillModifier[];
  conditionChance?: (target: CombatUnit, conditionId: string, baseChance: number, resistanceKey?: string) => number;
}
export interface ResolveSkillResult { actor: CombatUnit; targets: CombatUnit[]; resolution: SkillResolution }

function effectiveStats(unit: CombatUnit, external: readonly SkillModifier[] = []): CombatStats {
  const conditionPhysicalDamage = getConditionStatPercentage(unit, "physicalDamage");
  const physicalModifiers = conditionPhysicalDamage ? [...external, { stat: "physicalDamage", operation: "percentage" as const, value: conditionPhysicalDamage, durationTurns: -1 }] : external;
  return {
    physicalDamage: getModifiedCombatStat(unit, "physicalDamage", physicalModifiers), physicalDefense: getModifiedCombatStat(unit, "physicalDefense", external),
    magicDamage: getModifiedCombatStat(unit, "magicDamage", external), magicDefense: getModifiedCombatStat(unit, "magicDefense", external),
    speed: getModifiedCombatStat(unit, "speed", external), evasion: getModifiedCombatStat(unit, "evasion", external),
    criticalChance: getModifiedCombatStat(unit, "criticalChance", external), accuracy: getModifiedCombatStat(unit, "accuracy", external),
    healingPower: unit.stats.healingPower + [...unit.activeModifiers, ...external].filter((modifier) => modifier.stat === "healingPower").reduce((sum, modifier) => sum + modifier.value, 0),
    physicalAttackBonus: getModifiedCombatStat(unit, "physicalAttackBonus", external), magicAttackBonus: getModifiedCombatStat(unit, "magicAttackBonus", external),
    armorClass: getModifiedCombatStat(unit, "armorClass", external), magicDefenseScore: getModifiedCombatStat(unit, "magicDefenseScore", external),
    attackRollModifier: getModifiedCombatStat(unit, "attackRollModifier", external), rangedAttackRollModifier: getModifiedCombatStat(unit, "rangedAttackRollModifier", external),
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
    const attackRoll = causesDamage ? rollAttack(random, attackBonus, skill.attackRollModifier ?? 0, targetValue) : undefined;
    const hit = attackRoll?.hit ?? true;
    const critical = attackRoll?.critical ?? false;
    const factionDamageBonus = originalTarget.factionId ? skill.factionDamageModifiers?.[originalTarget.factionId] ?? 0 : 0;
    const damage = causesDamage && hit ? calculateSkillDamage(attackerStats, defenderStats, skill, critical, baseDamageBonus + factionDamageBonus) : 0;
    const rawHealing = skill.healMaxHpModifier ? originalTarget.maxHP * skill.healMaxHpModifier * (1 + attackerStats.healingPower) : 0;
    const healing = Math.round(rawHealing + 1e-9);
    let target = { ...originalTarget, currentHP: Math.min(originalTarget.maxHP, Math.max(0, originalTarget.currentHP - damage + healing)) };
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
    }
    updatedTargets.push(target);
    hits.push({ targetId: target.combatantId, hit, critical, damage, appliedConditionIds, ...(attackRoll ? { diceRoll: attackRoll.diceRoll, attackBonus: attackRoll.attackBonus, skillAttackModifier: attackRoll.skillModifier, attackTotal: attackRoll.total, targetValue: attackRoll.targetValue, rollResult: attackRoll.result } : {}) });
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
