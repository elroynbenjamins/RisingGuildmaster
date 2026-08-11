export const GAME_ICON_IDS = [
  "guild", "quests", "world", "heroes", "inventory", "gold",
  "recruitment", "training", "temple", "management", "blacksmith", "tailor",
  "jeweler", "scouting", "monster_manual", "hero_codex", "skill_codex", "calendar",
  "weapon", "armor", "helmet", "boots", "ring", "amulet",
  "victory", "defeat", "xp", "loot", "materials", "journal",
  "region_open", "locked", "current", "complete", "boss", "settlement",
] as const;
export type GameIconId = typeof GAME_ICON_IDS[number];
export const GAME_ICON_COORDINATES: Record<GameIconId, { column: number; row: number }> = Object.fromEntries(GAME_ICON_IDS.map((id, index) => [id, { column: index % 6, row: Math.floor(index / 6) }])) as Record<GameIconId, { column: number; row: number }>;

export function equipmentSlotIcon(slot: string): GameIconId {
  if (slot === "weapon") return "weapon"; if (slot === "helmet") return "helmet"; if (slot === "boots") return "boots"; if (slot.startsWith("accessory")) return "ring"; return "armor";
}
