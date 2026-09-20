export type EnemyAbilityType = "active" | "passive" | "aura";

export interface AbilityTrigger {
  selfHpRatioMax?: number;
  selfHpRatioMin?: number;
  targetHpRatioMax?: number;
  targetHpRatioMin?: number;
}

/** Data-only ability schema. Combat systems interpret these numerical fields. */
export interface EnemyAbilityDefinition {
  id: string;
  name: string;
  type: EnemyAbilityType;
  damageMultiplier?: number;
  physicalDamageModifier?: number;
  magicDamageModifier?: number;
  rangedDamageModifier?: number;
  damageModifier?: number;
  physicalDefenseModifier?: number;
  armorClassModifier?: number;
  evasionModifier?: number;
  criticalChanceModifier?: number;
  magicDefenseScoreModifier?: number;
  healMaxHpModifierPerTurn?: number;
  conditionId?: string;
  conditionResistanceKey?: string;
  conditionChance?: number;
  conditionDurationTurns?: number;
  goldStealModifier?: number;
  targetFactionId?: string;
  trigger?: AbilityTrigger;
}

export interface AbilityTriggerContext {
  selfCurrentHP?: number;
  selfMaxHP?: number;
  targetCurrentHP?: number;
  targetMaxHP?: number;
}
