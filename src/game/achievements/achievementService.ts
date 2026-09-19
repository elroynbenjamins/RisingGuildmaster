import { ACHIEVEMENTS } from "../../data/achievements/achievements";
import { REGIONAL_THREATS } from "../../data/world/regionalThreats";
import { getUnlockedTrophyIds } from "../renown/guildLegacyService";
import type { GuildState } from "../guild/types";
import type { AchievementDefinition, AchievementMetric, AchievementProgress } from "./achievementTypes";
import { getLoreProgress } from "../world/loreService";

function metricValue(guild: GuildState, metric: AchievementMetric): number {
  if (metric === "hero_count") return guild.heroes.length;
  if (metric === "max_hero_level") return Math.max(0, ...guild.heroes.map((hero) => hero.level));
  if (metric === "completed_quests") return new Set(guild.world.completedQuestIds).size;
  if (metric === "campaign_chapter") return guild.world.campaignChapter;
  if (metric === "roguelite_victories") return Object.values(guild.rogueliteRotation.records).reduce((sum, record) => sum + record.victories, 0);
  if (metric === "operation_completions") return guild.guildOperations.completedCount;
  if (metric === "operation_best") return Math.max(0, ...Object.values(guild.guildOperations.bestSuccessesByOperationId ?? {}));
  if (metric === "raid_victories") return Object.values(guild.raidProgress?.records ?? {}).reduce((sum, record) => sum + record.victories, 0);
  if (metric === "lore_entries") return getLoreProgress(guild.world).discovered;
  if (metric === "close_friend_bonds") return guild.relationships.filter((relationship) => relationship.score >= 51).length;
  if (metric === "trophies") return getUnlockedTrophyIds(guild.world.completedQuestIds).length;
  if (metric === "crafted_items") return guild.metrics.craftedItemsCount;
  if (metric === "reputation") return guild.reputation;
  if (metric === "resolved_crises") {
    const completed = new Set(guild.world.completedQuestIds);
    return Object.values(REGIONAL_THREATS).filter((threat) => completed.has(threat.resolutionQuestId)).length;
  }
  return 0;
}

export function getAchievementProgress(guild: GuildState, definition: AchievementDefinition): AchievementProgress {
  const current = metricValue(guild, definition.metric);
  return {
    definition,
    current,
    target: definition.target,
    complete: current >= definition.target,
    claimed: guild.achievementClaims.includes(definition.id),
  };
}

export function getAllAchievementProgress(guild: GuildState): AchievementProgress[] {
  return ACHIEVEMENTS.map((definition) => getAchievementProgress(guild, definition));
}

export function getClaimableAchievements(guild: GuildState): AchievementProgress[] {
  return getAllAchievementProgress(guild).filter((entry) => entry.complete && !entry.claimed);
}

export function claimAchievement(guild: GuildState, achievementId: string): GuildState {
  const definition = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
  if (!definition) throw new Error("Achievement does not exist");
  const progress = getAchievementProgress(guild, definition);
  if (!progress.complete) throw new Error("Achievement requirements are not complete");
  if (progress.claimed) throw new Error("Achievement reward already claimed");
  const transaction = {
    id: `achievement-${achievementId}-day-${guild.currentDay}`,
    type: "achievement" as const,
    amount: definition.rewardGems,
    day: guild.currentDay,
    note: `Achievement: ${definition.title}`,
  };
  return {
    ...guild,
    gems: guild.gems + definition.rewardGems,
    achievementClaims: [...guild.achievementClaims, definition.id],
    gemTransactions: [...guild.gemTransactions, transaction],
  };
}
