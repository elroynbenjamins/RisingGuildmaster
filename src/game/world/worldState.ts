import type { WorldState } from "./worldTypes";
import { WORLD_DEFINITION } from "../../data/world/world";
export const WORLD_NAME = WORLD_DEFINITION.name;
export function createWorldState(): WorldState { return { currentRegionId: "greenveil", unlockedRegionIds: ["greenveil"], discoveredSettlementIds: ["guildhaven"], completedQuestIds: [], completedCampaignNodeIds: [], worldFlags: {}, factionReputation: {}, campaignChapter: 1 }; }
