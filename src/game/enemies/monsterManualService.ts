import { ENEMIES } from "../../data/enemies";
import type { GuildState } from "../guild/types";

export function discoverEnemies(guild: GuildState, enemyDefinitionIds: readonly string[]): GuildState {
  const known = new Set(guild.discoveredEnemyIds); let changed = false;
  for (const id of enemyDefinitionIds) if (ENEMIES[id] && !known.has(id)) { known.add(id); changed = true; }
  return changed ? { ...guild, discoveredEnemyIds: [...known] } : guild;
}

export function isEnemyDiscovered(guild: GuildState, enemyDefinitionId: string): boolean { return guild.discoveredEnemyIds.includes(enemyDefinitionId); }

export function getMonsterManualProgress(guild: GuildState): { discovered: number; total: number } {
  const total = Object.keys(ENEMIES).length; const discovered = guild.discoveredEnemyIds.filter((id) => ENEMIES[id]).length;
  return { discovered, total };
}
