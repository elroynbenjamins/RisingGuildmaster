import { CAMPAIGN_CHAPTERS } from "../../data/campaign/chapter1";
import type { GameIconId } from "../../data/ui/gameIcons";
import { getAvailableCampaignNodes } from "../campaign/campaignService";
import { isQuestBoardCategoryUnlocked } from "../quests/questAvailability";
import type { GuildState } from "./types";
import { QUESTS } from "../../data/quests/quests";

export type GuildPriorityDestination = "recruitment" | "training" | "temple" | "campaign" | "world" | "management";
export interface GuildPriority { id: string; title: string; description: string; actionLabel: string; destination: GuildPriorityDestination; iconId: GameIconId; tone: "urgent" | "progress" | "opportunity" }

export function getGuildPriority(guild: GuildState): GuildPriority {
  const living = guild.heroes.filter((hero) => hero.currentHP > 0); const available = living.filter((hero) => hero.isAvailable); const highestHeroLevel = Math.max(1, ...guild.heroes.map((hero) => hero.level));
  if (!guild.heroes.length) return { id: "found_roster", title: "Recruit Your First Two Heroes", description: "Choose two adventurers, refresh the tavern once for free, then begin the opening campaign.", actionLabel: "Open Recruitment", destination: "recruitment", iconId: "recruitment", tone: "urgent" };
  const fallen = guild.heroes.filter((hero) => hero.currentHP <= 0);
  if (fallen.length) return { id: "revive_fallen", title: "Attend to the Fallen", description: `${fallen.length} hero${fallen.length === 1 ? " is" : "es are"} awaiting revival at the Temple of Renewal.`, actionLabel: "Open Temple", destination: "temple", iconId: "temple", tone: "urgent" };
  if (living.length < 2) return { id: "form_first_pair", title: "Recruit Your Second Hero", description: "The opening Guildhaven missions support a two-hero party. Recruit one companion, then begin the campaign.", actionLabel: "Recruit Hero", destination: "recruitment", iconId: "heroes", tone: "urgent" };
  const threats = Object.entries(guild.world.regionThreat ?? {}).sort((a, b) => b[1] - a[1]);
  if ((threats[0]?.[1] ?? 0) >= 3) return { id: "regional_crisis", title: "Regional Threat Escalating", description: `${threats[0]![0].replace(/_/g, " ")} has reached Threat ${threats[0]![1]}. Ignoring it may close settlements or strengthen encounters.`, actionLabel: "Inspect World", destination: "world", iconId: "world", tone: "urgent" };
  const nodes = getAvailableCampaignNodes(guild.world); const chapter = CAMPAIGN_CHAPTERS[guild.world.campaignChapter];
  if (nodes.length) {
    const nextQuest = nodes[0]!.questId ? QUESTS[nodes[0]!.questId] : undefined;
    if (nextQuest && available.length < nextQuest.minPartySize) return { id: "expand_for_quest", title: "Expand the Party", description: `${nextQuest.name} requires at least ${nextQuest.minPartySize} available heroes. Recruit ${nextQuest.minPartySize - available.length} more before departing.`, actionLabel: "Recruit Heroes", destination: "recruitment", iconId: "heroes", tone: "urgent" };
    const party = [...available].sort((a, b) => b.level - a.level).slice(0, 4); const average = party.reduce((sum, hero) => sum + hero.level, 0) / Math.max(1, party.length);
    const recommendedLevelMin = chapter?.recommendedLevelMin ?? 1;
    if (average < recommendedLevelMin) {
      const preparation = isQuestBoardCategoryUnlocked("contract", guild.world, highestHeroLevel)
        ? "Train or complete contracts"
        : "Train, recruit, or complete available side stories";
      return { id: "prepare_campaign", title: "Prepare for the Next Chapter", description: `Your strongest available party averages Level ${average.toFixed(1)}. ${preparation} before the recommended Level ${recommendedLevelMin}.`, actionLabel: "Open Training", destination: "training", iconId: "training", tone: "progress" };
    }
    return { id: `campaign_${nodes[0]!.id}`, title: nodes[0]!.title, description: nodes[0]!.description ?? `Continue Chapter ${guild.world.campaignChapter} of the Wardstone campaign.`, actionLabel: nodes[0]!.questId ? "Prepare Campaign Quest" : "Continue Story", destination: "campaign", iconId: nodes[0]!.type === "boss" ? "boss" : "quests", tone: "progress" };
  }
  if (guild.trainingGround.sessions.length) return { id: "advance_day", title: "Training in Progress", description: "Advance the guild calendar when your contracts and preparations for the day are complete.", actionLabel: "Open Management", destination: "management", iconId: "calendar", tone: "opportunity" };
  const contractsUnlocked = isQuestBoardCategoryUnlocked("contract", guild.world, highestHeroLevel);
  return contractsUnlocked
    ? { id: "seek_contracts", title: "Strengthen the Guild", description: "Take regional contracts, gather materials, and improve equipment before the next campaign push.", actionLabel: "Explore Eldoria", destination: "world", iconId: "world", tone: "opportunity" }
    : { id: "continue_campaign", title: "Earn Guildhaven's Trust", description: "Continue Chapter 1 and raise a hero to Level 2 to unlock repeatable Greenveil contracts.", actionLabel: "Continue Campaign", destination: "campaign", iconId: "quests", tone: "progress" };
}
