import type { EnemyFactionId } from "../enemies/enemyTypes";
import type { D20RollMode } from "./dice/d20RollMode";

export type CombatSkillType = "basic_attack" | "active" | "passive" | "aura";
export type DamageType = "physical" | "magic" | "true";
export type SkillTargetType = "single_enemy" | "random_enemy" | "all_enemies" | "self" | "single_ally" | "all_allies";
export type SkillModifierOperation = "flat" | "percentage";

export interface SkillConditionApplication { conditionId: string; chance: number; durationTurns: number; resistanceKey?: string }
export interface SkillModifier { stat: string; operation: SkillModifierOperation; value: number; durationTurns: number }
export interface AuraDefinition { target: "all_allies" | "same_faction_allies"; factionId?: EnemyFactionId; modifiers: SkillModifier[]; excludeSelf: boolean; trigger?: SkillTriggerConditions }
export interface SkillTriggerConditions { selfHpRatioMax?: number; selfHpRatioMin?: number; targetHpRatioMax?: number; targetHpRatioMin?: number }
export interface ConditionalSkillModifier { conditions: SkillTriggerConditions; modifiers: SkillModifier[] }

export interface CombatSkillDefinition {
  id: string;
  name: string;
  type: CombatSkillType;
  damageType?: DamageType;
  damageMultiplier?: number;
  accuracyModifier?: number;
  attackRollModifier?: number;
  attackRollMode?: D20RollMode;
  criticalChanceModifier?: number;
  targetType?: SkillTargetType;
  cooldownTurns?: number;
  conditionApplications?: SkillConditionApplication[];
  selfModifiers?: SkillModifier[];
  targetModifiers?: SkillModifier[];
  healMaxHpModifier?: number;
  resourceType?: "mana" | "stamina" | "none";
  resourceCost?: number;
  selfMaxHpDamageModifier?: number;
  factionDamageModifiers?: Record<string, number>;
  range?: number;
  areaRadius?: number;
  friendlyFire?: boolean;
  aura?: AuraDefinition;
  conditionalModifiers?: ConditionalSkillModifier[];
  taunt?: { durationTurns: number; offTargetAttackRollModifier: number };
  companion?: { id: string; hpMultiplier: number; physicalDamageMultiplier: number; armorClassModifier: number; movementRange: number; maxActive: number };
  flameWall?: { connectedTileCount: number; durationRounds: number; magicPowerDamageMultiplier: number };
  savingThrowCondition?: { type: "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma"; difficultyClass: number; conditionId: string; durationTurns: number };
  clearTargetBuffsDurationTurns?: number;
  lifeStealModifier?: number;
  charge?: { maxTiles: number; minimumTilesForSave: number; savingThrowType: "strength"; difficultyClass: number; failureConditionId: string; failureDurationTurns: number };
}
