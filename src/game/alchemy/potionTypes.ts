import type { MaterialId } from "../crafting/craftingTypes";
import type { ConditionId } from "../heroes/types";

export type PotionId = "minor_healing_potion" | "mana_tonic" | "stamina_draught" | "greater_healing_potion" | "greater_mana_tonic" | "greater_stamina_draught" | "antitoxin" | "cleansing_draught";
export type PotionInventory = Record<PotionId, number>;

export interface PotionDefinition {
  id: PotionId;
  name: string;
  description: string;
  tier: 1 | 2 | 3;
  goldCost: number;
  materials: Partial<Record<MaterialId, number>>;
  requiredRegionId?: string;
  requiredCampaignChapter?: number;
  restoreHpRatio?: number;
  restoreManaRatio?: number;
  restoreStaminaRatio?: number;
  curePersistentConditionIds?: ConditionId[];
  cureCombatConditionIds?: string[];
}

export const emptyPotionInventory = (): PotionInventory => ({
  minor_healing_potion: 0,
  mana_tonic: 0,
  stamina_draught: 0,
  greater_healing_potion: 0,
  greater_mana_tonic: 0,
  greater_stamina_draught: 0,
  antitoxin: 0,
  cleansing_draught: 0,
});
