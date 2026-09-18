import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../../data/campaign/chapter1";
import { QUESTS } from "../../data/quests/quests";
import type { WorldState } from "../world/worldTypes";

export interface CampaignLocationRequirement {
  regionId: string;
  settlementIds: string[];
}

function questRequirement(questId: string | undefined): CampaignLocationRequirement | null {
  if (!questId) return null;
  const quest = QUESTS[questId];
  return quest ? { regionId: quest.regionId, settlementIds: [...(quest.settlementIds ?? [])] } : null;
}

export function getCampaignNodeLocationRequirement(nodeId: string): CampaignLocationRequirement | null {
  const node = CAMPAIGN_NODES[nodeId];
  if (!node) return null;
  const direct = questRequirement(node.questId);
  if (direct) return direct;
  const chapter = Object.values(CAMPAIGN_CHAPTERS).find((entry) => entry.id === node.chapterId);
  if (!chapter) return null;
  const index = chapter.nodeIds.indexOf(nodeId);
  for (let distance = 1; distance < chapter.nodeIds.length; distance++) {
    const previousId = chapter.nodeIds[index - distance];
    const nextId = chapter.nodeIds[index + distance];
    const previous = previousId ? questRequirement(CAMPAIGN_NODES[previousId]?.questId) : null;
    if (previous) return previous;
    const next = nextId ? questRequirement(CAMPAIGN_NODES[nextId]?.questId) : null;
    if (next) return next;
  }
  return null;
}

export function isAtCampaignLocation(world: WorldState, requirement: CampaignLocationRequirement | null): boolean {
  if (!requirement) return true;
  if (world.currentRegionId !== requirement.regionId) return false;
  return !requirement.settlementIds.length || Boolean(world.currentSettlementId && requirement.settlementIds.includes(world.currentSettlementId));
}

export function isCampaignNodeAtCurrentLocation(nodeId: string, world: WorldState): boolean {
  return isAtCampaignLocation(world, getCampaignNodeLocationRequirement(nodeId));
}
