import { REGIONS } from "../../data/world/regions";
import { SETTLEMENTS } from "../../data/world/settlements";
import { REGION_TRAVEL_DAYS, TRAVEL_TIER_RANGES } from "../../data/world/travelTables";
import { WORLD_EVENTS } from "../../data/world/worldEvents";
import { getTravelContractEvents } from "../../data/world/travelContractEvents";
import { GAME_CONFIG } from "../../config/gameConfig";
import type { RandomSource } from "../../utils/random";
import { advanceGuildTime } from "../economy/guildCalendarService";
import type { GuildState } from "../guild/types";
import type { TravelEventTier, WorldEventDefinition, WorldState } from "./worldTypes";
import type { GuildmasterProfile } from "../guildmaster/guildmasterTypes";
import { hasGuildmasterSkill } from "../guildmaster/guildmasterProgression";
import { createGuildLegacyState, displayedTrophyBonus } from "../renown/guildLegacyService";
import { isSettlementAvailable } from "./regionalThreatService";

export const TRAVEL_EVENT_CHANCE = .45;
export interface TravelResult { state: WorldState; event: WorldEventDefinition | null; d100Roll?: number; tier?: TravelEventTier | null }
export interface GuildTravelResult extends TravelResult { guild: GuildState; days: number; rationCost: number }
export interface LocalTravelResult { guild: GuildState; event: WorldEventDefinition | null }
export function canTravel(state: WorldState, destinationRegionId: string): boolean { const current = REGIONS[state.currentRegionId]; return Boolean(current && state.unlockedRegionIds.includes(destinationRegionId) && current.connectedRegionIds.includes(destinationRegionId)); }
export function getRegionalTravelDays(fromRegionId: string, toRegionId: string): number { return REGION_TRAVEL_DAYS[`${fromRegionId}:${toRegionId}`] ?? 1; }
export function getTravelRationCost(days: number, partySize: number, profile?: GuildmasterProfile): number { const base = Math.max(1, days) * Math.max(1, partySize); return Math.max(1, Math.ceil(base * (profile && hasGuildmasterSkill(profile, "careful_rationing") ? .75 : 1))); }
export function getTravelTier(roll: number): TravelEventTier | null { return (Object.entries(TRAVEL_TIER_RANGES) as [TravelEventTier, { min: number; max: number }][]).find(([, range]) => roll >= range.min && roll <= range.max)?.[0] ?? null; }
export function rollTravelEvent(regionId: string, random: RandomSource): WorldEventDefinition | null {
  const roll = random.int(1, 100); const tier = getTravelTier(roll); if (!tier) return null;
  const available = [...Object.values(WORLD_EVENTS).filter((event) => event.regionIds.includes(regionId) && (event.tier ?? "common") === tier), ...getTravelContractEvents(regionId, tier)]; if (!available.length) return null;
  const total = available.reduce((sum, event) => sum + event.weight, 0); let weighted = random.next() * total;
  for (const event of available) { weighted -= event.weight; if (weighted <= 0) return event; } return available.at(-1) ?? null;
}
function destinationSettlement(state: WorldState, regionId: string): string | null {
  return REGIONS[regionId]?.settlementIds.find((id) => Boolean(SETTLEMENTS[id]) && isSettlementAvailable(state, id)) ?? null;
}
export function travelToRegion(state: WorldState, destinationRegionId: string, random: RandomSource): TravelResult {
  if (!REGIONS[destinationRegionId]) throw new Error("Unknown destination region");
  if (!canTravel(state, destinationRegionId)) throw new Error("Destination must be unlocked and directly connected");
  const d100Roll = random.int(1, 100); const tier = getTravelTier(d100Roll); const available = tier ? [...Object.values(WORLD_EVENTS).filter((event) => event.regionIds.includes(destinationRegionId) && (event.tier ?? "common") === tier), ...getTravelContractEvents(destinationRegionId, tier)] : [];
  const event = available.length ? random.pick(available) : null;
  const currentSettlementId = destinationSettlement(state, destinationRegionId);
  return { state: { ...state, currentRegionId: destinationRegionId, currentSettlementId, discoveredSettlementIds: currentSettlementId ? [...new Set([...state.discoveredSettlementIds, currentSettlementId])] : state.discoveredSettlementIds }, event, d100Roll, tier };
}
export function travelGuildToRegion(guild: GuildState, destinationRegionId: string, partySize: number, random: RandomSource): GuildTravelResult {
  const days = getRegionalTravelDays(guild.world.currentRegionId, destinationRegionId); const rationCost = getTravelRationCost(days, partySize, guild.guildmaster);
  if (guild.rations < rationCost) throw new Error(`Not enough rations. This ${days}-day journey needs ${rationCost}.`);
  if (!REGIONS[destinationRegionId]) throw new Error("Unknown destination region");
  if (!canTravel(guild.world, destinationRegionId)) throw new Error("Destination must be unlocked and directly connected");
  const d100Roll = random.int(1, 100); const tier = getTravelTier(d100Roll); const available = tier ? [...Object.values(WORLD_EVENTS).filter((event) => event.regionIds.includes(destinationRegionId) && (event.tier ?? "common") === tier), ...getTravelContractEvents(destinationRegionId, tier)] : [];
  const event = available.length ? random.pick(available) : null;
  const advanced = advanceGuildTime({ ...guild, rations: guild.rations - rationCost }, days).guild;
  const currentSettlementId = destinationSettlement(advanced.world, destinationRegionId);
  const world = {
    ...advanced.world,
    currentRegionId: destinationRegionId,
    currentSettlementId,
    discoveredSettlementIds: currentSettlementId ? [...new Set([...advanced.world.discoveredSettlementIds, currentSettlementId])] : advanced.world.discoveredSettlementIds,
  };
  return { state: world, event, d100Roll, tier, guild: { ...advanced, world }, days, rationCost };
}
export function visitSettlement(guild: GuildState, settlementId: string, partySize: number): GuildState {
  const settlement = SETTLEMENTS[settlementId]; if (!settlement || settlement.regionId !== guild.world.currentRegionId) throw new Error("Settlement is outside the current region");
  if (!isSettlementAvailable(guild.world, settlementId)) throw new Error("Settlement is currently unavailable because of a regional crisis");
  if (guild.world.currentSettlementId === settlementId) return guild;
  const rationCost = getTravelRationCost(1, partySize, guild.guildmaster); if (guild.rations < rationCost) throw new Error(`Local travel needs ${rationCost} rations.`);
  const advanced = advanceGuildTime({ ...guild, rations: guild.rations - rationCost }, 1).guild;
  return { ...advanced, world: { ...advanced.world, currentSettlementId: settlementId, discoveredSettlementIds: [...new Set([...advanced.world.discoveredSettlementIds, settlementId])] } };
}
export function visitSettlementWithEvent(guild: GuildState, settlementId: string, partySize: number, random: RandomSource): LocalTravelResult {
  const nextGuild = visitSettlement(guild, settlementId, partySize);
  return { guild: nextGuild, event: rollTravelEvent(nextGuild.world.currentRegionId, random) };
}
export function getRationBundleAmount(guild: GuildState): number { return Math.round(GAME_CONFIG.rationBundleSize * (hasGuildmasterSkill(guild.guildmaster, "quartermaster_network") ? 1.5 : 1) * (1 + displayedTrophyBonus(guild.legacy ?? createGuildLegacyState(), "ration_bundle"))); }
export function buyRations(guild: GuildState): GuildState { if (!guild.world.currentSettlementId) throw new Error("Rations can only be bought in a settlement"); if (guild.gold < GAME_CONFIG.rationBundleGoldCost) throw new Error("Not enough gold"); return { ...guild, gold: guild.gold - GAME_CONFIG.rationBundleGoldCost, rations: guild.rations + getRationBundleAmount(guild) }; }
