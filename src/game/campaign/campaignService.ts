import { CAMPAIGN_NODES, CHAPTER_1 } from "../../data/campaign/chapter1";
import type { WorldState } from "../world/worldTypes";
import { campaignPrerequisitesMet } from "./campaignRequirements";
export interface CampaignCompletionResult { worldState: WorldState; goldReward: number; guildReputationReward: number }
export function getAvailableCampaignNodes(state: WorldState) { return CHAPTER_1.nodeIds.map((id) => CAMPAIGN_NODES[id]!).filter((node) => !state.completedCampaignNodeIds.includes(node.id) && campaignPrerequisitesMet(node, state)); }
export function completeCampaignNode(state: WorldState, nodeId: string): CampaignCompletionResult {
  const node = CAMPAIGN_NODES[nodeId]; if (!node) throw new Error("Unknown campaign node"); if (state.completedCampaignNodeIds.includes(nodeId)) throw new Error("Campaign node is already complete"); if (!campaignPrerequisitesMet(node, state)) throw new Error("Campaign prerequisites are not complete");
  const completedCampaignNodeIds = [...state.completedCampaignNodeIds, nodeId]; const worldFlags = { ...state.worldFlags, ...node.setWorldFlags }; const unlockedRegionIds = [...new Set([...state.unlockedRegionIds, ...(node.unlockRegionIds ?? [])])]; const chapterComplete = nodeId === "broken_wardstone"; const completedQuestIds = node.questId ? [...new Set([...state.completedQuestIds, node.questId])] : state.completedQuestIds;
  return { worldState: { ...state, completedCampaignNodeIds, completedQuestIds, worldFlags, unlockedRegionIds, campaignChapter: chapterComplete ? 2 : state.campaignChapter }, goldReward: chapterComplete ? 500 : 0, guildReputationReward: chapterComplete ? 10 : 0 };
}
