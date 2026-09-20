import type { ClassId } from "../../game/heroes/types";
import type { DungeonThemeId } from "../../game/dungeons/dungeonTypes";

export const BOSS_WEAPON_RECIPE_IDS: Record<ClassId, string> = {
  warrior: "boss_weapon_warrior", ranger: "boss_weapon_ranger", mage: "boss_weapon_mage", cleric: "boss_weapon_cleric", paladin: "boss_weapon_paladin", berserker: "boss_weapon_berserker", monk: "boss_weapon_monk", bard: "boss_weapon_bard", spellbow: "boss_weapon_spellbow", bulwark: "boss_weapon_bulwark", summoner: "boss_weapon_summoner",
};
export const ELITE_RING_RECIPE_IDS: Record<ClassId, string> = {
  warrior: "elite_ring_warrior", ranger: "elite_ring_ranger", mage: "elite_ring_mage", cleric: "elite_ring_cleric", paladin: "elite_ring_paladin", berserker: "elite_ring_berserker", monk: "elite_ring_monk", bard: "elite_ring_bard", spellbow: "elite_ring_spellbow", bulwark: "elite_ring_bulwark", summoner: "elite_ring_summoner",
};
export const THEME_ELITE_RECIPE_IDS: Record<DungeonThemeId, string> = {
  forest: "theme_elite_forest", arctic: "theme_elite_arctic", jungle: "theme_elite_jungle", wasteland: "theme_elite_wasteland", desert: "theme_elite_desert", undead: "theme_elite_undead",
};
export const THEME_BOSS_RECIPE_IDS: Record<DungeonThemeId, string> = {
  forest: "theme_boss_forest", arctic: "theme_boss_arctic", jungle: "theme_boss_jungle", wasteland: "theme_boss_wasteland", desert: "theme_boss_desert", undead: "theme_boss_undead",
};
