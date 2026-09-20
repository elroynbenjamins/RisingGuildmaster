import { getEnemyDefinition } from "../../data/enemies";
import type { RandomSource } from "../../utils/random";
import type { EnemyInstance } from "../enemies/enemyTypes";
import { advanceCombatConditions, resolveStartOfTurnConditions } from "./conditionResolver";
import { advanceCooldowns, setSkillCooldown } from "./cooldownService";
import { selectEnemySkill } from "./enemyBehaviorService";
import { advanceSkillModifiers } from "./modifierService";
import { getAuraModifiersForEnemy, getConditionalPassiveModifiers, resolvePassiveHealing } from "./passiveService";
import { resolveSkill, type ResolveSkillResult } from "./skillResolver";
import type { CombatUnit } from "./combatTypes";
import type { CombatBoardState } from "./grid/gridTypes";
import type { Hero } from "../heroes/types";
import { getHeroEquipmentConditionResistance, getHeroReactiveDefenseModifiers } from "../equipment/equipmentSpecialEffectService";
import { selectEnemySkillTargets } from "./enemyAiUtilityService";
import { getEnemyTacticalBehavior } from "./tacticalAiService";
import type { EnemyAiLevel } from "../difficulty/difficultyTypes";
import { getElevationAttackRollModifier } from "./grid/elevationService";

export interface EnemyTurnInput { instance: EnemyInstance; actor: CombatUnit; heroes: CombatUnit[]; allies: CombatUnit[]; enemyInstances: EnemyInstance[]; heroDefinitionsById?: Readonly<Record<string, Hero>>; board?: CombatBoardState; aiLevel?: EnemyAiLevel }
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
  const targets = selectEnemySkillTargets(skill, actor, input.heroes, input.allies, getEnemyTacticalBehavior(input.instance), random, input.board, input.aiLevel);
  if (!targets.length) {
    actor = { ...actor, activeConditions: advanceCombatConditions(actor.activeConditions) };
    return { ...input, actor, instance: { ...input.instance, currentHP: actor.currentHP, isAlive: actor.isAlive, activeCooldowns: advanceCooldowns(input.instance.activeCooldowns) }, skipped: true };
  }
  const firstTarget = targets[0];
  const passiveModifiers = [...getConditionalPassiveModifiers(definition, actor, firstTarget), ...getAuraModifiersForEnemy(input.enemyInstances, input.instance)];
  const elevationModifier = getElevationAttackRollModifier(input.board, actor.position, firstTarget!.position, skill.range ?? 1);
  if (elevationModifier) passiveModifiers.push({ stat: "attackRollModifier", operation: "flat", value: elevationModifier, durationTurns: -1 });
  const skillResult = resolveSkill(actor, targets, skill, random, { actorModifiers: passiveModifiers, conditionChance: (target, conditionId, baseChance) => { const hero = input.heroDefinitionsById?.[target.combatantId]; return hero ? baseChance * (1 - getHeroEquipmentConditionResistance(hero, conditionId as import("../heroes/types").ConditionId)) : baseChance; }, reactiveDefenseModifiers: (target, damageType) => { const hero = input.heroDefinitionsById?.[target.combatantId]; return hero ? getHeroReactiveDefenseModifiers(hero, damageType) : []; } });
  actor = { ...skillResult.actor, activeConditions: advanceCombatConditions(skillResult.actor.activeConditions) };
  const activeCooldowns = advanceCooldowns(setSkillCooldown(input.instance.activeCooldowns, skill.id, skill.cooldownTurns ?? 0), skill.id);
  return { ...input, actor, instance: { ...input.instance, currentHP: actor.currentHP, isAlive: actor.isAlive, activeCooldowns }, skipped: false, skillResult };
}
