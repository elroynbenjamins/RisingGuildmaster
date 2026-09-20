import { REGIONS } from "../../data/world/regions";
import type { WorldState } from "./worldTypes";

export function meetsRegionUnlockRequirements(regionId: string, state: WorldState): boolean {
  const region = REGIONS[regionId]; if (!region) return false;
  return region.unlockRequirements.every((requirement) => requirement.type === "campaign_node" ? state.completedCampaignNodeIds.includes(requirement.id) : state.worldFlags[requirement.id] === true);
}
export function unlockEligibleRegions(state: WorldState): WorldState {
  const eligible = Object.values(REGIONS).filter((region) => meetsRegionUnlockRequirements(region.id, state)).map((region) => region.id);
  return { ...state, unlockedRegionIds: [...new Set([...state.unlockedRegionIds, ...eligible])] };
}
export function isRegionCompleted(regionId: string, state: WorldState): boolean { const bossQuestId = REGIONS[regionId]?.bossQuestId; return bossQuestId ? state.completedQuestIds.includes(bossQuestId) : false; }
export function isBossAvailable(regionId: string, state: WorldState): boolean { const boss = REGIONS[regionId]?.bossQuestId; return Boolean(boss && state.unlockedRegionIds.includes(regionId) && !state.completedQuestIds.includes(boss)); }
