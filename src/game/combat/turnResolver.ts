import { getEnemyDefinition } from "../../data/enemies";
import type { RandomSource } from "../../utils/random";
import type { EnemyInstance } from "../enemies/enemyTypes";
import { advanceCombatConditions, resolveStartOfTurnConditions } from "./conditionResolver";
import { advanceCooldowns, setSkillCooldown } from "./cooldownService";
import { selectEnemySkill } from "./enemyBehaviorService";
import { advanceSkillModifiers } from "./modifierService";
import { getAuraModifiersForEnemy, getConditionalPassiveModifiers, resolvePassiveHealing } from "./passiveService";
import { resolveSkill, type ResolveSkillResult } from "./skillResolver";
import { getTargetsInSkillRange, getValidTargets, selectSkillTargets } from "./targetSelector";
import type { CombatUnit } from "./combatTypes";
import type { CombatBoardState } from "./grid/gridTypes";
import type { Hero } from "../heroes/types";
import { getHeroEquipmentConditionResistance } from "../equipment/equipmentSpecialEffectService";

export interface EnemyTurnInput { instance: EnemyInstance; actor: CombatUnit; heroes: CombatUnit[]; allies: CombatUnit[]; enemyInstances: EnemyInstance[]; heroDefinitionsById?: Readonly<Record<string, Hero>>; board?: CombatBoardState }
export interface EnemyTurnResult extends EnemyTurnInput { skipped: boolean; skillResult?: ResolveSkillResult }

/** Executes the generic enemy turn pipeline; encounter state integration can consume the returned immutable values. */
export function resolveEnemyTurn(input: EnemyTurnInput, random: RandomSource): EnemyTurnResult {
  const definition = getEnemyDefinition(input.instance.enemyDefinitionId);
  const started = resolveStartOfTurnConditions(input.actor);
  let actor = resolvePassiveHealing(definition, started.unit);
  if (!actor.isAlive || started.skipTurn) {
    actor = advanceSkillModifiers({ ...actor, activeConditions: advanceCombatConditions(actor.activeConditions) });
    return { ...input, actor, instance: { ...input.instance, currentHP: actor.currentHP, isAlive: actor.isAlive, activeCooldowns: advanceCooldowns(input.instance.activeCooldowns) }, skipped: true };
  }
  actor = advanceSkillModifiers(actor);
  const skill = selectEnemySkill(definition, input.instance, actor, input.heroes, input.allies, input.board);
  let targets: CombatUnit[];
  if (input.board) {
    const valid = getTargetsInSkillRange(skill, actor, getValidTargets(skill.targetType ?? "single_enemy", actor, input.heroes, input.allies), input.board);
    if (skill.targetType === "all_enemies" || skill.targetType === "all_allies" || skill.targetType === "self") targets = valid;
    else {
      const conditionIds = (skill.conditionApplications ?? []).map((application) => application.conditionId);
      const preferred = valid.filter((unit) => conditionIds.every((id) => !unit.activeConditions.some((condition) => condition.conditionId === id)));
      const pool = preferred.length ? preferred : valid; targets = pool.length ? [random.pick(pool)] : [];
    }
  } else targets = selectSkillTargets(skill.targetType ?? "single_enemy", actor, input.heroes, input.allies, random, (skill.conditionApplications ?? []).map((application) => application.conditionId));
  if (!targets.length) {
    actor = { ...actor, activeConditions: advanceCombatConditions(actor.activeConditions) };
    return { ...input, actor, instance: { ...input.instance, currentHP: actor.currentHP, isAlive: actor.isAlive, activeCooldowns: advanceCooldowns(input.instance.activeCooldowns) }, skipped: true };
  }
  const firstTarget = targets[0];
  const passiveModifiers = [...getConditionalPassiveModifiers(definition, actor, firstTarget), ...getAuraModifiersForEnemy(input.enemyInstances, input.instance)];
  const skillResult = resolveSkill(actor, targets, skill, random, { actorModifiers: passiveModifiers, conditionChance: (target, conditionId, baseChance) => { const hero = input.heroDefinitionsById?.[target.combatantId]; return hero ? baseChance * (1 - getHeroEquipmentConditionResistance(hero, conditionId as import("../heroes/types").ConditionId)) : baseChance; } });
  actor = { ...skillResult.actor, activeConditions: advanceCombatConditions(skillResult.actor.activeConditions) };
  const activeCooldowns = advanceCooldowns(setSkillCooldown(input.instance.activeCooldowns, skill.id, skill.cooldownTurns ?? 0), skill.id);
  return { ...input, actor, instance: { ...input.instance, currentHP: actor.currentHP, isAlive: actor.isAlive, activeCooldowns }, skipped: false, skillResult };
}
