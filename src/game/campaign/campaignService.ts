import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../../data/campaign/chapter1";
import type { WorldState } from "../world/worldTypes";
import { campaignPrerequisitesMet } from "./campaignRequirements";
export interface CampaignCompletionResult { worldState: WorldState; goldReward: number; guildReputationReward: number }
export function getAvailableCampaignNodes(state: WorldState) {
  const chapter = CAMPAIGN_CHAPTERS[state.campaignChapter];
  if (!chapter) return [];
  return chapter.nodeIds.map((id) => CAMPAIGN_NODES[id]!).filter((node) => !state.completedCampaignNodeIds.includes(node.id) && campaignPrerequisitesMet(node, state));
}
export function completeCampaignNode(state: WorldState, nodeId: string): CampaignCompletionResult {
  const node = CAMPAIGN_NODES[nodeId]; if (!node) throw new Error("Unknown campaign node"); if (state.completedCampaignNodeIds.includes(nodeId)) throw new Error("Campaign node is already complete"); if (!campaignPrerequisitesMet(node, state)) throw new Error("Campaign prerequisites are not complete");
  const chapter = Object.values(CAMPAIGN_CHAPTERS).find((entry) => entry.id === node.chapterId); if (!chapter) throw new Error("Unknown campaign chapter");
  const completedCampaignNodeIds = [...state.completedCampaignNodeIds, nodeId]; const worldFlags = { ...state.worldFlags, ...node.setWorldFlags }; const unlockedRegionIds = [...new Set([...state.unlockedRegionIds, ...(node.unlockRegionIds ?? [])])]; const chapterComplete = nodeId === chapter.nodeIds[chapter.nodeIds.length - 1]; const completedQuestIds = node.questId ? [...new Set([...state.completedQuestIds, node.questId])] : state.completedQuestIds;
  return { worldState: { ...state, completedCampaignNodeIds, completedQuestIds, worldFlags, unlockedRegionIds, campaignChapter: chapterComplete ? chapter.chapterNumber + 1 : state.campaignChapter }, goldReward: chapterComplete ? chapter.completionGoldReward ?? 0 : 0, guildReputationReward: chapterComplete ? chapter.completionReputationReward ?? 0 : 0 };
}
