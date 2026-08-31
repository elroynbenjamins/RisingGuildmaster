import type { WorldState } from "./worldTypes";
import { WORLD_DEFINITION } from "../../data/world/world";
export const WORLD_NAME = WORLD_DEFINITION.name;
export function createWorldState(): WorldState { return { currentRegionId: "greenveil", currentSettlementId: "guildhaven", unlockedRegionIds: ["greenveil"], discoveredSettlementIds: ["guildhaven"], completedQuestIds: [], completedCampaignNodeIds: [], worldFlags: { lore_greenveil: true, lore_guildhaven: true }, factionReputation: {}, campaignChapter: 1 }; }
