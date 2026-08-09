import type { LootTableDefinition } from "./enemyLootTables";
export const QUEST_LOOT_TABLES: Record<string, LootTableDefinition> = {
  goblin_quest_loot: { id: "goblin_quest_loot", itemIds: ["padded-armor"] },
  spider_quest_loot: { id: "spider_quest_loot", itemIds: ["hunting-bow"] },
  troll_quest_loot: { id: "troll_quest_loot", itemIds: ["worn-sword"] },
};
