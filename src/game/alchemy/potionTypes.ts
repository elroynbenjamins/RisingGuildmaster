import type { MaterialId } from "../crafting/craftingTypes";

export type PotionId = "minor_healing_potion" | "mana_tonic" | "stamina_draught";
export type PotionInventory = Record<PotionId, number>;

export interface PotionDefinition {
  id: PotionId;
  name: string;
  description: string;
  goldCost: number;
  materials: Partial<Record<MaterialId, number>>;
  restoreHpRatio?: number;
  restoreManaRatio?: number;
  restoreStaminaRatio?: number;
}

export const emptyPotionInventory = (): PotionInventory => ({ minor_healing_potion: 0, mana_tonic: 0, stamina_draught: 0 });
