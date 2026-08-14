import { LORE_ENTRIES } from "../../data/world/lore";
import type { LoreEntryDefinition, WorldState } from "./worldTypes";

export function getDiscoveredLoreEntries(state: WorldState): LoreEntryDefinition[] {
  return Object.values(LORE_ENTRIES)
    .filter((entry) => state.worldFlags[entry.unlockFlag] === true)
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
}

export function getLoreProgress(state: WorldState): { discovered: number; total: number } {
  return { discovered: getDiscoveredLoreEntries(state).length, total: Object.keys(LORE_ENTRIES).length };
}
