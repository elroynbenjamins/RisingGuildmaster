import type { LoreEntryDefinition } from "../../game/world/worldTypes";
const lore = (id: string, title: string, category: LoreEntryDefinition["category"], text: string, unlockFlag: string): LoreEntryDefinition => ({ id, title, category, text, unlockFlag });
export const LORE_ENTRIES: Record<string, LoreEntryDefinition> = {
  wardstones: lore("wardstones", "The Wardstones", "artifact", "Ancient structures that restrained monsters and corrupted magic across Eldoria.", "lore_wardstones"),
  greenveil: lore("greenveil", "Greenveil", "region", "The wooded heartland surrounding Guildhaven.", "lore_greenveil"),
  guildhaven: lore("guildhaven", "Guildhaven", "region", "A trade city whose guilds guard the roads.", "lore_guildhaven"),
  goblin_tribes: lore("goblin_tribes", "Goblin Tribes", "faction", "Once scattered tribes, now acting with unusual coordination.", "lore_goblin_tribes"),
  iron_hills: lore("iron_hills", "Iron Hills", "region", "A rugged center of mines and fortified passes.", "lore_iron_hills"),
  shadowfen: lore("shadowfen", "Shadowfen", "region", "A marshland of drowned history and waking dead.", "lore_shadowfen"),
  frostmarch: lore("frostmarch", "Frostmarch", "region", "The frozen northern border of Eldoria.", "lore_frostmarch"),
  ashlands: lore("ashlands", "Ashlands", "region", "A volcanic region scarred by magical upheaval.", "lore_ashlands"),
};
