import { ENEMY_ABILITIES } from "../../data/enemies/enemyAbilities";
import { getEnemyDefinition } from "../../data/enemies";
import type { RandomSource } from "../../utils/random";
import { getConditionApplicationChance } from "./enemyCalculator";
import type { AbilityTrigger, AbilityTriggerContext, EnemyAbilityDefinition } from "./enemyAbilityTypes";
import type { EnemyDefinition, EnemyInstance } from "./enemyTypes";

function ratioMatches(current: number | undefined, max: number | undefined, min: number | undefined, upper: number | undefined): boolean {
  if (min === undefined && upper === undefined) return true;
  if (current === undefined || max === undefined || max <= 0) return false;
  const ratio = current / max;
  return (min === undefined || ratio >= min) && (upper === undefined || ratio <= upper);
}

export function isAbilityTriggerActive(trigger: AbilityTrigger | undefined, context: AbilityTriggerContext): boolean {
  if (!trigger) return true;
  return ratioMatches(context.selfCurrentHP, context.selfMaxHP, trigger.selfHpRatioMin, trigger.selfHpRatioMax)
    && ratioMatches(context.targetCurrentHP, context.targetMaxHP, trigger.targetHpRatioMin, trigger.targetHpRatioMax);
}

type NumericAbilityField = {
  [K in keyof EnemyAbilityDefinition]-?: EnemyAbilityDefinition[K] extends number | undefined ? K : never
}[keyof EnemyAbilityDefinition];

export function getActiveAbilityModifier(definition: EnemyDefinition, field: NumericAbilityField, context: AbilityTriggerContext): number {
  return definition.abilityIds.reduce((total, id) => {
    const ability = ENEMY_ABILITIES[id];
    if (!ability || !isAbilityTriggerActive(ability.trigger, context)) return total;
    const value = ability[field];
    return total + (typeof value === "number" ? value : 0);
  }, 0);
}

/** Resolves living auras for a target without mutating either source or target definitions. */
export function getEncounterAuraModifier(instances: readonly EnemyInstance[], targetInstanceId: string, field: NumericAbilityField): number {
  const target = instances.find((instance) => instance.instanceId === targetInstanceId);
  if (!target) throw new Error(`Unknown target enemy instance: ${targetInstanceId}`);
  const targetDefinition = getEnemyDefinition(target.enemyDefinitionId);
  return instances.reduce((total, source) => {
    if (!source.isAlive || source.instanceId === targetInstanceId) return total;
    const sourceDefinition = getEnemyDefinition(source.enemyDefinitionId);
    return total + sourceDefinition.abilityIds.reduce((abilityTotal, abilityId) => {
      const ability = ENEMY_ABILITIES[abilityId];
      if (!ability || ability.type !== "aura" || ability.targetFactionId !== targetDefinition.factionId) return abilityTotal;
      const value = ability[field];
      return abilityTotal + (typeof value === "number" ? value : 0);
    }, 0);
  }, 0);
}

export function applyStartOfTurnRegeneration(instance: EnemyInstance): EnemyInstance {
  if (!instance.isAlive) return instance;
  const definition = getEnemyDefinition(instance.enemyDefinitionId);
  const healRatio = getActiveAbilityModifier(definition, "healMaxHpModifierPerTurn", { selfCurrentHP: instance.currentHP, selfMaxHP: instance.maxHP });
  return { ...instance, currentHP: Math.min(instance.maxHP, instance.currentHP + instance.maxHP * healRatio) };
}

export function applyAbilityCondition(target: EnemyInstance, ability: EnemyAbilityDefinition, randomRoll: number): EnemyInstance {
  if (!ability.conditionId || ability.conditionChance === undefined || !ability.conditionDurationTurns) return target;
  const definition = getEnemyDefinition(target.enemyDefinitionId);
  const chance = getConditionApplicationChance(definition, ability.conditionId, ability.conditionResistanceKey ?? ability.conditionId, ability.conditionChance);
  if (randomRoll >= chance) return target;
  const activeConditions = target.activeConditions.filter((item) => item.conditionId !== ability.conditionId);
  activeConditions.push({ conditionId: ability.conditionId, remainingTurns: ability.conditionDurationTurns });
  return { ...target, activeConditionIds: [...new Set([...target.activeConditionIds, ability.conditionId])], activeConditions };
}

export function rollEnemyRewards(definition: EnemyDefinition, random: RandomSource): { xp: number; gold: number; lootTableId: string } {
  if (definition.goldRewardMin > definition.goldRewardMax) throw new Error(`Invalid reward range for ${definition.id}`);
  return { xp: definition.xpReward, gold: random.int(definition.goldRewardMin, definition.goldRewardMax), lootTableId: definition.lootTableId };
}
