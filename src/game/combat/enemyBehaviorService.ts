import { ENEMY_BEHAVIORS } from "../../data/enemyBehaviors/enemyBehaviors";
import { ENEMY_SKILLS } from "../../data/skills/enemySkills";
import type { EnemyDefinition, EnemyInstance } from "../enemies/enemyTypes";
import type { CombatUnit } from "./combatTypes";
import { isSkillReady } from "./cooldownService";
import type { EnemySkillRuleConditions } from "./enemyBehaviorTypes";
import type { CombatSkillDefinition } from "./skillTypes";
import type { CombatBoardState } from "./grid/gridTypes";
import { manhattanDistance } from "./grid/distanceCalculator";
import { scoreEnemySkillTargets, targetsForEnemySkill } from "./enemyAiUtilityService";

/** Single-target actions are valued against their best legal target; only true group actions sum their targets. */
export function scoreEnemySkillOption(skill: CombatSkillDefinition, actor: CombatUnit, targets: readonly CombatUnit[]): number {
  if (!targets.length) return Number.NEGATIVE_INFINITY;
  if (skill.targetType === "all_enemies" || skill.targetType === "all_allies" || skill.targetType === "self") return scoreEnemySkillTargets(skill, actor, targets);
  return Math.max(...targets.map((target) => scoreEnemySkillTargets(skill, actor, [target])));
}

function ratioMatches(current: number, max: number, min?: number, upper?: number): boolean {
  const ratio = max > 0 ? current / max : 0;
  return (min === undefined || ratio >= min) && (upper === undefined || ratio <= upper);
}
function conditionsMatch(conditions: EnemySkillRuleConditions | undefined, actor: CombatUnit, targets: readonly CombatUnit[], livingEnemies: number, livingHeroes: number): boolean {
  if (!conditions) return true;
  if (!ratioMatches(actor.currentHP, actor.maxHP, conditions.selfHpRatioMin, conditions.selfHpRatioMax)) return false;
  if ((conditions.minLivingEnemies ?? 0) > livingEnemies || (conditions.minLivingHeroes ?? 0) > livingHeroes) return false;
  if ((conditions.minTargetsInRange ?? 0) > targets.filter((target) => manhattanDistance(actor.position, target.position) <= (conditions.targetRange ?? 1)).length) return false;
  if (conditions.targetHpRatioMin !== undefined || conditions.targetHpRatioMax !== undefined) return targets.some((target) => ratioMatches(target.currentHP, target.maxHP, conditions.targetHpRatioMin, conditions.targetHpRatioMax));
  return true;
}

export function selectEnemySkill(definition: EnemyDefinition, instance: EnemyInstance, actor: CombatUnit, heroes: readonly CombatUnit[], enemies: readonly CombatUnit[], board?: CombatBoardState): CombatSkillDefinition {
  const behavior = ENEMY_BEHAVIORS[definition.behaviorId];
  if (!behavior) throw new Error(`Unknown enemy behavior: ${definition.behaviorId}`);
  const livingHeroes = heroes.filter((unit) => unit.isAlive).length;
  const livingEnemies = enemies.filter((unit) => unit.isAlive).length;
  const candidates: { skill: CombatSkillDefinition; score: number }[] = [];
  for (const rule of behavior.rules) {
    const skill = ENEMY_SKILLS[rule.skillId];
    if (!skill || !definition.skillIds.includes(skill.id) || !isSkillReady(instance.activeCooldowns, skill.id) || !skill.targetType) continue;
    const targets = targetsForEnemySkill(skill, actor, heroes, enemies, board);
    const utility = scoreEnemySkillOption(skill, actor, targets);
    const hasUsefulEffect = utility > 0 || skill.damageMultiplier !== undefined;
    if (targets.length && hasUsefulEffect && conditionsMatch(rule.conditions, actor, targets, livingEnemies, livingHeroes)) candidates.push({ skill, score: rule.priority * 3 + utility });
  }
  const basic = ENEMY_SKILLS[behavior.basicAttackSkillId];
  if (!basic || basic.type !== "basic_attack" || !definition.skillIds.includes(basic.id)) throw new Error(`Invalid basic attack for ${definition.id}`);
  const basicTargets = targetsForEnemySkill(basic, actor, heroes, enemies, board);
  if (basicTargets.length) candidates.push({ skill: basic, score: scoreEnemySkillOption(basic, actor, basicTargets) });
  return candidates.sort((a, b) => b.score - a.score)[0]?.skill ?? basic;
}
