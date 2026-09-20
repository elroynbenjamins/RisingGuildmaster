import type { QuestDefinition } from "./questTypes";
import type { WorldState } from "../world/worldTypes";
import type { QuestType } from "./questTypes";
import { isCampaignQuestUnlocked } from "../campaign/campaignService";
import type { Hero } from "../heroes/types";
import { isSettlementAvailable } from "../world/regionalThreatService";

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

export function isQuestAtCurrentLocation(quest: QuestDefinition, world: WorldState): boolean {
  return world.currentRegionId === quest.regionId
    && (!(quest.settlementIds?.length) || (!!world.currentSettlementId && quest.settlementIds.includes(world.currentSettlementId)));
}

export function isQuestAvailableAtCurrentLocation(quest: QuestDefinition, world: WorldState): boolean {
  return isQuestAvailable(quest, world) && isQuestAtCurrentLocation(quest, world);
}

export function isHeroEligibleForPersonalQuest(hero:Hero,quest:QuestDefinition):boolean{const requirement=quest.personalHeroRequirement;if(!requirement)return true;return(!requirement.raceIds?.length||requirement.raceIds.includes(hero.raceId))&&(!requirement.classIds?.length||requirement.classIds.includes(hero.classId))&&(!requirement.backgroundIds?.length||Boolean(hero.backgroundId&&requirement.backgroundIds.includes(hero.backgroundId)))&&hero.level>=(requirement.minimumLevel??1);}
export function getEligiblePersonalQuestHeroes(quest:QuestDefinition,heroes:readonly Hero[]):Hero[]{return quest.personalHeroRequirement?heroes.filter((hero)=>isHeroEligibleForPersonalQuest(hero,quest)):[];}
export function isQuestAvailableForGuild(quest:QuestDefinition,world:WorldState,heroes:readonly Hero[]):boolean{return isQuestAvailable(quest,world)&&(!quest.personalHeroRequirement||getEligiblePersonalQuestHeroes(quest,heroes).length>0);}


export function getQuestStartBlocker(quest: QuestDefinition, world: WorldState, heroes: readonly Hero[]): string | null {
  const highestHeroLevel = Math.max(1, ...heroes.map((hero) => hero.level));
  if (!isQuestBoardCategoryUnlocked(quest.questType, world, highestHeroLevel)) {
    if (quest.questType === "contract") return "Contracts unlock when a hero reaches Level 2.";
    if (quest.questType === "side") return "Side quests unlock when a hero reaches Level 3.";
    if (quest.questType === "boss") return "Boss missions unlock after Chapter 1 is completed.";
    return "This quest category is not unlocked yet.";
  }
  if (!isQuestAvailable(quest, world)) return "Quest prerequisites are not complete yet.";
  if (quest.personalHeroRequirement && !getEligiblePersonalQuestHeroes(quest, heroes).length) return "No active guild hero currently meets this personal quest's requirements.";
  if (quest.settlementIds?.length && world.currentSettlementId && quest.settlementIds.includes(world.currentSettlementId) && !isSettlementAvailable(world, world.currentSettlementId)) return "This quest's settlement is closed by an unresolved regional crisis.";
  if (!isQuestAtCurrentLocation(quest, world)) return "Travel to the quest's region and required settlement before starting.";
  return null;
}

export function isQuestStartableForGuild(quest: QuestDefinition, world: WorldState, heroes: readonly Hero[]): boolean {
  return getQuestStartBlocker(quest, world, heroes) === null;
}
