import type { ConditionId } from "../heroes/types";
import type { Modifier } from "../modifiers/types";
import type { TerrainType } from "../combat/grid/gridTypes";

export type EquipmentSpecialEffectTrigger = "always" | "low_hp" | "on_physical_hit" | "on_magic_hit" | "on_heal" | "after_receiving_magic_hit" | "after_receiving_physical_hit";
export interface EquipmentSpecialEffectDefinition {
  id: string;
  name: string;
  description: string;
  trigger: EquipmentSpecialEffectTrigger;
  modifiers: Modifier[];
  conditionResistanceModifiers?: Partial<Record<ConditionId, number>>;
  conditionApplication?: { conditionId: string; chance: number; durationTurns: number };
  /** Arms after the triggering hit and is consumed by the next damaging attack. */
  nextIncomingDamageReduction?: number;
  ignoredTerrainMovementCosts?: TerrainType[];
}
