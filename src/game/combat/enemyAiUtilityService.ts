import type { RandomSource } from "../../utils/random";
import type { CombatUnit } from "./combatTypes";
import type { CombatSkillDefinition } from "./skillTypes";
import type { TacticalBehavior } from "./tacticalAiTypes";
import type { CombatBoardState } from "./grid/gridTypes";
import { manhattanDistance } from "./grid/distanceCalculator";
import { getTargetsInSkillRange, getValidTargets } from "./targetSelector";
import type { EnemyAiLevel } from "../difficulty/difficultyTypes";

function hpRatio(unit: CombatUnit): number { return unit.maxHP > 0 ? unit.currentHP / unit.maxHP : 0; }
function damageFor(skill: CombatSkillDefinition, actor: CombatUnit): number {
  if (!skill.damageType || skill.damageMultiplier === undefined) return 0;
  const base = skill.damageType === "magic" ? actor.stats.magicDamage : actor.stats.physicalDamage;
  return Math.max(0, base * skill.damageMultiplier);
}
function modifierWeight(skill: CombatSkillDefinition, target: CombatUnit): number {
  const modifiers = skill.targetModifiers ?? [];
  if (!modifiers.length || target.activeModifiers.some((modifier) => modifier.sourceSkillId === skill.id)) return 0;
  return modifiers.reduce((sum, modifier) => {
    const magnitude = Math.abs(modifier.value) * (modifier.operation === "percentage" ? 50 : 4);
    return sum + magnitude * Math.max(1, modifier.durationTurns);
  }, 0);
}

/** Estimates value without rolling dice or mutating combat state. */
export function scoreEnemySkillTargets(skill: CombatSkillDefinition, actor: CombatUnit, targets: readonly CombatUnit[]): number {
  if (!targets.length) return Number.NEGATIVE_INFINITY;
  const rawDamage = damageFor(skill, actor);
  return targets.reduce((score, target) => {
    const expectedDamage = Math.min(target.currentHP, rawDamage);
    const finishingBonus = rawDamage > 0 && rawDamage >= target.currentHP ? 45 : 0;
    const woundedBonus = target.side !== actor.side ? (1 - hpRatio(target)) * 18 : 0;
    const missingHealth = Math.max(0, target.maxHP - target.currentHP);
    const healing = skill.healMaxHpModifier ? Math.min(missingHealth, target.maxHP * skill.healMaxHpModifier) : 0;
    const healUrgency = healing > 0 ? (1 - hpRatio(target)) * 55 : 0;
    const freshConditions = (skill.conditionApplications ?? []).filter((application) => !target.activeConditions.some((condition) => condition.conditionId === application.conditionId));
    const conditionValue = freshConditions.reduce((sum, application) => sum + application.chance * application.durationTurns * 18, 0);
    return score + expectedDamage * .35 + finishingBonus + woundedBonus + healing * .45 + healUrgency + conditionValue + modifierWeight(skill, target);
  }, 0);
}

export function targetsForEnemySkill(skill: CombatSkillDefinition, actor: CombatUnit, heroes: readonly CombatUnit[], allies: readonly CombatUnit[], board?: CombatBoardState): CombatUnit[] {
  const valid = getValidTargets(skill.targetType ?? "single_enemy", actor, heroes, allies);
  return board ? getTargetsInSkillRange(skill, actor, valid, board) : valid;
}

function priorityScore(target: CombatUnit, actor: CombatUnit, behavior: TacticalBehavior): number {
  if (behavior.targetPriority === "lowest_hp") return (1 - hpRatio(target)) * 35;
  if (behavior.targetPriority === "highest_damage") return Math.max(target.stats.physicalDamage, target.stats.magicDamage) * .15;
  if (behavior.targetPriority === "nearest") return 15 / Math.max(1, manhattanDistance(actor.position, target.position));
  return 0;
}

/** Selects the target that makes the chosen action most valuable; exact ties retain seeded variety. */
export function selectEnemySkillTargets(skill: CombatSkillDefinition, actor: CombatUnit, heroes: readonly CombatUnit[], allies: readonly CombatUnit[], behavior: TacticalBehavior, random: RandomSource, board?: CombatBoardState, aiLevel: EnemyAiLevel = "tactical"): CombatUnit[] {
  const valid = targetsForEnemySkill(skill, actor, heroes, allies, board);
  if (skill.targetType === "all_enemies" || skill.targetType === "all_allies" || skill.targetType === "self") return valid;
  if (!valid.length) return [];
  const utilityWeight = aiLevel === "trained" ? .55 : aiLevel === "ruthless" ? 1.35 : 1;
  const ruthlessFocus = (target: CombatUnit) => aiLevel === "ruthless" && target.side !== actor.side ? (1 - hpRatio(target)) * 35 : 0;
  const scored = valid.map((target) => ({ target, score: scoreEnemySkillTargets(skill, actor, [target]) * utilityWeight + priorityScore(target, actor, behavior) + ruthlessFocus(target) }));
  const best = Math.max(...scored.map((entry) => entry.score));
  return [random.pick(scored.filter((entry) => Math.abs(entry.score - best) < .001)).target];
}
