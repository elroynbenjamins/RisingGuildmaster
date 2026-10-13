import { QUESTS } from "../../data/quests/quests";
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
