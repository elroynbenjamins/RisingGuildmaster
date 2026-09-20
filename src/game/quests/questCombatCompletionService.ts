import { CAMPAIGN_NODES } from "../../data/campaign/chapter1";
import { QUESTS } from "../../data/quests/quests";
import type { RandomSource } from "../../utils/random";
import { completeCampaignNode } from "../campaign/campaignService";
import type { HeroCombatInstance } from "../combat/combatTypes";
import { advanceGuildTime } from "../economy/guildCalendarService";
import type { GuildState } from "../guild/types";
import { calculateHero } from "../heroes/heroCalculator";
import { applyQuestLoyaltyConsequences } from "../heroes/heroLoyaltyService";
import { applyStoryRaceUnlocks } from "../monetization/contentUnlockService";
import type { Party } from "../party/partyTypes";
import { getAvailableClassSkillPoints } from "../progression/skills/skillProgressionService";
import { findRaidByQuestId, recordRaidOutcome } from "../raids/raidService";
import { resolveCampConversation } from "../relationships/campConversationService";
import { applyQuestRelationshipConsequences } from "../relationships/relationshipService";
import { resolveRegionalThreatForQuest } from "../world/regionalThreatService";
import { createQuestChronicleEntry, recordQuestChronicle } from "./questChronicleService";
import type { QuestResultSummary } from "./questResultTypes";
import { calculateHeroXpGain } from "./questRewardPresentationService";
import { resolveQuestDefeat, resolveQuestVictory } from "./questResolver";
import { startQuest } from "./questService";

export interface CompleteQuestCombatInput {
  guild: GuildState;
  questId: string;
  party: Party;
  status: "victory" | "defeat";
  heroInstances: HeroCombatInstance[];
  random: RandomSource;
  campaignNodeId?: string;
  returnRegionId?: string;
}

export interface CompleteQuestCombatResult {
  guild: GuildState;
  summary: QuestResultSummary;
}

/**
 * Applies every persistent consequence of a finished tactical quest in one
 * domain-layer transaction. App.tsx only decides where to navigate afterward.
 */
export function completeQuestCombat(input: CompleteQuestCombatInput): CompleteQuestCombatResult {
  const { guild, questId, party, status, heroInstances, random, campaignNodeId, returnRegionId } = input;
  const quest = QUESTS[questId];
  if (!quest) throw new Error(`Unknown quest: ${questId}`);

  const participants = guild.heroes.filter((hero) => party.heroIds.includes(hero.id));
  const active = startQuest(quest, party);
  const result = status === "victory"
    ? resolveQuestVictory(active, party, guild, heroInstances, random)
    : resolveQuestDefeat(active, party, guild, heroInstances, random);

  let updated = result.guild;

  if (status === "victory" && !quest.repeatable && !updated.world.completedQuestIds.includes(questId)) {
    updated = {
      ...updated,
      world: {
        ...updated.world,
        completedQuestIds: [...updated.world.completedQuestIds, questId],
      },
    };
  }

  if (status === "victory" && quest.setWorldFlagsOnVictory) {
    updated = {
      ...updated,
      world: {
        ...updated.world,
        worldFlags: { ...updated.world.worldFlags, ...quest.setWorldFlagsOnVictory },
      },
    };
  }

  if (status === "victory") {
    updated = applyStoryRaceUnlocks(updated);
    updated = { ...updated, world: resolveRegionalThreatForQuest(updated.world, quest.id) };
  }

  if (status === "victory" && campaignNodeId && CAMPAIGN_NODES[campaignNodeId]?.type !== "boss") {
    const campaign = completeCampaignNode(updated.world, campaignNodeId);
    updated = {
      ...updated,
      world: campaign.worldState,
      gold: updated.gold + campaign.goldReward,
      reputation: updated.reputation + campaign.guildReputationReward,
    };
  }

  const beforeById = new Map(participants.map((hero) => [hero.id, hero]));
  const heroOutcomes = updated.heroes
    .filter((hero) => party.heroIds.includes(hero.id))
    .map((hero) => {
      const before = beforeById.get(hero.id);
      const hadInjury = before?.conditions.some((condition) => condition.conditionId === "injured") ?? false;
      return {
        heroId: hero.id,
        name: hero.name,
        raceId: hero.raceId,
        classId: hero.classId,
        gender: hero.gender,
        portraitVariant: hero.portraitVariant ?? 0,
        levelBefore: before?.level ?? hero.level,
        levelAfter: hero.level,
        xpBefore: before?.xp ?? hero.xp,
        xpAfter: hero.xp,
        xpEarned: before ? calculateHeroXpGain(before.level, before.xp, hero.level, hero.xp) : 0,
        currentHP: hero.currentHP,
        maxHP: calculateHero(hero).stats.maxHP,
        conditionIds: hero.conditions.map((condition) => condition.conditionId),
        availableSkillPoints: getAvailableClassSkillPoints(hero),
        availableSkillPointsBefore: before ? getAvailableClassSkillPoints(before) : 0,
        availableSkillPointsAfter: getAvailableClassSkillPoints(hero),
        fellInBattle: hero.currentHP <= 0,
        newlyInjured: !hadInjury && hero.conditions.some((condition) => condition.conditionId === "injured"),
      };
    });

  const relationshipResult = applyQuestRelationshipConsequences(updated, status, heroOutcomes, quest.id, quest.name);
  updated = relationshipResult.guild;

  const campResult = resolveCampConversation(updated, status, party.heroIds, heroOutcomes, quest.id, quest.name, random);
  updated = campResult.guild;
  updated = applyQuestLoyaltyConsequences(updated, status, heroOutcomes, quest);

  const raid = findRaidByQuestId(questId);
  if (raid) {
    updated = recordRaidOutcome(
      updated,
      raid.id,
      status === "victory",
      heroOutcomes.filter((hero) => !hero.fellInBattle).length,
    );
  }

  const rewardGoldEarned = Math.max(0, updated.gold - guild.gold);
  const reputationEarned = Math.max(0, updated.reputation - guild.reputation);
  const guildmasterXpEarned = status === "victory" ? quest.difficulty * 35 : 0;
  const campaignChapterCompleted = updated.world.campaignChapter > guild.world.campaignChapter ? guild.world.campaignChapter : undefined;

  const chronicle = createQuestChronicleEntry({
    quest,
    status,
    day: guild.currentDay,
    worldBefore: guild.world,
    worldAfter: updated.world,
    heroOutcomes,
    relationshipChanges: relationshipResult.changes,
    campConversation: campResult.conversation,
  });

  updated = recordQuestChronicle(updated, chronicle);
  updated = advanceGuildTime({ ...updated, recentPartyHeroIds: party.heroIds }).guild;

  return {
    guild: updated,
    summary: {
      questId,
      status,
      goldEarned: rewardGoldEarned,
      reputationEarned,
      guildmasterXpEarned,
      guildmasterLevelBefore: guild.guildmaster.level,
      guildmasterLevelAfter: updated.guildmaster.level,
      guildmasterSkillPointsBefore: guild.guildmaster.skillPoints,
      guildmasterSkillPointsAfter: updated.guildmaster.skillPoints,
      campaignChapterCompleted,
      xpEarnedPerHero: result.activeQuest.xpEarnedPerHero,
      lootIds: result.activeQuest.collectedLootIds,
      materials: result.activeQuest.collectedMaterials,
      heroOutcomes,
      chronicle,
      campaignNodeId,
      returnRegionId,
    },
  };
}
