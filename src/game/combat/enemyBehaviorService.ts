import { ENEMY_BEHAVIORS } from "../../data/enemyBehaviors/enemyBehaviors";
import { ENEMY_SKILLS } from "../../data/skills/enemySkills";
import type { EnemyDefinition, EnemyInstance } from "../enemies/enemyTypes";
import type { CombatUnit } from "./combatTypes";
import { isSkillReady } from "./cooldownService";
import type { EnemySkillRuleConditions } from "./enemyBehaviorTypes";
import { getValidTargets } from "./targetSelector";
import type { CombatSkillDefinition } from "./skillTypes";
import type { CombatBoardState } from "./grid/gridTypes";
import { getTargetsInSkillRange } from "./targetSelector";
import { manhattanDistance } from "./grid/distanceCalculator";

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
  for (const rule of [...behavior.rules].sort((a, b) => b.priority - a.priority)) {
    const skill = ENEMY_SKILLS[rule.skillId];
    if (!skill || !definition.skillIds.includes(skill.id) || !isSkillReady(instance.activeCooldowns, skill.id) || !skill.targetType) continue;
    const valid = getValidTargets(skill.targetType, actor, heroes, enemies);
    const targets = board ? getTargetsInSkillRange(skill, actor, valid, board) : valid;
    if (targets.length && conditionsMatch(rule.conditions, actor, targets, livingEnemies, livingHeroes)) return skill;
  }
  const basic = ENEMY_SKILLS[behavior.basicAttackSkillId];
  if (!basic || basic.type !== "basic_attack" || !definition.skillIds.includes(basic.id)) throw new Error(`Invalid basic attack for ${definition.id}`);
  return basic;
}
