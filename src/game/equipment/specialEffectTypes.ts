import type { ConditionId } from "../heroes/types";
import type { Modifier } from "../modifiers/types";
import type { TerrainType } from "../combat/grid/gridTypes";

export type EquipmentSpecialEffectTrigger = "always" | "low_hp" | "on_physical_hit" | "on_magic_hit" | "on_heal";
export interface EquipmentSpecialEffectDefinition {
  id: string;
  name: string;
  description: string;
  trigger: EquipmentSpecialEffectTrigger;
  modifiers: Modifier[];
  conditionResistanceModifiers?: Partial<Record<ConditionId, number>>;
  conditionApplication?: { conditionId: ConditionId; chance: number; durationTurns: number };
  ignoredTerrainMovementCosts?: TerrainType[];
}
