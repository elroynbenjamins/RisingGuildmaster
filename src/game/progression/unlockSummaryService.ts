import { CLASSES } from "../../data/classes/classes";
import { CAMPAIGN_CHAPTERS } from "../../data/campaign/chapter1";
import { CRAFTING_RECIPES } from "../../data/crafting/recipes";
import { RACES } from "../../data/races/races";
import { RAIDS } from "../../data/raids/raids";
import { REGIONS } from "../../data/world/regions";
import type { GameIconId } from "../../data/ui/gameIcons";
import type { GuildState } from "../guild/types";
import { isChapterOneComplete } from "../dungeons/rogueliteRotationService";
import { GUILD_OPERATION_TEAM_SIZE, isGuildOperationsUnlocked } from "../operations/guildOperationService";
import { isRaidUnlocked } from "../raids/raidService";
import { resolveEquipmentDefinition } from "../equipment/equipmentResolver";

export interface UnlockNotice {
  id: string;
  title: string;
  detail: string;
  iconId: GameIconId;
}

export function getCurrentUnlockNotices(guild: GuildState): UnlockNotice[] {
  const notices: UnlockNotice[] = [];

  for (const chapter of Object.values(CAMPAIGN_CHAPTERS)) {
    const complete = chapter.nodeIds.every((id) => guild.world.completedCampaignNodeIds.includes(id));
    if (complete) notices.push({ id:`chapter:${chapter.id}`, title:`Chapter ${chapter.chapterNumber} Complete · ${chapter.name}`, detail:`Campaign milestone secured. +${chapter.completionGoldReward ?? 0} gold · +${chapter.completionReputationReward ?? 0} reputation.`, iconId:"victory" });
  }

  for (const regionId of guild.world.unlockedRegionIds) {
    notices.push({ id:`region:${regionId}`, title:REGIONS[regionId]?.name ?? regionId, detail:"Region available for travel and quests.", iconId:"world" });
  }

  for (const classId of guild.entitlements.unlockedClassIds) {
    notices.push({ id:`class:${classId}`, title:CLASSES[classId]?.name ?? classId, detail:"Class available in recruitment and scouting.", iconId:"hero_codex" });
  }
  for (const raceId of guild.entitlements.unlockedRaceIds) {
    notices.push({ id:`race:${raceId}`, title:RACES[raceId]?.name ?? raceId, detail:"Race available in recruitment and scouting.", iconId:"hero_codex" });
  }

  for (const recipeId of guild.unlockedRecipeIds ?? []) {
    const recipe = CRAFTING_RECIPES[recipeId];
    const item = recipe ? resolveEquipmentDefinition(recipe.outputEquipmentId) : undefined;
    notices.push({ id:`recipe:${recipeId}`, title:item?.name ?? recipeId.replace(/_/g," "), detail:"New crafting pattern unlocked.", iconId:"blacksmith" });
  }

  if (isGuildOperationsUnlocked(guild) && guild.heroes.length >= GUILD_OPERATION_TEAM_SIZE * 2) notices.push({ id:"system:operations", title:"Crisis Operations", detail:"Six-hero strategic operations are now available.", iconId:"management" });
  if (isChapterOneComplete(guild) && guild.heroes.length >= 6) notices.push({ id:"system:roguelite", title:"Roguelite Expeditions", detail:"Four-hero branching Wardstone expeditions are now available.", iconId:"loot" });

  for (const raid of Object.values(RAIDS)) {
    if (isRaidUnlocked(raid, guild.world.campaignChapter, guild.heroes.length)) notices.push({ id:`raid:${raid.id}`, title:raid.name, detail:"Guild Raid unlocked.", iconId:"boss" });
  }

  if (guild.trainingGround.level > 1) notices.push({ id:`facility:training:${guild.trainingGround.level}`, title:`Training Hall Level ${guild.trainingGround.level}`, detail:`Facility upgrade complete. ${guild.trainingGround.level} training slots are now available.`, iconId:"training" });
  if (guild.finance.tavernLevel > 1) notices.push({ id:`facility:tavern:${guild.finance.tavernLevel}`, title:`Guild Hall & Tavern Level ${guild.finance.tavernLevel}`, detail:"Facility upgrade complete. Tavern income and recruitment capacity have improved.", iconId:"management" });

  for (const [artisanId,state] of Object.entries(guild.artisans)) {
    if (!state.recruited || state.level <= 0) continue;
    notices.push({ id:`workshop:${artisanId}:${state.level}`, title:`${artisanId.replace(/_/g," ")} Level ${state.level}`, detail:"Workshop tier is operational.", iconId:artisanId==="blacksmith"?"blacksmith":artisanId==="tailor"?"tailor":"jeweler" });
  }

  return notices;
}

export function getNewUnlockNotices(guild: GuildState): UnlockNotice[] {
  const seen = new Set(guild.seenUnlockSummaryIds);
  return getCurrentUnlockNotices(guild).filter((notice) => !seen.has(notice.id));
}

export function acknowledgeUnlockNotices(guild: GuildState, noticeIds: readonly string[]): GuildState {
  return { ...guild, seenUnlockSummaryIds: [...new Set([...guild.seenUnlockSummaryIds, ...noticeIds])] };
}

export function getInitialSeenUnlockIds(guild: GuildState): string[] {
  return getCurrentUnlockNotices(guild).map((notice) => notice.id);
}
