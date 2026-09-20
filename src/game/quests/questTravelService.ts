import { QUESTS } from "../../data/quests/quests";
import { REGIONS } from "../../data/world/regions";
import { SETTLEMENTS } from "../../data/world/settlements";
import type { RandomSource } from "../../utils/random";
import type { GuildState } from "../guild/types";
import type { WorldEventDefinition, WorldState } from "../world/worldTypes";
import { getRegionalTravelDays, getTravelRationCost, visitSettlementWithEvent } from "../world/travelService";
import { normalizeTravelPartyHeroIds, travelGuildPartyToRegion } from "../world/travelPartyService";
import { isQuestAtCurrentLocation } from "./questAvailability";

export type QuestTravelStepKind = "region" | "settlement" | "reached";
export interface QuestTravelStep {
  kind: QuestTravelStepKind;
  destinationRegionId: string;
  destinationSettlementId?: string;
  label: string;
  days: number;
  rationCost: number;
}
export interface QuestTravelProgress {
  guild: GuildState;
  event: WorldEventDefinition | null;
  step: QuestTravelStep;
  reachedQuest: boolean;
}

function shortestUnlockedRegionPath(world: WorldState, destinationRegionId: string): string[] {
  if (world.currentRegionId === destinationRegionId) return [world.currentRegionId];
  const allowed = new Set(world.unlockedRegionIds);
  if (!allowed.has(destinationRegionId)) return [];
  const queue: string[][] = [[world.currentRegionId]];
  const visited = new Set<string>([world.currentRegionId]);
  while (queue.length) {
    const path = queue.shift()!;
    const current = path[path.length - 1]!;
    for (const next of REGIONS[current]?.connectedRegionIds ?? []) {
      if (!allowed.has(next) || visited.has(next)) continue;
      const nextPath = [...path, next];
      if (next === destinationRegionId) return nextPath;
      visited.add(next);
      queue.push(nextPath);
    }
  }
  return [];
}

export function getQuestTravelStep(guild: GuildState, questId: string, partySize: number): QuestTravelStep {
  const quest = QUESTS[questId];
  if (!quest) throw new Error("Unknown quest");
  if (isQuestAtCurrentLocation(quest, guild.world)) return { kind: "reached", destinationRegionId: quest.regionId, label: "Quest location reached", days: 0, rationCost: 0 };

  if (guild.world.currentRegionId !== quest.regionId) {
    const path = shortestUnlockedRegionPath(guild.world, quest.regionId);
    const nextRegionId = path[1];
    if (!nextRegionId) throw new Error("No unlocked road leads toward this quest yet");
    const days = getRegionalTravelDays(guild.world.currentRegionId, nextRegionId);
    return {
      kind: "region",
      destinationRegionId: nextRegionId,
      label: REGIONS[nextRegionId]?.name ?? nextRegionId,
      days,
      rationCost: getTravelRationCost(days, partySize, guild.guildmaster),
    };
  }

  const settlementId = (quest.settlementIds ?? []).find((id) => id !== guild.world.currentSettlementId) ?? quest.settlementIds?.[0];
  if (!settlementId) return { kind: "reached", destinationRegionId: quest.regionId, label: "Quest location reached", days: 0, rationCost: 0 };
  return {
    kind: "settlement",
    destinationRegionId: quest.regionId,
    destinationSettlementId: settlementId,
    label: SETTLEMENTS[settlementId]?.name ?? settlementId,
    days: 1,
    rationCost: getTravelRationCost(1, partySize, guild.guildmaster),
  };
}

export function travelGuildTowardQuest(guild: GuildState, questId: string, heroIds: readonly string[], random: RandomSource): QuestTravelProgress {
  const partyHeroIds = normalizeTravelPartyHeroIds(guild, heroIds);
  if (!partyHeroIds.length) throw new Error("No available heroes can form the travel party.");
  const step = getQuestTravelStep(guild, questId, partyHeroIds.length);
  const quest = QUESTS[questId]!;
  if (step.kind === "reached") return { guild, event: null, step, reachedQuest: true };

  if (step.kind === "region") {
    const result = travelGuildPartyToRegion(guild, step.destinationRegionId, partyHeroIds, random);
    return { guild: result.guild, event: result.event, step, reachedQuest: isQuestAtCurrentLocation(quest, result.guild.world) };
  }

  const result = visitSettlementWithEvent(guild, step.destinationSettlementId!, partyHeroIds.length, random);
  const nextGuild = { ...result.guild, recentPartyHeroIds: partyHeroIds };
  return { guild: nextGuild, event: result.event, step, reachedQuest: isQuestAtCurrentLocation(quest, nextGuild.world) };
}
