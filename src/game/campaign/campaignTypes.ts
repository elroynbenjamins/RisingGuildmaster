import type { EventRequirement } from "../world/worldTypes";
export interface CampaignChapterDefinition {
  id: string;
  chapterNumber: number;
  name: string;
  description?: string;
  recommendedLevelMin?: number;
  recommendedLevelMax?: number;
  nodeIds: string[];
  sideQuestIds?: string[];
  completionGoldReward?: number;
  completionReputationReward?: number;
}
export type CampaignNodeType = "dialogue" | "quest" | "choice" | "boss";
export interface CampaignNodeDefinition { id: string; chapterId: string; type: CampaignNodeType; title: string; description?: string; storySceneId?: string; prerequisiteNodeIds: string[]; questId?: string; choiceIds?: string[]; unlockRegionIds?: string[]; setWorldFlags?: Record<string, boolean> }
export interface CampaignChoiceDefinition { id: string; text: string; description?: string; requirements?: EventRequirement[]; setWorldFlags: Record<string, boolean>; mutuallyExclusiveFlagIds?: string[] }
