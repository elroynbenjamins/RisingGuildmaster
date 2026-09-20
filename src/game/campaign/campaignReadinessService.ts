import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../../data/campaign/chapter1";
import { QUESTS } from "../../data/quests/quests";
import type { GuildState } from "../guild/types";
import type { Hero } from "../heroes/types";
import { hasCompletedQuestOnce } from "../quests/questCompletionService";
import { isQuestAvailableForGuild } from "../quests/questAvailability";
import { getAvailableCampaignNodes } from "./campaignService";

export interface CampaignLevelGuidance {
  averageLevel: number;
  targetLevel: number;
  nextQuestId: string;
  nextQuestName: string;
  sideQuestIds: string[];
}

/** Average of the four strongest heroes, or the entire roster while it is smaller than four. */
export function getTopHeroAverageLevel(heroes: readonly Hero[], count = 4): number {
  const strongest = [...heroes].sort((a, b) => b.level - a.level).slice(0, count);
  if (!strongest.length) return 0;
  return strongest.reduce((sum, hero) => sum + hero.level, 0) / strongest.length;
}

function hasReachedChieftain(guild: GuildState): boolean {
  return guild.world.campaignChapter > 1 || guild.world.completedCampaignNodeIds.includes("attack_on_guildhaven");
}

/**
 * Once the Goblin Chieftain is reached, the campaign stops silently letting an
 * under-levelled roster walk into the next story fight. The game recommends
 * authored, one-time side quests instead of inflating repeatable grind XP.
 */
function getNextCampaignBattle(guild: GuildState) {
  const available = getAvailableCampaignNodes(guild.world).find((node) => Boolean(node.questId && QUESTS[node.questId]));
  if (available?.questId) return available;

  // The Chieftain can be story-gated by the starter travel/recruitment steps. We
  // still want to warn about level readiness once the player has reached that
  // point, so fall back to the next ordered battle whose preceding story node is
  // complete even if another non-level prerequisite is still pending.
  const chapter = CAMPAIGN_CHAPTERS[guild.world.campaignChapter];
  return chapter?.nodeIds
    .map((id) => CAMPAIGN_NODES[id])
    .find((node) => Boolean(node?.questId)
      && !guild.world.completedCampaignNodeIds.includes(node!.id)
      && (node!.prerequisiteNodeIds ?? []).every((id) => guild.world.completedCampaignNodeIds.includes(id)));
}

export function getCampaignLevelGuidance(guild: GuildState): CampaignLevelGuidance | null {
  if (!hasReachedChieftain(guild)) return null;
  const nextCampaignNode = getNextCampaignBattle(guild);
  if (!nextCampaignNode?.questId) return null;
  const nextQuest = QUESTS[nextCampaignNode.questId];
  if (!nextQuest) return null;
  const averageLevel = getTopHeroAverageLevel(guild.heroes);
  const targetLevel = nextQuest.recommendedLevelMin ?? 1;
  if (averageLevel >= targetLevel) return null;

  const sideQuestIds = Object.values(QUESTS)
    .filter((quest) => quest.questType === "side" && !quest.hiddenFromQuestBoard && !quest.repeatable)
    .filter((quest) => guild.world.unlockedRegionIds.includes(quest.regionId))
    .filter((quest) => !hasCompletedQuestOnce(guild, quest.id))
    .filter((quest) => isQuestAvailableForGuild(quest, guild.world, guild.heroes))
    .sort((a, b) => {
      const aLevel = a.recommendedLevelMin ?? 1;
      const bLevel = b.recommendedLevelMin ?? 1;
      const aFit = Math.abs(aLevel - averageLevel);
      const bFit = Math.abs(bLevel - averageLevel);
      return aFit - bFit || aLevel - bLevel || a.name.localeCompare(b.name);
    })
    .map((quest) => quest.id);

  return { averageLevel, targetLevel, nextQuestId: nextQuest.id, nextQuestName: nextQuest.name, sideQuestIds };
}
