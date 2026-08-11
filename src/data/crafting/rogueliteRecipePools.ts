import type { ClassId } from "../../game/heroes/types";

export const BOSS_WEAPON_RECIPE_IDS: Record<ClassId, string> = {
  warrior: "boss_weapon_warrior", ranger: "boss_weapon_ranger", mage: "boss_weapon_mage", cleric: "boss_weapon_cleric", paladin: "boss_weapon_paladin", berserker: "boss_weapon_berserker",
};
export const ELITE_RING_RECIPE_IDS: Record<ClassId, string> = {
  warrior: "elite_ring_warrior", ranger: "elite_ring_ranger", mage: "elite_ring_mage", cleric: "elite_ring_cleric", paladin: "elite_ring_paladin", berserker: "elite_ring_berserker",
};
