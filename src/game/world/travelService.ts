import { REGIONS } from "../../data/world/regions";
import { WORLD_EVENTS } from "../../data/world/worldEvents";
import type { RandomSource } from "../../utils/random";
import type { WorldEventDefinition, WorldState } from "./worldTypes";
import { WORLD_DEFINITION } from "../../data/world/world";
export const TRAVEL_EVENT_CHANCE = WORLD_DEFINITION.travelEventChance;
export interface TravelResult { state: WorldState; event: WorldEventDefinition | null }
export function canTravel(state: WorldState, destinationRegionId: string): boolean { const current = REGIONS[state.currentRegionId]; return Boolean(current && state.unlockedRegionIds.includes(destinationRegionId) && current.connectedRegionIds.includes(destinationRegionId)); }
export function rollTravelEvent(regionId: string, random: RandomSource): WorldEventDefinition | null {
  if (random.next() >= TRAVEL_EVENT_CHANCE) return null;
  const available = Object.values(WORLD_EVENTS).filter((event) => event.regionIds.includes(regionId)); if (!available.length) return null;
  const total = available.reduce((sum, event) => sum + event.weight, 0); let roll = random.next() * total;
  for (const event of available) { roll -= event.weight; if (roll <= 0) return event; } return available[available.length - 1] ?? null;
}
export function travelToRegion(state: WorldState, destinationRegionId: string, random: RandomSource): TravelResult {
  if (!REGIONS[destinationRegionId]) throw new Error("Unknown destination region");
  if (!canTravel(state, destinationRegionId)) throw new Error("Destination must be unlocked and directly connected");
  return { state: { ...state, currentRegionId: destinationRegionId }, event: rollTravelEvent(destinationRegionId, random) };
}
