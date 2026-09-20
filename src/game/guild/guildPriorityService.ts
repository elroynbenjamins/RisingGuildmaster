import { CAMPAIGN_CHAPTERS } from "../../data/campaign/chapter1";
import type { GameIconId } from "../../data/ui/gameIcons";
import { getAvailableCampaignNodes } from "../campaign/campaignService";
import { isQuestBoardCategoryUnlocked } from "../quests/questAvailability";
import type { GuildState } from "./types";
import { QUESTS } from "../../data/quests/quests";
import { needsBramblefordSideQuest, needsFourthHeroForChieftain, needsStarterJourneyTravel, needsStarterRoadEncounter, needsThirdHeroForJourney } from "../onboarding/starterJourneyService";
import { getCampaignLevelGuidance } from "../campaign/campaignReadinessService";

export type GuildPriorityDestination = "recruitment" | "training" | "temple" | "campaign" | "world" | "management" | "sideQuests";
export interface GuildPriority { id: string; title: string; description: string; actionLabel: string; destination: GuildPriorityDestination; iconId: GameIconId; tone: "urgent" | "progress" | "opportunity" }

export function getGuildPriority(guild: GuildState): GuildPriority {
  const living = guild.heroes.filter((hero) => hero.currentHP > 0); const available = living.filter((hero) => hero.isAvailable); const highestHeroLevel = Math.max(1, ...guild.heroes.map((hero) => hero.level));
  if (!guild.heroes.length) return { id: "found_roster", title: "Recruit Your First Two Heroes", description: "Choose two adventurers, refresh the tavern once for free, then begin the opening campaign.", actionLabel: "Open Recruitment", destination: "recruitment", iconId: "recruitment", tone: "urgent" };
  const fallen = guild.heroes.filter((hero) => hero.currentHP <= 0);
  if (fallen.length) return { id: "revive_fallen", title: "Attend to the Fallen", description: `${fallen.length} hero${fallen.length === 1 ? " is" : "es are"} awaiting revival at the Temple of Renewal.`, actionLabel: "Open Temple", destination: "temple", iconId: "temple", tone: "urgent" };
  if (living.length < 2) return { id: "form_first_pair", title: "Recruit Your Second Hero", description: "The opening Guildhaven missions support a two-hero party. Recruit one companion, then begin the campaign.", actionLabel: "Recruit Hero", destination: "recruitment", iconId: "heroes", tone: "urgent" };
  const threats = Object.entries(guild.world.regionThreat ?? {}).sort((a, b) => b[1] - a[1]);
  if ((threats[0]?.[1] ?? 0) >= 3) return { id: "regional_crisis", title: "Regional Threat Escalating", description: `${threats[0]![0].replace(/_/g, " ")} has reached Threat ${threats[0]![1]}. Ignoring it may close settlements or strengthen encounters.`, actionLabel: "Inspect World", destination: "world", iconId: "world", tone: "urgent" };
  if (needsThirdHeroForJourney(guild)) return { id: "recruit_third_for_brambleway", title: "Recruit a Third Hero", description: "Guildhaven needs a three-hero escort to protect Aldren Vale's caravan on the Brambleway.", actionLabel: "Open Recruitment", destination: "recruitment", iconId: "heroes", tone: "urgent" };
  if (needsStarterJourneyTravel(guild)) return { id: "travel_to_brambleford", title: "Travel to Brambleford", description: "Open Greenveil's regional map and walk to Brambleford. The caravan's first day on the road will be dangerous.", actionLabel: "Open World Map", destination: "world", iconId: "world", tone: "urgent" };
  if (needsStarterRoadEncounter(guild)) return { id: "answer_brambleway_alarm", title: "Defend Aldren's Caravan", description: "You reached Brambleford, but the road alarm is still active. Return to its regional map and answer the attack; no additional travel day is required.", actionLabel: "Return to Brambleford", destination: "world", iconId: "quests", tone: "urgent" };
  if (needsBramblefordSideQuest(guild)) return { id: "brambleford_side_quest", title: "Complete The Brambleway Run", description: "The caravan reached Brambleford. Take Aldren's local escort charter there before challenging the Chieftain.", actionLabel: "Open World Map", destination: "world", iconId: "quests", tone: "progress" };
  if (needsFourthHeroForChieftain(guild)) return { id: "recruit_fourth_for_chieftain", title: "Recruit a Fourth Hero", description: "The Chieftain's hideout needs a full four-hero company. Recruit one more adventurer, then lead the assault.", actionLabel: "Open Recruitment", destination: "recruitment", iconId: "heroes", tone: "urgent" };
  const nodes = getAvailableCampaignNodes(guild.world); const chapter = CAMPAIGN_CHAPTERS[guild.world.campaignChapter];
  if (nodes.length) {
    const nextQuest = nodes[0]!.questId ? QUESTS[nodes[0]!.questId] : undefined;
    if (nextQuest && available.length < nextQuest.minPartySize) return { id: "expand_for_quest", title: "Expand the Party", description: `${nextQuest.name} requires at least ${nextQuest.minPartySize} available heroes. Recruit ${nextQuest.minPartySize - available.length} more before departing.`, actionLabel: "Recruit Heroes", destination: "recruitment", iconId: "heroes", tone: "urgent" };
    const party = [...available].sort((a, b) => b.level - a.level).slice(0, 4); const average = party.reduce((sum, hero) => sum + hero.level, 0) / Math.max(1, party.length);
    const recommendedLevelMin = chapter?.recommendedLevelMin ?? 1;
    const levelGuidance = getCampaignLevelGuidance(guild);
    if (levelGuidance) {
      const hasSideQuests = levelGuidance.sideQuestIds.length > 0;
      return { id: "prepare_campaign", title: "Prepare the Field Team", description: `Your four strongest heroes average Level ${levelGuidance.averageLevel.toFixed(1)} before ${levelGuidance.nextQuestName} (recommended Level ${levelGuidance.targetLevel}). ${hasSideQuests ? "Complete one-time Side Quests to catch up without repetitive grinding." : "Use training and available field work to close the gap."}`, actionLabel: hasSideQuests ? "Browse Side Quests" : "Open Training", destination: hasSideQuests ? "sideQuests" : "training", iconId: hasSideQuests ? "quests" : "training", tone: "progress" };
    }
    if (average < recommendedLevelMin) {
      const preparation = isQuestBoardCategoryUnlocked("contract", guild.world, highestHeroLevel)
        ? "Train or pursue road encounters"
        : "Train, recruit, or complete available side stories";
      return { id: "prepare_campaign", title: "Prepare for the Next Chapter", description: `Your strongest available party averages Level ${average.toFixed(1)}. ${preparation} before the recommended Level ${recommendedLevelMin}.`, actionLabel: "Open Training", destination: "training", iconId: "training", tone: "progress" };
    }
    return { id: `campaign_${nodes[0]!.id}`, title: nodes[0]!.title, description: nodes[0]!.description ?? `Continue Chapter ${guild.world.campaignChapter} of the Wardstone campaign.`, actionLabel: nodes[0]!.questId ? "Prepare Campaign Quest" : "Continue Story", destination: "campaign", iconId: nodes[0]!.type === "boss" ? "boss" : "quests", tone: "progress" };
  }
  if (guild.trainingGround.sessions.length) return { id: "advance_day", title: "Training in Progress", description: "Advance the guild calendar when your journeys and preparations for the day are complete.", actionLabel: "Open Management", destination: "management", iconId: "calendar", tone: "opportunity" };
  const contractsUnlocked = isQuestBoardCategoryUnlocked("contract", guild.world, highestHeroLevel);
  return contractsUnlocked
    ? { id: "seek_contracts", title: "Strengthen the Guild", description: "Travel regional roads to discover repeatable encounters, gather materials, and improve equipment before the next campaign push.", actionLabel: "Explore Eldoria", destination: "world", iconId: "world", tone: "opportunity" }
    : { id: "continue_campaign", title: "Earn Guildhaven's Trust", description: "Continue Chapter 1 and raise a hero to Level 2 to unlock repeatable Greenveil road encounters.", actionLabel: "Continue Campaign", destination: "campaign", iconId: "quests", tone: "progress" };
}
