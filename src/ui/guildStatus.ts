import { QUESTS } from "../data/quests/quests";
import { getAvailableCampaignNodes } from "../game/campaign/campaignService";
import { hasInjury } from "../game/conditions/conditionService";
import { payrollDueOnDay, totalSalaryArrears } from "../game/economy/guildCalendarService";
import type { GuildState } from "../game/guild/types";
import { isQuestBoardCategoryUnlocked } from "../game/quests/questAvailability";
import { countHeroesNeedingAttention } from "./heroAttention";

export type GuildNotificationDestination = "heroes" | "temple" | "finances" | "quests" | "campaign" | "world";
export interface GuildNotification {
  id: string;
  text: string;
  tone: "info" | "warning";
  destination?: GuildNotificationDestination;
  actionLabel?: string;
}

export function getGuildNotifications(guild: GuildState): GuildNotification[] {
  const fallen = guild.heroes.filter((hero) => hero.currentHP <= 0).length;
  const injured = guild.heroes.filter((hero) => hero.currentHP > 0 && hasInjury(hero.conditions)).length;
  const contracts = Object.values(QUESTS).filter(
    (quest) => quest.questType === "contract" && quest.regionId === guild.world.currentRegionId,
  ).length;
  const campaign = getAvailableCampaignNodes(guild.world).length;
  const arrears = totalSalaryArrears(guild);
  const tomorrowPayroll = payrollDueOnDay(guild, guild.currentDay + 1);
  const highestHeroLevel = Math.max(1, ...guild.heroes.map((hero) => hero.level));
  const contractsUnlocked = isQuestBoardCategoryUnlocked("contract", guild.world, highestHeroLevel);
  const attention = countHeroesNeedingAttention(guild);
  const threat = Object.entries(guild.world.regionThreat ?? {}).sort((a,b)=>b[1]-a[1])[0];
  const lowRations = guild.rations <= 8;

  return [
    contractsUnlocked
      ? {
          id: "contracts",
          text: `${contracts} contract${contracts === 1 ? "" : "s"} available in this region`,
          tone: "info",
          destination: "quests",
          actionLabel: "Open Quests",
        }
      : {
          id: "contracts_locked",
          text: `Repeatable contracts unlock when a hero reaches Level 2 (${highestHeroLevel}/2)`,
          tone: "info",
          destination: "heroes",
          actionLabel: "View Heroes",
        },
    ...(campaign
      ? [{ id: "campaign", text: `${campaign} campaign objective${campaign === 1 ? "" : "s"} ready`, tone: "info" as const, destination: "campaign" as const, actionLabel: "Continue" }]
      : []),
    ...(tomorrowPayroll
      ? [{ id: "payroll", text: `${tomorrowPayroll} gold payroll is due tomorrow`, tone: tomorrowPayroll > guild.gold ? "warning" as const : "info" as const, destination: "finances" as const, actionLabel: "Finances" }]
      : []),
    ...(arrears ? [{ id: "arrears", text: `${arrears} gold in unpaid salary arrears`, tone: "warning" as const, destination: "finances" as const, actionLabel: "Pay Arrears" }] : []),
    ...(fallen
      ? [{ id: "fallen", text: `${fallen} fallen hero${fallen === 1 ? " awaits" : "es await"} revival at the Temple`, tone: "warning" as const, destination: "temple" as const, actionLabel: "Temple" }]
      : []),
    ...(injured
      ? [{ id: "injured", text: `${injured} hero${injured === 1 ? " is" : "es are"} injured`, tone: "warning" as const, destination: "temple" as const, actionLabel: "Treat" }]
      : []),
    ...(attention
      ? [{ id: "hero_attention", text: `${attention} hero${attention === 1 ? " needs" : "es need"} attention`, tone: "info" as const, destination: "heroes" as const, actionLabel: "Review" }]
      : []),
    ...(threat && threat[1] > 0
      ? [{ id: "regional_threat", text: `${threat[0].replace(/_/g, " ")} is at Threat ${threat[1]}/4`, tone: threat[1] >= 3 ? "warning" as const : "info" as const, destination: "world" as const, actionLabel: "World Map" }]
      : []),
    ...(lowRations
      ? [{ id: "low_rations", text: `Only ${guild.rations} rations remain`, tone: "warning" as const, destination: "world" as const, actionLabel: "Resupply" }]
      : []),
  ];
}
