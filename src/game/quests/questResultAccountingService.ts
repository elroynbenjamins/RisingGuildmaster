import type { GuildState } from "../guild/types";
import type { Hero } from "../heroes/types";
import { calculateHero } from "../heroes/heroCalculator";
import { isInjuryCondition } from "../conditions/conditionService";
import { getAvailableClassSkillPoints } from "../progression/skills/skillProgressionService";
import { calculateHeroXpGain } from "./questRewardPresentationService";
import type { QuestDefinition } from "./questTypes";
import type { QuestHeroOutcomeRecord } from "./questChronicleTypes";
import type { QuestResultSummary } from "./questResultTypes";

export function buildQuestHeroOutcomes(
  beforeHeroes: readonly Hero[],
  afterHeroes: readonly Hero[],
  partyHeroIds: readonly string[],
): QuestHeroOutcomeRecord[] {
  const beforeById = new Map(beforeHeroes.map((hero) => [hero.id, hero]));
  const partyIds = new Set(partyHeroIds);
  return afterHeroes.filter((hero) => partyIds.has(hero.id)).map((hero) => {
    const before = beforeById.get(hero.id);
    const levelBefore = before?.level ?? hero.level;
    const xpBefore = before?.xp ?? hero.xp;
    const availableSkillPointsBefore = before ? getAvailableClassSkillPoints(before) : 0;
    const availableSkillPointsAfter = getAvailableClassSkillPoints(hero);
    const previousInjuryIds = new Set((before?.conditions ?? []).filter((condition) => isInjuryCondition(condition.conditionId)).map((condition) => condition.conditionId));
    const newlyInjured = hero.conditions.some((condition) => isInjuryCondition(condition.conditionId) && !previousInjuryIds.has(condition.conditionId));
    return {
      heroId: hero.id,
      name: hero.name,
      raceId: hero.raceId,
      classId: hero.classId,
      gender: hero.gender,
      portraitVariant: hero.portraitVariant ?? 0,
      levelBefore,
      levelAfter: hero.level,
      xpBefore,
      xpAfter: hero.xp,
      xpEarned: calculateHeroXpGain(levelBefore, xpBefore, hero.level, hero.xp),
      currentHP: hero.currentHP,
      maxHP: calculateHero(hero).stats.maxHP,
      conditionIds: hero.conditions.map((condition) => condition.conditionId),
      availableSkillPoints: availableSkillPointsAfter,
      availableSkillPointsBefore,
      availableSkillPointsAfter,
      fellInBattle: hero.currentHP <= 0,
      newlyInjured,
    };
  });
}

export function reconcileQuestHeroOutcomeAfterProgression(
  outcome: QuestHeroOutcomeRecord,
  after: Hero,
): QuestHeroOutcomeRecord {
  const levelBefore = Math.max(1, outcome.levelBefore);
  const xpBefore = Math.max(0, outcome.xpBefore ?? 0);
  const availableSkillPointsAfter = getAvailableClassSkillPoints(after);
  return {
    ...outcome,
    levelAfter: after.level,
    xpAfter: after.xp,
    xpEarned: calculateHeroXpGain(levelBefore, xpBefore, after.level, after.xp),
    availableSkillPoints: availableSkillPointsAfter,
    availableSkillPointsAfter,
  };
}

export function buildQuestRewardAccounting(
  beforeGuild: GuildState,
  rewardedGuild: GuildState,
  quest: QuestDefinition,
  status: "victory" | "defeat",
): Pick<QuestResultSummary,
  "goldEarned" |
  "reputationEarned" |
  "guildmasterXpEarned" |
  "guildmasterLevelBefore" |
  "guildmasterLevelAfter" |
  "guildmasterSkillPointsBefore" |
  "guildmasterSkillPointsAfter" |
  "campaignChapterCompleted"
> {
  const campaignChapterCompleted = rewardedGuild.world.campaignChapter > beforeGuild.world.campaignChapter
    ? beforeGuild.world.campaignChapter
    : undefined;
  return {
    goldEarned: Math.max(0, rewardedGuild.gold - beforeGuild.gold),
    reputationEarned: Math.max(0, rewardedGuild.reputation - beforeGuild.reputation),
    guildmasterXpEarned: status === "victory" ? quest.difficulty * 35 : 0,
    guildmasterLevelBefore: beforeGuild.guildmaster.level,
    guildmasterLevelAfter: rewardedGuild.guildmaster.level,
    guildmasterSkillPointsBefore: beforeGuild.guildmaster.skillPoints,
    guildmasterSkillPointsAfter: rewardedGuild.guildmaster.skillPoints,
    ...(campaignChapterCompleted ? { campaignChapterCompleted } : {}),
  };
}
