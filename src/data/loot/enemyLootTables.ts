export interface LootTableDefinition { id: string; itemIds: string[] }

/** Initial references are deliberately empty until the equipment-loot integration milestone. */
export const ENEMY_LOOT_TABLES: Record<string, LootTableDefinition> = Object.fromEntries([
  "goblin_basic_loot", "goblin_brute_loot", "skeleton_loot", "zombie_loot", "wolf_loot",
  "giant_spider_loot", "bandit_loot", "bandit_captain_loot", "orc_loot", "troll_loot", "goblin_chieftain_loot",
].map((id) => [id, { id, itemIds: [] }]));
