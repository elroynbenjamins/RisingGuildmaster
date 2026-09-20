import { ENCHANTMENTS } from "../../data/crafting/enchantments";
import { EQUIPMENT, type EquipmentDefinition } from "../../data/equipment/equipment";

export const EQUIPMENT_ENCHANTMENT_SEPARATOR = "::";
export const EQUIPMENT_DURABILITY_SEPARATOR = "@@";
export interface ResolvedEquipmentDefinition extends EquipmentDefinition { inventoryKey: string; enchantmentIds: string[]; durability: number }

export function parseEquipmentKey(key: string): { equipmentId: string; enchantmentIds: string[]; durability: number } {
  const [equipmentAndEnchantments = key, encodedDurability] = key.split(EQUIPMENT_DURABILITY_SEPARATOR);
  const [equipmentId, encoded = ""] = equipmentAndEnchantments.split(EQUIPMENT_ENCHANTMENT_SEPARATOR);
  const parsedDurability = encodedDurability === undefined ? 100 : Number(encodedDurability);
  return { equipmentId: equipmentId ?? key, enchantmentIds: encoded ? encoded.split("+").filter(Boolean) : [], durability: Number.isFinite(parsedDurability) ? Math.max(0, Math.min(100, Math.round(parsedDurability))) : 100 };
}

export function createEquipmentKeyWithDurability(key: string, durability: number): string { const parsed = parseEquipmentKey(key); const base = `${parsed.equipmentId}${parsed.enchantmentIds.length ? `${EQUIPMENT_ENCHANTMENT_SEPARATOR}${parsed.enchantmentIds.join("+")}` : ""}`; const value = Math.max(0, Math.min(100, Math.round(durability))); return value >= 100 ? base : `${base}${EQUIPMENT_DURABILITY_SEPARATOR}${value}`; }

export function createEnchantedEquipmentKey(key: string, enchantmentId: string): string {
  const parsed = parseEquipmentKey(key);
  if (parsed.enchantmentIds.includes(enchantmentId)) throw new Error("This enchantment is already attached");
  if (parsed.enchantmentIds.length >= 1) throw new Error("This item already has its initial enchantment slot filled");
  return createEquipmentKeyWithDurability(`${parsed.equipmentId}${EQUIPMENT_ENCHANTMENT_SEPARATOR}${[...parsed.enchantmentIds, enchantmentId].join("+")}`, parsed.durability);
}

export function resolveEquipmentDefinition(key: string): ResolvedEquipmentDefinition | undefined {
  const parsed = parseEquipmentKey(key); const base = EQUIPMENT[parsed.equipmentId]; if (!base) return undefined;
  const enchantments = parsed.enchantmentIds
    .map((id) => ENCHANTMENTS[id])
    .filter((item): item is NonNullable<typeof item> => item !== undefined);
  return { ...base, inventoryKey: key, durability: parsed.durability, enchantmentIds: enchantments.map((item) => item.id), name: enchantments.length ? `${enchantments.map((item) => item.name).join(" / ")} ${base.name}` : base.name, value: Math.round((base.value + enchantments.reduce((sum, item) => sum + item.goldCost * .5, 0)) * (.4 + parsed.durability / 100 * .6)), modifiers: [...base.modifiers, ...enchantments.flatMap((item) => item.modifiers)].map((modifier) => ({ ...modifier, value: modifier.value * parsed.durability / 100 })), specialEffectIds: parsed.durability > 0 ? [...base.specialEffectIds, ...enchantments.map((item) => `enchantment:${item.id}`), ...enchantments.flatMap((item) => item.specialEffectIds ?? [])] : [] };
}
