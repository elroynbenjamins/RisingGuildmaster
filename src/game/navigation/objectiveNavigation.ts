import { QUESTS } from "../../data/quests/quests";
import { REGIONS } from "../../data/world/regions";
import type { WorldState } from "../world/worldTypes";
import { isQuestAtCurrentLocation } from "../quests/questAvailability";

/** An optional specific objective, distinct from the screen's general destination. */
export interface ObjectiveFocus {
  questId?: string;
  regionId?: string;
  settlementId?: string;
}

export type ObjectiveNavigation =
  | { screen: "quest"; questId: string }
  | { screen: "region"; regionId: string; settlementId?: string; questId?: string }
  | { screen: "world"; regionId: string; questId?: string };

/** Resolve the closest useful destination; only the actual travel action spends time or rations. */
export function resolveLocationObjective(world: WorldState, regionId: string, settlementId?: string, questId?: string): ObjectiveNavigation {
  if (world.currentRegionId === regionId) return { screen: "region", regionId, settlementId, questId };
  return { screen: "world", regionId, questId };
}

export function resolveQuestObjective(world: WorldState, questId: string): ObjectiveNavigation | null {
  const quest = QUESTS[questId];
  if (!quest) return null;
  if (isQuestAtCurrentLocation(quest, world)) return { screen: "quest", questId };
  return resolveLocationObjective(world, quest.regionId, quest.settlementIds?.[0], questId);
}

export function resolveObjectiveFocus(world: WorldState, focus: ObjectiveFocus): ObjectiveNavigation | null {
  if (focus.questId) return resolveQuestObjective(world, focus.questId);
  if (focus.regionId) return resolveLocationObjective(world, focus.regionId, focus.settlementId);
  return null;
}

/** The first unlocked connecting region towards a destination, or null if unreachable. */
export function getNextUnlockedRegionLeg(world: WorldState, destinationRegionId: string): string | null {
  if (world.currentRegionId === destinationRegionId) return null;
  const unlocked = new Set(world.unlockedRegionIds);
  if (!unlocked.has(destinationRegionId)) return null;
  const queue: Array<{ id: string; firstLeg: string | null }> = [{ id: world.currentRegionId, firstLeg: null }];
  const seen = new Set([world.currentRegionId]);
  for (let i = 0; i < queue.length; i += 1) {
    const step = queue[i]!;
    for (const id of REGIONS[step.id]?.connectedRegionIds ?? []) {
      if (!unlocked.has(id) || seen.has(id)) continue;
      const firstLeg = step.firstLeg ?? id;
      if (id === destinationRegionId) return firstLeg;
      seen.add(id);
      queue.push({ id, firstLeg });
    }
  }
  return null;
}
