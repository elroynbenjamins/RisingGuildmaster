import type { QuestDefinition } from "./questTypes";
import type { WorldState } from "../world/worldTypes";
import type { QuestType } from "./questTypes";
import { isCampaignQuestUnlocked } from "../campaign/campaignService";
import type { Hero } from "../heroes/types";

export function isQuestBoardCategoryUnlocked(type: QuestType, world: WorldState, highestHeroLevel = 1): boolean {
  if (type === "campaign") return true;
  if (type === "contract") return highestHeroLevel >= 2;
  if (type === "side") return highestHeroLevel >= 3;
  return world.completedCampaignNodeIds.includes("broken_wardstone");
}

export function isQuestAvailable(quest: QuestDefinition, world: WorldState): boolean {
  return isCampaignQuestUnlocked(quest.id, world)
    && (quest.prerequisiteQuestIds ?? []).every((id) => world.completedQuestIds.includes(id))
    && (quest.prerequisiteCampaignNodeIds ?? []).every((id) => world.completedCampaignNodeIds.includes(id))
    && (quest.requiredWorldFlags ?? []).every((id) => world.worldFlags[id] === true);
}

export function isQuestAvailableAtCurrentLocation(quest: QuestDefinition, world: WorldState): boolean {
  return isQuestAvailable(quest, world)
    && (!(quest.settlementIds?.length) || (!!world.currentSettlementId && quest.settlementIds.includes(world.currentSettlementId)));
}

export function isHeroEligibleForPersonalQuest(hero:Hero,quest:QuestDefinition):boolean{const requirement=quest.personalHeroRequirement;if(!requirement)return true;return(!requirement.raceIds?.length||requirement.raceIds.includes(hero.raceId))&&(!requirement.classIds?.length||requirement.classIds.includes(hero.classId))&&(!requirement.backgroundIds?.length||Boolean(hero.backgroundId&&requirement.backgroundIds.includes(hero.backgroundId)))&&hero.level>=(requirement.minimumLevel??1);}
export function getEligiblePersonalQuestHeroes(quest:QuestDefinition,heroes:readonly Hero[]):Hero[]{return quest.personalHeroRequirement?heroes.filter((hero)=>isHeroEligibleForPersonalQuest(hero,quest)):[];}
export function isQuestAvailableForGuild(quest:QuestDefinition,world:WorldState,heroes:readonly Hero[]):boolean{return isQuestAvailable(quest,world)&&(!quest.personalHeroRequirement||getEligiblePersonalQuestHeroes(quest,heroes).length>0);}
