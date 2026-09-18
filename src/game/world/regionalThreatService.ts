import { REGIONAL_THREATS } from "../../data/world/regionalThreats";
import type { WorldState } from "./worldTypes";

export const REGIONAL_THREAT_UNLOCK_FLAG = "regional_threats_unlocked";
export const REGIONAL_THREAT_REQUIRED_HERO_COUNT = 6;
export const REGIONAL_THREAT_MIN_HERO_LEVEL = 2;

export interface RegionThreatEffects {
  enemyLevelModifier: number;
  enemyCountModifier: number;
  contractGoldModifier: number;
  unavailableSettlementIds: string[];
}

export function canUnlockRegionalThreats(heroes: readonly { level: number }[]): boolean {
  return heroes.filter((hero) => hero.level >= REGIONAL_THREAT_MIN_HERO_LEVEL).length >= REGIONAL_THREAT_REQUIRED_HERO_COUNT;
}

export function areRegionalThreatsUnlocked(state: WorldState): boolean {
  return state.worldFlags[REGIONAL_THREAT_UNLOCK_FLAG] === true;
}

export function unlockRegionalThreats(state: WorldState): WorldState {
  if (areRegionalThreatsUnlocked(state)) return state;
  return { ...state, regionCrisisDays: {}, regionThreat: {}, worldFlags: { ...state.worldFlags, [REGIONAL_THREAT_UNLOCK_FLAG]: true } };
}

function isCrisisActive(state: WorldState, regionId: string): boolean {
  if (!areRegionalThreatsUnlocked(state)) return false;
  const crisis = REGIONAL_THREATS[regionId];
  if (!crisis || state.completedQuestIds.includes(crisis.resolutionQuestId)) return false;
  return !crisis.activationWorldFlag || state.worldFlags[crisis.activationWorldFlag] === true;
}

export function advanceRegionalThreats(state: WorldState, days: number): WorldState {
  let regionCrisisDays = { ...(state.regionCrisisDays ?? {}) };
  let regionThreat = { ...(state.regionThreat ?? {}) };
  let changed = false;

  for (const crisis of Object.values(REGIONAL_THREATS)) {
    if (!isCrisisActive(state, crisis.regionId)) continue;
    changed = true;
    const elapsed = (regionCrisisDays[crisis.regionId] ?? 0) + days;
    const threat = Math.min(crisis.maximumThreat, Math.floor(elapsed / crisis.daysPerThreat));
    regionCrisisDays = { ...regionCrisisDays, [crisis.regionId]: elapsed };
    regionThreat = { ...regionThreat, [crisis.regionId]: Math.max(regionThreat[crisis.regionId] ?? 0, threat) };
  }

  return changed ? { ...state, regionCrisisDays, regionThreat } : state;
}

export function resolveRegionalThreatForQuest(state: WorldState, questId: string): WorldState {
  const crisis = Object.values(REGIONAL_THREATS).find((entry) => entry.resolutionQuestId === questId);
  if (!crisis) return state;
  return {
    ...state,
    regionThreat: { ...(state.regionThreat ?? {}), [crisis.regionId]: 0 },
    worldFlags: { ...state.worldFlags, [`${crisis.regionId}_threat_resolved`]: true },
  };
}

export function getRegionThreatEffects(state: WorldState, regionId: string): RegionThreatEffects {
  const crisis = REGIONAL_THREATS[regionId];
  const threat = isCrisisActive(state, regionId) ? state.regionThreat?.[regionId] ?? 0 : 0;
  return {
    enemyLevelModifier: threat >= 2 ? 1 : 0,
    enemyCountModifier: threat >= 3 ? .25 : 0,
    contractGoldModifier: threat >= 3 ? .25 : 0,
    unavailableSettlementIds: crisis && threat >= crisis.maximumThreat ? [crisis.threatenedSettlementId] : [],
  };
}

export function isSettlementAvailable(state: WorldState, settlementId: string): boolean {
  return !Object.keys(REGIONAL_THREATS).some((regionId) =>
    getRegionThreatEffects(state, regionId).unavailableSettlementIds.includes(settlementId),
  );
}
