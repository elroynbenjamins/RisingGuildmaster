import type { AttributeKey, DerivedStatKey } from "../attributes/types";

export type SystemModifierTarget =
  | "xp" | "trainingCost" | "physicalDamage" | "rangedDamage" | "rareLoot"
  | "equipmentDurability" | "movementSpeed" | "craftingCost" | "questGold"
  | "salary" | "trainingXp" | "recoveryDuration" | "intelligenceGrowth"
  | "injuryChance" | "damage" | "healingReceived" | "armorClass" | "magicDefenseScore"
  | "movementRange" | "maxHP" | "fireDamage" | "frostDamage" | "burnChance" | "attackRoll"
  | "healingPower" | "rangedSkillRange" | "rangedAttackRoll";
export type ModifierTarget = AttributeKey | DerivedStatKey | SystemModifierTarget;
export type ModifierOperation = "flat" | "percentage";
export type ModifierSource = "race" | "class" | "subclass" | "trait" | "condition" | "equipment" | "skill" | "guild" | "quest" | "event";
export type ModifierCondition = { type: "hpRatioAtMost"; value: number };

export interface Modifier {
  source: ModifierSource;
  sourceId: string;
  target: ModifierTarget;
  operation: ModifierOperation;
  value: number;
  condition?: ModifierCondition;
}

export interface ModifierContext { currentHP?: number; maxHP?: number }
