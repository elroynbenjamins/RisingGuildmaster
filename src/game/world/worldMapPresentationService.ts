import { QUESTS } from "../../data/quests/quests";
import { REGIONS } from "../../data/world/regions";
import { SETTLEMENTS } from "../../data/world/settlements";
import type { GuildState } from "../guild/types";
import { isQuestAvailableAtCurrentLocation } from "../quests/questAvailability";
import { getTimeAdvanceGuidance } from "../onboarding/timeAndPayrollGuidanceService";
import { canTravel, getRegionalTravelDays, getTravelRationCost } from "./travelService";

export type RegionTravelState = "current" | "locked" | "blocked" | "ready" | "underlevelled" | "danger";

export interface RegionProgressSummary {
  completedQuests: number;
  totalQuests: number;
  discoveredSettlements: number;
  totalSettlements: number;
  questPercent: number;
}

export interface RegionTravelPreview {
  destinationRegionId: string;
  partySize: number;
  partyAverageLevel: number;
  days: number;
  rationCost: number;
  rationsAfterTravel: number;
  arrivalDay: number;
  threat: number;
  payrollDue: number;
  projectedPayrollShortfall: number;
  state: RegionTravelState;
  blocker: string | null;
}

export interface LocalTravelPreview {
  settlementId: string;
  partySize: number;
  rationCost: number;
  rationsAfterTravel: number;
  arrivalDay: number;
  isCurrent: boolean;
  canAfford: boolean;
}

export function getTravelPartyHeroes(guild: GuildState) {
  const available = guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0);
  const recent = guild.recentPartyHeroIds
    .map((id) => available.find((hero) => hero.id === id))
    .filter((hero): hero is GuildState["heroes"][number] => Boolean(hero));
  if (recent.length) return recent.slice(0, 4);
  return [...available].sort((a, b) => b.level - a.level).slice(0, 4);
}

export function getTravelPartySize(guild: GuildState): number {
  return Math.max(1, getTravelPartyHeroes(guild).length);
}

export function getTravelPartyAverageLevel(guild: GuildState): number {
  const party = getTravelPartyHeroes(guild);
  if (!party.length) return 0;
  return party.reduce((sum, hero) => sum + hero.level, 0) / party.length;
}

export function getRegionProgressSummary(guild: GuildState, regionId: string): RegionProgressSummary {
  const region = REGIONS[regionId];
  if (!region) return { completedQuests: 0, totalQuests: 0, discoveredSettlements: 0, totalSettlements: 0, questPercent: 0 };
  const completedQuests = region.questPoolIds.filter((id) => guild.world.completedQuestIds.includes(id)).length;
  const totalQuests = region.questPoolIds.length;
  const discoveredSettlements = region.settlementIds.filter((id) => guild.world.discoveredSettlementIds.includes(id)).length;
  return {
    completedQuests,
    totalQuests,
    discoveredSettlements,
    totalSettlements: region.settlementIds.length,
    questPercent: totalQuests ? Math.round((completedQuests / totalQuests) * 100) : 100,
  };
}

export function getRegionTravelPreview(guild: GuildState, destinationRegionId: string): RegionTravelPreview {
  const destination = REGIONS[destinationRegionId];
  const party = getTravelPartyHeroes(guild);
  const partySize = Math.max(1, party.length);
  const partyAverageLevel = party.length ? party.reduce((sum, hero) => sum + hero.level, 0) / party.length : 0;
  const current = guild.world.currentRegionId === destinationRegionId;
  const unlocked = guild.world.unlockedRegionIds.includes(destinationRegionId);
  const direct = canTravel(guild.world, destinationRegionId);
  const days = current ? 0 : getRegionalTravelDays(guild.world.currentRegionId, destinationRegionId);
  const rationCost = current ? 0 : getTravelRationCost(days, partySize, guild.guildmaster);
  const threat = guild.world.regionThreat?.[destinationRegionId] ?? 0;
  const guidance = current ? null : getTimeAdvanceGuidance(guild, days);

  let blocker: string | null = null;
  if (!current && !destination) blocker = "Unknown destination.";
  else if (!current && !unlocked) blocker = "Region locked by campaign progress.";
  else if (!current && !direct) blocker = "No direct unlocked road from the current region.";
  else if (!current && party.length === 0) blocker = "No living, available heroes can form a travel party.";
  else if (!current && guild.rations < rationCost) blocker = `Need ${rationCost - guild.rations} more rations.`;

  let state: RegionTravelState = "ready";
  if (current) state = "current";
  else if (!unlocked) state = "locked";
  else if (blocker) state = "blocked";
  else if (destination && partyAverageLevel > 0 && partyAverageLevel < destination.recommendedLevelMin) state = "underlevelled";
  else if (threat >= 3) state = "danger";

  return {
    destinationRegionId,
    partySize,
    partyAverageLevel,
    days,
    rationCost,
    rationsAfterTravel: Math.max(0, guild.rations - rationCost),
    arrivalDay: guild.currentDay + days,
    threat,
    payrollDue: guidance?.totalPayroll ?? 0,
    projectedPayrollShortfall: guidance?.projectedShortfall ?? 0,
    state,
    blocker,
  };
}

export function getLocalTravelPreview(guild: GuildState, settlementId: string): LocalTravelPreview {
  const isCurrent = guild.world.currentSettlementId === settlementId;
  const partySize = getTravelPartySize(guild);
  const rationCost = isCurrent ? 0 : getTravelRationCost(1, partySize, guild.guildmaster);
  return {
    settlementId,
    partySize,
    rationCost,
    rationsAfterTravel: Math.max(0, guild.rations - rationCost),
    arrivalDay: guild.currentDay + (isCurrent ? 0 : 1),
    isCurrent,
    canAfford: isCurrent || guild.rations >= rationCost,
  };
}

export function getSettlementQuestSummary(guild: GuildState, settlementId: string) {
  const settlement = SETTLEMENTS[settlementId];
  if (!settlement) return { total: 0, completed: 0, ready: 0 };
  const questIds = settlement.questIds.filter((questId) => QUESTS[questId]?.questType !== "contract");
  return {
    total: questIds.length,
    completed: questIds.filter((questId) => guild.world.completedQuestIds.includes(questId)).length,
    ready: questIds.filter((questId) => { const quest = QUESTS[questId]; if (!quest) return false; if (!quest.repeatable && guild.world.completedQuestIds.includes(questId)) return false; return isQuestAvailableAtCurrentLocation(quest, { ...guild.world, currentSettlementId: settlementId }); }).length,
  };
}

export function travelStateLabel(state: RegionTravelState): string {
  if (state === "current") return "CURRENT POSITION";
  if (state === "locked") return "CAMPAIGN LOCKED";
  if (state === "blocked") return "ROUTE BLOCKED";
  if (state === "underlevelled") return "HIGH RISK";
  if (state === "danger") return "THREAT ACTIVE";
  return "ROUTE READY";
}
