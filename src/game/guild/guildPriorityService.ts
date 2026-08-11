import { CAMPAIGN_CHAPTERS } from "../../data/campaign/chapter1";
import type { GameIconId } from "../../data/ui/gameIcons";
import { getAvailableCampaignNodes } from "../campaign/campaignService";
import type { GuildState } from "./types";

export type GuildPriorityDestination = "recruitment" | "training" | "temple" | "campaign" | "world" | "management";
export interface GuildPriority { id: string; title: string; description: string; actionLabel: string; destination: GuildPriorityDestination; iconId: GameIconId; tone: "urgent" | "progress" | "opportunity" }

export function getGuildPriority(guild: GuildState): GuildPriority {
  const living = guild.heroes.filter((hero) => hero.currentHP > 0); const available = living.filter((hero) => hero.isAvailable);
  if (!guild.heroes.length) return { id: "found_roster", title: "Recruit Your First Heroes", description: "A guild needs at least four adventurers before it can field a complete tactical party.", actionLabel: "Open Recruitment", destination: "recruitment", iconId: "recruitment", tone: "urgent" };
  const fallen = guild.heroes.filter((hero) => hero.currentHP <= 0);
  if (fallen.length) return { id: "revive_fallen", title: "Attend to the Fallen", description: `${fallen.length} hero${fallen.length === 1 ? " is" : "es are"} awaiting revival at the Temple of Renewal.`, actionLabel: "Open Temple", destination: "temple", iconId: "temple", tone: "urgent" };
  if (living.length < 4) return { id: "fill_party", title: "Complete Your First Party", description: `Recruit ${4 - living.length} more hero${4 - living.length === 1 ? "" : "es"} to field four adventurers.`, actionLabel: "Recruit Heroes", destination: "recruitment", iconId: "heroes", tone: "progress" };
  const threats = Object.entries(guild.world.regionThreat ?? {}).sort((a, b) => b[1] - a[1]);
  if ((threats[0]?.[1] ?? 0) >= 3) return { id: "regional_crisis", title: "Regional Threat Escalating", description: `${threats[0]![0].replace(/_/g, " ")} has reached Threat ${threats[0]![1]}. Ignoring it may close settlements or strengthen encounters.`, actionLabel: "Inspect World", destination: "world", iconId: "world", tone: "urgent" };
  const nodes = getAvailableCampaignNodes(guild.world); const chapter = CAMPAIGN_CHAPTERS[guild.world.campaignChapter];
  if (nodes.length) {
    const party = [...available].sort((a, b) => b.level - a.level).slice(0, 4); const average = party.reduce((sum, hero) => sum + hero.level, 0) / Math.max(1, party.length);
    const recommendedLevelMin = chapter?.recommendedLevelMin ?? 1;
    if (average < recommendedLevelMin) return { id: "prepare_campaign", title: "Prepare for the Next Chapter", description: `Your strongest available party averages Level ${average.toFixed(1)}. Train or complete contracts before the recommended Level ${recommendedLevelMin}.`, actionLabel: "Open Training", destination: "training", iconId: "training", tone: "progress" };
    return { id: `campaign_${nodes[0]!.id}`, title: nodes[0]!.title, description: nodes[0]!.description ?? `Continue Chapter ${guild.world.campaignChapter} of the Wardstone campaign.`, actionLabel: nodes[0]!.questId ? "Prepare Campaign Quest" : "Continue Story", destination: "campaign", iconId: nodes[0]!.type === "boss" ? "boss" : "quests", tone: "progress" };
  }
  if (guild.trainingGround.sessions.length) return { id: "advance_day", title: "Training in Progress", description: "Advance the guild calendar when your contracts and preparations for the day are complete.", actionLabel: "Open Management", destination: "management", iconId: "calendar", tone: "opportunity" };
  return { id: "seek_contracts", title: "Strengthen the Guild", description: "Take regional contracts, gather materials, and improve equipment before the next campaign push.", actionLabel: "Explore Eldoria", destination: "world", iconId: "world", tone: "opportunity" };
}
