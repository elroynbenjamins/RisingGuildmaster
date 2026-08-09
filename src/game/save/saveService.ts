import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GuildState } from "../guild/types";
import { emptyAttributes } from "../attributes/types";
import { createWorldState } from "../world/worldState";
const SAVE_KEY = "guildmaster.guild.v1";
export function serializeGuild(guild: GuildState): string { return JSON.stringify(guild); }
export function deserializeGuild(value: string): GuildState { const saved = JSON.parse(value) as GuildState; return { ...saved, world: saved.world ?? createWorldState(), heroes: saved.heroes.map((hero) => ({ ...hero, subclassId: hero.subclassId ?? null, isAvailable: hero.isAvailable ?? true, attributeGrowthProgress: hero.attributeGrowthProgress ?? emptyAttributes() })) }; }
export async function saveGuild(guild: GuildState): Promise<void> { await AsyncStorage.setItem(SAVE_KEY, serializeGuild(guild)); }
export async function loadGuild(): Promise<GuildState | null> {
  const value = await AsyncStorage.getItem(SAVE_KEY); if (!value) return null;
  return deserializeGuild(value);
}
