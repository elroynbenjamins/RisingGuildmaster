import { REGIONS } from "../../data/world/regions";
import { SETTLEMENTS } from "../../data/world/settlements";
import type { RandomSource } from "../../utils/random";
import type { GuildState } from "../guild/types";
import type { WorldEventDefinition, WorldState } from "../world/worldTypes";
import { getRegionalTravelDays, getTravelRationCost, travelGuildToRegion, visitSettlementWithEvent } from "../world/travelService";
import { getCampaignNodeLocationRequirement, isAtCampaignLocation } from "./campaignLocationService";

export type CampaignTravelStepKind = "region" | "settlement" | "reached";
export interface CampaignTravelStep {
  kind: CampaignTravelStepKind;
  destinationRegionId: string;
  destinationSettlementId?: string;
  label: string;
  days: number;
  rationCost: number;
}
export interface CampaignTravelProgress {
  guild: GuildState;
  event: WorldEventDefinition | null;
  step: CampaignTravelStep;
  reachedObjective: boolean;
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

export function getCampaignTravelStep(guild: GuildState, nodeId: string, partySize: number): CampaignTravelStep {
  const requirement = getCampaignNodeLocationRequirement(nodeId);
  if (!requirement) throw new Error("This campaign step has no travel destination");
  if (isAtCampaignLocation(guild.world, requirement)) {
    return { kind: "reached", destinationRegionId: requirement.regionId, label: "Objective location reached", days: 0, rationCost: 0 };
  }

  if (guild.world.currentRegionId !== requirement.regionId) {
    const path = shortestUnlockedRegionPath(guild.world, requirement.regionId);
    const nextRegionId = path[1];
    if (!nextRegionId) throw new Error("No unlocked road leads toward this campaign objective yet");
    const days = getRegionalTravelDays(guild.world.currentRegionId, nextRegionId);
    return {
      kind: "region",
      destinationRegionId: nextRegionId,
      label: REGIONS[nextRegionId]?.name ?? nextRegionId,
      days,
      rationCost: getTravelRationCost(days, partySize, guild.guildmaster),
    };
  }

  const settlementId = requirement.settlementIds.find((id) => id !== guild.world.currentSettlementId) ?? requirement.settlementIds[0];
  if (!settlementId) return { kind: "reached", destinationRegionId: requirement.regionId, label: "Objective location reached", days: 0, rationCost: 0 };
  return {
    kind: "settlement",
    destinationRegionId: requirement.regionId,
    destinationSettlementId: settlementId,
    label: SETTLEMENTS[settlementId]?.name ?? settlementId,
    days: 1,
    rationCost: getTravelRationCost(1, partySize, guild.guildmaster),
  };
}

export function travelGuildTowardCampaignObjective(guild: GuildState, nodeId: string, partySize: number, random: RandomSource): CampaignTravelProgress {
  const step = getCampaignTravelStep(guild, nodeId, partySize);
  if (step.kind === "reached") return { guild, event: null, step, reachedObjective: true };

  if (step.kind === "region") {
    const result = travelGuildToRegion(guild, step.destinationRegionId, partySize, random);
    const requirement = getCampaignNodeLocationRequirement(nodeId);
    return { guild: result.guild, event: result.event, step, reachedObjective: isAtCampaignLocation(result.guild.world, requirement) };
  }

  const result = visitSettlementWithEvent(guild, step.destinationSettlementId!, partySize, random);
  const requirement = getCampaignNodeLocationRequirement(nodeId);
  return { guild: result.guild, event: result.event, step, reachedObjective: isAtCampaignLocation(result.guild.world, requirement) };
}
