import { ENCHANTMENTS } from "../../data/crafting/enchantments";
import { EQUIPMENT, type EquipmentDefinition } from "../../data/equipment/equipment";

export const EQUIPMENT_ENCHANTMENT_SEPARATOR = "::";
export interface ResolvedEquipmentDefinition extends EquipmentDefinition { inventoryKey: string; enchantmentIds: string[] }

export function parseEquipmentKey(key: string): { equipmentId: string; enchantmentIds: string[] } {
  const [equipmentId, encoded = ""] = key.split(EQUIPMENT_ENCHANTMENT_SEPARATOR);
  return { equipmentId: equipmentId ?? key, enchantmentIds: encoded ? encoded.split("+").filter(Boolean) : [] };
}

export function createEnchantedEquipmentKey(key: string, enchantmentId: string): string {
  const parsed = parseEquipmentKey(key);
  if (parsed.enchantmentIds.includes(enchantmentId)) throw new Error("This enchantment is already attached");
  if (parsed.enchantmentIds.length >= 1) throw new Error("This item already has its initial enchantment slot filled");
  return `${parsed.equipmentId}${EQUIPMENT_ENCHANTMENT_SEPARATOR}${[...parsed.enchantmentIds, enchantmentId].join("+")}`;
}

export function resolveEquipmentDefinition(key: string): ResolvedEquipmentDefinition | undefined {
  const parsed = parseEquipmentKey(key); const base = EQUIPMENT[parsed.equipmentId]; if (!base) return undefined;
  const enchantments = parsed.enchantmentIds.map((id) => ENCHANTMENTS[id]).filter(Boolean);
  return { ...base, inventoryKey: key, enchantmentIds: enchantments.map((item) => item.id), name: enchantments.length ? `${enchantments.map((item) => item.name).join(" / ")} ${base.name}` : base.name, value: Math.round(base.value + enchantments.reduce((sum, item) => sum + item.goldCost * .5, 0)), modifiers: [...base.modifiers, ...enchantments.flatMap((item) => item.modifiers)], specialEffectIds: [...base.specialEffectIds, ...enchantments.map((item) => `enchantment:${item.id}`)] };
}
