import type { EquipmentRarity } from "../data/equipment/equipment";

export const EQUIPMENT_RARITY_COLORS: Record<EquipmentRarity, string> = {
  common: "#aeb7c2",
  uncommon: "#69c878",
  rare: "#72b7f2",
  epic: "#b68be3",
  legendary: "#e3a642",
};

export function getEquipmentRarityColor(rarity: EquipmentRarity): string {
  return EQUIPMENT_RARITY_COLORS[rarity];
}
