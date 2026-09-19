import type { GuildState } from "../guild/types";
import { travelGuildToRegion, type GuildTravelResult } from "./travelService";
import type { RandomSource } from "../../utils/random";

export const MAX_TRAVEL_PARTY_SIZE = 4;

export function getEligibleTravelHeroes(guild: GuildState) {
  return guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0);
}

export function normalizeTravelPartyHeroIds(guild: GuildState, heroIds: readonly string[]): string[] {
  const eligible = new Set(getEligibleTravelHeroes(guild).map((hero) => hero.id));
  return [...new Set(heroIds)].filter((id) => eligible.has(id)).slice(0, MAX_TRAVEL_PARTY_SIZE);
}

export function getDefaultTravelPartyHeroIds(guild: GuildState): string[] {
  const eligible = getEligibleTravelHeroes(guild);
  const eligibleIds = new Set(eligible.map((hero) => hero.id));
  const recent = guild.recentPartyHeroIds.filter((id) => eligibleIds.has(id)).slice(0, MAX_TRAVEL_PARTY_SIZE);
  const result = [...recent];
  for (const hero of eligible) {
    if (result.length >= MAX_TRAVEL_PARTY_SIZE) break;
    if (!result.includes(hero.id)) result.push(hero.id);
  }
  return result;
}

export function toggleTravelPartyHeroId(guild: GuildState, heroIds: readonly string[], heroId: string): string[] {
  const current = normalizeTravelPartyHeroIds(guild, heroIds);
  if (current.includes(heroId)) return current.filter((id) => id !== heroId);
  if (!getEligibleTravelHeroes(guild).some((hero) => hero.id === heroId) || current.length >= MAX_TRAVEL_PARTY_SIZE) return current;
  return [...current, heroId];
}

export function travelGuildPartyToRegion(guild: GuildState, destinationRegionId: string, heroIds: readonly string[], random: RandomSource): GuildTravelResult {
  const partyHeroIds = normalizeTravelPartyHeroIds(guild, heroIds);
  if (!partyHeroIds.length) throw new Error("Select at least one available hero for the journey.");
  const result = travelGuildToRegion(guild, destinationRegionId, partyHeroIds.length, random);
  return { ...result, guild: { ...result.guild, recentPartyHeroIds: partyHeroIds } };
}
