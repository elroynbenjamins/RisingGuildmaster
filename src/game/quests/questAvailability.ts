import type { QuestDefinition } from "./questTypes";
import type { WorldState } from "../world/worldTypes";
import type { QuestType } from "./questTypes";

export function isQuestBoardCategoryUnlocked(type: QuestType, world: WorldState): boolean {
  if (type === "campaign") return true;
  if (type === "boss") return world.completedCampaignNodeIds.includes("broken_wardstone");
  return world.completedCampaignNodeIds.includes("missing_merchant");
}

export function isQuestAvailable(quest: QuestDefinition, world: WorldState): boolean {
  return (quest.prerequisiteQuestIds ?? []).every((id) => world.completedQuestIds.includes(id))
    && (quest.prerequisiteCampaignNodeIds ?? []).every((id) => world.completedCampaignNodeIds.includes(id))
    && (quest.requiredWorldFlags ?? []).every((id) => world.worldFlags[id] === true);
}
