import type { Modifier } from "../modifiers/types";
import type { EquipmentSlot } from "../heroes/types";
import type { GuildmasterSkillId } from "../guildmaster/guildmasterTypes";

export type ArtisanType = "blacksmith" | "tailor" | "jeweler";
export type MaterialId =
  | "iron_ore" | "coal" | "silver_ore" | "oak_timber" | "wolf_pelt" | "spider_silk" | "arcane_dust"
  | "rough_ruby" | "rough_sapphire" | "rough_topaz"
  | "serpent_scale" | "venom_gland" | "serpent_fang"
  | "armored_scute" | "ancient_hide" | "crocodile_tooth"
  | "white_maw_pelt" | "yeti_fang" | "frost_crystal"
  | "serpent_recipe_fragment" | "crocodile_recipe_fragment" | "yeti_recipe_fragment";
export type MaterialInventory = Record<MaterialId, number>;

export interface MaterialDefinition { id: MaterialId; name: string; rarity: "common" | "uncommon" | "rare"; description: string; sourceTags: string[] }
export interface ArtisanDefinition { id: ArtisanType; name: string; fantasyRole: string; description: string; supportedSlots: EquipmentSlot[] }
export type RecipeUnlockSource = "roguelite_elite" | "roguelite_boss" | "side_quest";
export interface CraftingRecipeDefinition { id: string; artisanType: ArtisanType; artisanLevel: number; outputEquipmentId: string; goldCost: number; materials: Partial<Record<MaterialId, number>>; description: string; unlockSource?: RecipeUnlockSource }
export interface EnchantmentDefinition { id: string; name: string; artisanLevel: number; applicableSlots: EquipmentSlot[]; goldCost: number; materials: Partial<Record<MaterialId, number>>; modifiers: Modifier[]; specialEffectIds?: string[]; description: string }
export interface ArtisanConstructionProject { targetLevel: number; startDay: number; completionDay: number; goldCost: number }
export interface ArtisanState { level: number; recruited: boolean; construction: ArtisanConstructionProject | null }
export interface ArtisanBuildingTierDefinition { level: number; name: string; goldCost: number; durationDays: number; requiredSkillId: GuildmasterSkillId }
export type GuildArtisanState = Record<ArtisanType, ArtisanState>;

export const emptyMaterialInventory = (): MaterialInventory => ({
  iron_ore: 0, coal: 0, silver_ore: 0, oak_timber: 0, wolf_pelt: 0, spider_silk: 0, arcane_dust: 0,
  rough_ruby: 0, rough_sapphire: 0, rough_topaz: 0,
  serpent_scale: 0, venom_gland: 0, serpent_fang: 0,
  armored_scute: 0, ancient_hide: 0, crocodile_tooth: 0,
  white_maw_pelt: 0, yeti_fang: 0, frost_crystal: 0,
  serpent_recipe_fragment: 0, crocodile_recipe_fragment: 0, yeti_recipe_fragment: 0,
});
export const createGuildArtisanState = (): GuildArtisanState => ({ blacksmith: { level: 0, recruited: false, construction: null }, tailor: { level: 0, recruited: false, construction: null }, jeweler: { level: 0, recruited: false, construction: null } });
