import { REGIONS } from "../../data/world/regions";
import type { WorldState } from "./worldTypes";
export function discoverRegionSettlements(state: WorldState, regionId: string): WorldState {
  const settlementIds = REGIONS[regionId]?.settlementIds ?? [];
  return {
    ...state,
    discoveredSettlementIds: [...new Set([...state.discoveredSettlementIds, ...settlementIds])],
    worldFlags: { ...state.worldFlags, [`lore_${regionId}`]: true },
  };
}
export function completeWorldQuest(state: WorldState, questId: string): WorldState { return { ...state, completedQuestIds: [...new Set([...state.completedQuestIds, questId])] }; }
export function setExclusiveWorldFlag(state: WorldState, selected: string, alternatives: readonly string[]): WorldState { const worldFlags = { ...state.worldFlags }; for (const flag of alternatives) worldFlags[flag] = flag === selected; return { ...state, worldFlags }; }
