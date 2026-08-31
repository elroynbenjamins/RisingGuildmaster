import type { RandomSource } from "../../utils/random";
import type { GuildState } from "../guild/types";
import type { Hero, EquipmentSlot } from "../heroes/types";
import { createEquipmentKeyWithDurability, parseEquipmentKey, resolveEquipmentDefinition } from "./equipmentResolver";

export interface EquipmentWearResult { hero: Hero; damagedSlot: EquipmentSlot | null; durabilityLost: number }
export function getDurabilityLabel(durability: number): "PRISTINE" | "WORN" | "DAMAGED" | "BROKEN" { return durability <= 0 ? "BROKEN" : durability < 40 ? "DAMAGED" : durability < 75 ? "WORN" : "PRISTINE"; }
export function getRepairCost(key: string): number { const item = resolveEquipmentDefinition(key); if (!item) return 0; const missing = 100 - item.durability; return missing <= 0 ? 0 : Math.max(5, Math.ceil(item.value * missing / 100 * .5)); }

export function applyCombatEquipmentWear(hero: Hero, damageRatio: number, random: RandomSource): EquipmentWearResult {
  const equipped = Object.entries(hero.equipment).filter((entry): entry is [EquipmentSlot, string] => Boolean(entry[1]));
  const ratio = Math.max(0, Math.min(1, damageRatio));
  if (ratio < .10 || !equipped.length || random.next() >= .03 + ratio * .12) return { hero, damagedSlot: null, durabilityLost: 0 };
  const [slot, key] = random.pick(equipped); const current = parseEquipmentKey(key).durability; const durabilityLost = Math.min(current, Math.max(1, Math.ceil(ratio * 5)));
  return { hero: { ...hero, equipment: { ...hero.equipment, [slot]: createEquipmentKeyWithDurability(key, current - durabilityLost) } }, damagedSlot: slot, durabilityLost };
}

export function repairInventoryEquipment(guild: GuildState, inventoryIndex: number): GuildState {
  const key = guild.inventory[inventoryIndex]; if (!key) throw new Error("Equipment is unavailable");
  if (!guild.artisans.blacksmith.recruited) throw new Error("Build the Blacksmith before repairing equipment");
  const cost = getRepairCost(key); if (!cost) throw new Error("Equipment does not need repairs"); if (guild.gold < cost) throw new Error("Not enough gold");
  const inventory = [...guild.inventory]; inventory[inventoryIndex] = createEquipmentKeyWithDurability(key, 100); return { ...guild, gold: guild.gold - cost, inventory };
}

export function repairHeroEquipment(guild: GuildState, heroId: string, slot: EquipmentSlot): GuildState {
  const hero = guild.heroes.find((entry) => entry.id === heroId); const key = hero?.equipment[slot]; if (!hero || !key) throw new Error("Equipped item is unavailable");
  if (!guild.artisans.blacksmith.recruited) throw new Error("Build the Blacksmith before repairing equipment");
  const cost = getRepairCost(key); if (!cost) throw new Error("Equipment does not need repairs"); if (guild.gold < cost) throw new Error("Not enough gold");
  return { ...guild, gold: guild.gold - cost, heroes: guild.heroes.map((entry) => entry.id === heroId ? { ...entry, equipment: { ...entry.equipment, [slot]: createEquipmentKeyWithDurability(key, 100) } } : entry) };
}
