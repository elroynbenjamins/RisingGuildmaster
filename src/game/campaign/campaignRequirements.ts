import type { WorldState } from "../world/worldTypes";
import type { CampaignNodeDefinition } from "./campaignTypes";
export function campaignPrerequisitesMet(node: CampaignNodeDefinition, state: WorldState): boolean { return node.prerequisiteNodeIds.every((id) => state.completedCampaignNodeIds.includes(id)); }
