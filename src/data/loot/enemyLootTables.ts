import type { MaterialId } from "../../game/crafting/craftingTypes";
export interface LootTableDefinition { id: string; itemIds: string[]; materialDrops?: { materialId: MaterialId; quantityMin: number; quantityMax: number }[] }

const EQUIPMENT_DROPS: Record<string, string[]> = {
  goblin_basic_loot: ["worn-sword", "oak-spear", "leather-cap", "trail-boots"],
  goblin_brute_loot: ["iron-warhammer", "battle-harness", "iron-guard-helm"],
  goblin_wardbreaker_loot: ["ash-wand", "runic-staff", "runespun-cowl"],
  skeleton_loot: ["novice-mace", "iron-guard-helm", "silver-ward-ring"],
  zombie_loot: ["padded-armor", "iron-chainmail"],
  wolf_loot: ["hunting-bow", "scout-cloak", "wolfhide-boots"],
  giant_spider_loot: ["leather-scout-hood", "silken-trail-boots"],
  spiderling_loot: ["trail-boots"],
  webspinner_loot: ["runespun-cowl", "sapphire-focus-charm"],
  broodguard_loot: ["hunter-leathers", "battle-harness"],
  spider_queen_loot: ["queen-silk-talisman", "shadowweave-mantle"],
  bandit_loot: ["worn-sword", "oak-recurve-bow", "scout-cloak", "topaz-precision-ring"],
  bandit_captain_loot: ["iron-longsword", "steel-greatsword", "steel-greathelm"],
  orc_loot: ["iron-warhammer", "battle-harness", "iron-sabatons"],
  troll_loot: ["steel-greatsword", "wardplate", "ironheart-amulet"],
  goblin_chieftain_loot: ["steel-greatsword", "wardplate", "steel-greathelm", "ironheart-amulet"],
  chainbreaker_loot: ["steel-greatsword", "iron-warhammer", "battle-harness", "ironheart-amulet"],
  ward_construct_loot: ["wardplate", "silver-ward-ring", "sapphire-focus-charm"],
  hollow_warden_loot: ["wardstone-scepter", "wardplate", "ironheart-amulet", "sapphire-focus-charm"],
  forest_serpent_loot: ["hunter-leathers", "silken-trail-boots", "topaz-precision-ring"],
  sewer_crocodile_loot: ["battle-harness", "iron-sabatons", "ironheart-amulet"],
  frost_wisp_loot: ["runespun-cowl", "sapphire-focus-charm", "silver-ward-ring"],
  frostmarch_yeti_loot: ["wardplate", "steel-greathelm", "ironheart-amulet"],
  blackbridge_scavenger_loot: ["trail-boots", "copper-luck-ring"],
  blackbridge_sapper_loot: ["worn-sword", "leather-cap", "topaz-precision-ring"],
  blackbridge_wraith_loot: ["silver-ward-ring", "runespun-cowl"],
  iron_laurel_loot: ["iron-longsword", "wardplate", "steel-greathelm"],
  heartstone_revenant_loot: ["wardstone-scepter", "ironheart-amulet", "sapphire-focus-charm"],
};

export const ENEMY_LOOT_TABLES: Record<string, LootTableDefinition> = Object.fromEntries([
  "goblin_basic_loot", "goblin_brute_loot", "goblin_wardbreaker_loot", "skeleton_loot", "zombie_loot", "wolf_loot",
  "giant_spider_loot", "spiderling_loot", "webspinner_loot", "broodguard_loot", "spider_queen_loot", "bandit_loot", "bandit_captain_loot", "orc_loot", "troll_loot", "goblin_chieftain_loot", "chainbreaker_loot", "ward_construct_loot", "hollow_warden_loot", "forest_serpent_loot", "sewer_crocodile_loot", "frost_wisp_loot", "frostmarch_yeti_loot", "blackbridge_scavenger_loot", "blackbridge_sapper_loot", "blackbridge_wraith_loot", "iron_laurel_loot", "heartstone_revenant_loot",
].map((id) => [id, { id, itemIds: EQUIPMENT_DROPS[id] ?? [] }]));
