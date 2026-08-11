import type { QuestDefinition } from "./questTypes";
import type { WorldState } from "../world/worldTypes";

export function isQuestAvailable(quest: QuestDefinition, world: WorldState): boolean {
  return (quest.prerequisiteQuestIds ?? []).every((id) => world.completedQuestIds.includes(id))
    && (quest.prerequisiteCampaignNodeIds ?? []).every((id) => world.completedCampaignNodeIds.includes(id))
    && (quest.requiredWorldFlags ?? []).every((id) => world.worldFlags[id] === true);
}
