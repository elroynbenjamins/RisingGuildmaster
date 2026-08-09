import { GAME_CONFIG } from "../../config/gameConfig";
import type { Hero } from "../heroes/types";
import type { GuildState } from "./types";
import { createWorldState } from "../world/worldState";
export function createGuild(name = "The Wayfarers"): GuildState { return { guildId: "guild-player", guildName: name, gold: GAME_CONFIG.startingGold, reputation: GAME_CONFIG.startingReputation, heroes: [], inventory: [], currentDay: GAME_CONFIG.startingDay, world: createWorldState() }; }
export function recruitHero(guild: GuildState, hero: Hero): GuildState {
  if (guild.heroes.some((item) => item.id === hero.id)) throw new Error("Hero is already in this guild");
  if (guild.gold < hero.recruitmentCost) throw new Error("Not enough gold");
  return { ...guild, gold: guild.gold - hero.recruitmentCost, heroes: [...guild.heroes, hero] };
}
