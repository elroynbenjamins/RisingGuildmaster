import type { Hero } from "../heroes/types";
import type { WorldState } from "../world/worldTypes";
export interface GuildState { guildId: string; guildName: string; gold: number; reputation: number; heroes: Hero[]; inventory: string[]; currentDay: number; world: WorldState }
