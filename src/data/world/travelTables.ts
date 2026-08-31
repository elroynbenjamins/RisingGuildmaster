import type { TravelEventTier } from "../../game/world/worldTypes";

export const TRAVEL_TIER_RANGES: Record<TravelEventTier, { min: number; max: number }> = {
  common: { min: 56, max: 80 },
  uncommon: { min: 81, max: 93 },
  rare: { min: 94, max: 99 },
  legendary: { min: 100, max: 100 },
};

export const REGION_TRAVEL_DAYS: Record<string, number> = {
  "greenveil:iron_hills": 3, "iron_hills:greenveil": 3,
  "greenveil:shadowfen": 2, "shadowfen:greenveil": 2,
  "iron_hills:frostmarch": 4, "frostmarch:iron_hills": 4,
  "ashlands:iron_hills": 5, "iron_hills:ashlands": 5,
};

export const REGION_TRAVEL_FLAVOR = {
  greenveil: { common: "Forager's Clearing", uncommon: "Briar Toll", rare: "Warden's Cache", legendary: "The Green Stag", attribute: "wisdom" },
  iron_hills: { common: "Loose Scree", uncommon: "Abandoned Ore Cart", rare: "Runes Beneath the Road", legendary: "The Anvil Echo", attribute: "constitution" },
  shadowfen: { common: "False Causeway", uncommon: "Ferryman's Lantern", rare: "Drowned Reliquary", legendary: "The Bell Without a Tower", attribute: "wisdom" },
  frostmarch: { common: "Whiteout Trail", uncommon: "Warm Aurora Hollow", rare: "Frozen Warden Camp", legendary: "The Walking Aurora", attribute: "constitution" },
  ashlands: { common: "Ash Squall", uncommon: "Cinderwell Tracks", rare: "Obsidian Caravan", legendary: "The Dragon's Shadow", attribute: "dexterity" },
} as const;
