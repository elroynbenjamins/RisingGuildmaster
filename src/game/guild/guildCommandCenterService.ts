import { REGIONS } from "../../data/world/regions";
import type { GameIconId } from "../../data/ui/gameIcons";
import { getCampaignLevelGuidance } from "../campaign/campaignReadinessService";
import { isChapterOneComplete } from "../dungeons/rogueliteRotationService";
import { REGIONAL_THREAT_MIN_HERO_LEVEL, REGIONAL_THREAT_REQUIRED_HERO_COUNT, areRegionalThreatsUnlocked } from "../world/regionalThreatService";
import { payrollDueOnDay, totalSalaryArrears } from "../economy/guildCalendarService";
import { getHeroLoyalty } from "../heroes/heroLoyaltyService";
import { getContractStatus } from "../recruitment/contractService";
import { regionalScoutDaysRemaining } from "../recruitment/regionalScoutingService";
import { trainingCapacity } from "../training/trainingService";
import type { GuildState } from "./types";

export type GuildCommandDestination =
  | "campaign"
  | "finances"
  | "gathering"
  | "guildmasterSkills"
  | "heroes"
  | "recruitment"
  | "sideQuests"
  | "temple"
  | "training"
  | "world";

export type GuildCommandTone = "urgent" | "warning" | "ready" | "opportunity";

export interface GuildCommandOrder {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  destination: GuildCommandDestination;
  iconId: GameIconId;
  tone: GuildCommandTone;
  badge: string;
  sortWeight: number;
}

const toneWeight: Record<GuildCommandTone, number> = {
  urgent: 400,
  warning: 300,
  ready: 200,
  opportunity: 100,
};

function order(input: Omit<GuildCommandOrder, "sortWeight">, weight = 0): GuildCommandOrder {
  return { ...input, sortWeight: toneWeight[input.tone] + weight };
}

/**
 * Builds a short list of decisions that deserve the Guildmaster's attention.
 * These are intentionally actionable rather than informational so the Guild
 * screen behaves like a command board instead of a dashboard full of numbers.
 */
export function getGuildCommandOrders(guild: GuildState): GuildCommandOrder[] {
  const orders: GuildCommandOrder[] = [];
  const living = guild.heroes.filter((hero) => hero.currentHP > 0);
  const available = living.filter((hero) => hero.isAvailable);
  const fallen = guild.heroes.filter((hero) => hero.currentHP <= 0);

  if (fallen.length) {
    orders.push(order({
      id: "fallen_heroes",
      title: fallen.length === 1 ? `${fallen[0]!.name} Has Fallen` : `${fallen.length} Heroes Have Fallen`,
      description: "Fallen heroes cannot adventure, train, or earn salary until they are revived at the Temple of Renewal.",
      actionLabel: "OPEN TEMPLE",
      destination: "temple",
      iconId: "temple",
      tone: "urgent",
      badge: "URGENT",
    }, 50));
  }

  const arrears = totalSalaryArrears(guild);
  if (arrears > 0) {
    orders.push(order({
      id: "salary_arrears",
      title: `${arrears} Gold in Salary Arrears`,
      description: "Unpaid wages damage hero loyalty. Settle arrears before contract negotiations become more expensive.",
      actionLabel: "OPEN FINANCES",
      destination: "finances",
      iconId: "gold",
      tone: "urgent",
      badge: "DEBT",
    }, 45));
  }

  const tomorrowPayroll = payrollDueOnDay(guild, guild.currentDay + 1);
  if (tomorrowPayroll > 0) {
    const shortfall = Math.max(0, tomorrowPayroll - guild.gold);
    orders.push(order({
      id: "payroll_tomorrow",
      title: shortfall > 0 ? `Payroll Shortfall · ${shortfall} Gold` : `Payroll Tomorrow · ${tomorrowPayroll} Gold`,
      description: shortfall > 0
        ? `The treasury holds ${guild.gold} gold. Earn or reserve another ${shortfall} before ending the day.`
        : `The treasury can cover the ${tomorrowPayroll} gold payroll, but spending before End Day could create arrears.`,
      actionLabel: "CHECK LEDGER",
      destination: "finances",
      iconId: "calendar",
      tone: shortfall > 0 ? "urgent" : "warning",
      badge: "TOMORROW",
    }, shortfall > 0 ? 40 : 25));
  }

  const contractRisks = guild.heroContracts
    .map((contract) => ({ contract, status: getContractStatus(contract, guild.currentDay) }))
    .filter((entry) => entry.status !== "active");
  if (contractRisks.length) {
    const expired = contractRisks.filter((entry) => entry.status === "expired").length;
    orders.push(order({
      id: "contracts_need_attention",
      title: expired ? `${expired} Contract${expired === 1 ? "" : "s"} Expired` : `${contractRisks.length} Contract${contractRisks.length === 1 ? "" : "s"} Expiring`,
      description: expired
        ? "Renew expired contracts before relying on those heroes for long-term guild plans. Loyalty affects renewal salary."
        : "Contract negotiations are approaching. Loyal heroes ask for better terms than unhappy ones.",
      actionLabel: "REVIEW CONTRACTS",
      destination: "finances",
      iconId: "management",
      tone: expired ? "urgent" : "warning",
      badge: expired ? "EXPIRED" : "EXPIRING",
    }, expired ? 35 : 15));
  }

  const lowLoyalty = guild.heroes
    .map((hero) => ({ hero, score: getHeroLoyalty(guild, hero.id).score }))
    .filter((entry) => entry.score < 45)
    .sort((a, b) => a.score - b.score);
  if (lowLoyalty.length && !arrears) {
    const lowest = lowLoyalty[0]!;
    orders.push(order({
      id: "low_loyalty",
      title: `${lowest.hero.name} Is Losing Faith`,
      description: `Loyalty is ${lowest.score}/100${lowLoyalty.length > 1 ? ` · ${lowLoyalty.length - 1} more hero${lowLoyalty.length === 2 ? "" : "es"} also unhappy` : ""}. Victories, personal duties, paid wages, and fair contracts can repair morale.`,
      actionLabel: "REVIEW ROSTER",
      destination: "heroes",
      iconId: "heroes",
      tone: lowest.score < 25 ? "urgent" : "warning",
      badge: lowest.score < 25 ? "RESENTFUL" : "UNHAPPY",
    }, lowest.score < 25 ? 30 : 10));
  }

  const readyGathering = guild.gatheringMissions.filter((mission) => mission.status === "active" && mission.completionDay <= guild.currentDay);
  if (readyGathering.length) {
    orders.push(order({
      id: "gathering_ready",
      title: `${readyGathering.length} Expedition${readyGathering.length === 1 ? "" : "s"} Ready to Claim`,
      description: "Your field teams have returned. Resolve their saved D20 results to collect materials, equipment, and XP.",
      actionLabel: "CLAIM EXPEDITIONS",
      destination: "gathering",
      iconId: "materials",
      tone: "ready",
      badge: "READY",
    }, 45));
  }

  const scout = guild.recruitment.regionalScoutMission;
  if (scout && regionalScoutDaysRemaining(guild) === 0) {
    orders.push(order({
      id: "scout_ready",
      title: `Scout Returned from ${scout.locationName}`,
      description: "A fresh regional candidate report is waiting. Collect it before making your next recruitment decision.",
      actionLabel: "OPEN RECRUITMENT",
      destination: "recruitment",
      iconId: "scouting",
      tone: "ready",
      badge: "REPORT READY",
    }, 40));
  }

  const expiringCandidates = guild.recruitment.candidates
    .map((candidate) => ({ candidate, days: candidate.expiresAtDay - guild.currentDay }))
    .filter((entry) => entry.days >= 0 && entry.days <= 1);
  if (expiringCandidates.length) {
    const today = expiringCandidates.filter((entry) => entry.days === 0).length;
    orders.push(order({
      id: "candidate_deadline",
      title: `${expiringCandidates.length} Candidate${expiringCandidates.length === 1 ? "" : "s"} Leaving ${today ? "Today" : "Tomorrow"}`,
      description: "Inspect or reserve promising recruits before the tavern board refresh removes them.",
      actionLabel: "CHECK CANDIDATES",
      destination: "recruitment",
      iconId: "recruitment",
      tone: today ? "urgent" : "warning",
      badge: today ? "LAST CHANCE" : "1 DAY",
    }, today ? 25 : 5));
  }

  if (isChapterOneComplete(guild) && guild.heroes.length < REGIONAL_THREAT_REQUIRED_HERO_COUNT) {
    const missing = REGIONAL_THREAT_REQUIRED_HERO_COUNT - guild.heroes.length;
    orders.push(order({
      id: "strategic_roster_expansion",
      title: `Expand the Guild to ${REGIONAL_THREAT_REQUIRED_HERO_COUNT} Heroes`,
      description: `Recruit ${missing} more hero${missing === 1 ? "" : "es"} to staff Crisis Operations and Roguelite Expeditions. Regional Threats begin only after six heroes reach Level ${REGIONAL_THREAT_MIN_HERO_LEVEL}.`,
      actionLabel: "OPEN RECRUITMENT",
      destination: "recruitment",
      iconId: "recruitment",
      tone: "opportunity",
      badge: `${guild.heroes.length}/${REGIONAL_THREAT_REQUIRED_HERO_COUNT} HEROES`,
    }, 25));
  } else if (isChapterOneComplete(guild) && !areRegionalThreatsUnlocked(guild.world)) {
    const readyCount = guild.heroes.filter((hero) => hero.level >= REGIONAL_THREAT_MIN_HERO_LEVEL).length;
    if (readyCount < REGIONAL_THREAT_REQUIRED_HERO_COUNT) {
      orders.push(order({
        id: "strategic_roster_training",
        title: "Prepare the Six-Hero Strategic Roster",
        description: `${readyCount}/${REGIONAL_THREAT_REQUIRED_HERO_COUNT} heroes are Level ${REGIONAL_THREAT_MIN_HERO_LEVEL}+. Training or field work will finish the roster; Regional Threats remain dormant until then.`,
        actionLabel: "OPEN TRAINING",
        destination: "training",
        iconId: "training",
        tone: "opportunity",
        badge: `${readyCount}/${REGIONAL_THREAT_REQUIRED_HERO_COUNT} AT LV ${REGIONAL_THREAT_MIN_HERO_LEVEL}`,
      }, 15));
    }
  }

  const levelGuidance = getCampaignLevelGuidance(guild);
  if (levelGuidance) {
    const hasSideQuests = levelGuidance.sideQuestIds.length > 0;
    orders.push(order({
      id: "campaign_level_gap",
      title: `Field Team Below Campaign Level`,
      description: `Your four strongest heroes average Level ${levelGuidance.averageLevel.toFixed(1)}; ${levelGuidance.nextQuestName} recommends Level ${levelGuidance.targetLevel}. ${hasSideQuests ? "Use one-time Side Quests to catch up without repetitive grinding." : "Use training and available field work to close the gap."}`,
      actionLabel: hasSideQuests ? "BROWSE SIDE QUESTS" : "OPEN TRAINING",
      destination: hasSideQuests ? "sideQuests" : "training",
      iconId: hasSideQuests ? "quests" : "training",
      tone: "warning",
      badge: `LV ${levelGuidance.averageLevel.toFixed(1)} / ${levelGuidance.targetLevel}`,
    }, 20));
  }

  const highestThreat = Object.entries(guild.world.regionThreat ?? {})
    .sort((a, b) => b[1] - a[1])[0];
  if (highestThreat && highestThreat[1] >= 2) {
    const regionName = REGIONS[highestThreat[0]]?.name ?? highestThreat[0].replace(/_/g, " ");
    orders.push(order({
      id: "regional_threat",
      title: `${regionName} Threat · ${highestThreat[1]}`,
      description: highestThreat[1] >= 3
        ? "The region is in danger of escalating further. Inspect the world and answer regional problems before the situation worsens."
        : "Trouble is building in the region. You still have time to prepare before it becomes a crisis.",
      actionLabel: "OPEN WORLD",
      destination: "world",
      iconId: "world",
      tone: highestThreat[1] >= 3 ? "urgent" : "warning",
      badge: highestThreat[1] >= 3 ? "CRISIS" : "RISING",
    }, highestThreat[1] >= 3 ? 20 : 0));
  }

  if (guild.guildmaster.skillPoints > 0) {
    orders.push(order({
      id: "guildmaster_skill",
      title: `${guild.guildmaster.skillPoints} Guildmaster Skill Point${guild.guildmaster.skillPoints === 1 ? "" : "s"} Available`,
      description: "Spend leadership points to improve recruitment, logistics, training, or guild economy systems.",
      actionLabel: "SPEND POINTS",
      destination: "guildmasterSkills",
      iconId: "guild",
      tone: "ready",
      badge: "LEVEL UP",
    }, 20));
  }

  const capacity = trainingCapacity(guild);
  const freeTrainingSlots = Math.max(0, capacity - guild.trainingGround.sessions.length);
  if (freeTrainingSlots > 0 && available.length > 0 && !levelGuidance) {
    orders.push(order({
      id: "training_slot",
      title: `${freeTrainingSlots} Training Slot${freeTrainingSlots === 1 ? "" : "s"} Open`,
      description: "A ready hero can use downtime to gain XP and develop toward the current campaign progression cap.",
      actionLabel: "ASSIGN TRAINING",
      destination: "training",
      iconId: "training",
      tone: "opportunity",
      badge: `${guild.trainingGround.sessions.length}/${capacity} BUSY`,
    }));
  }

  return orders
    .sort((a, b) => b.sortWeight - a.sortWeight || a.title.localeCompare(b.title));
}
