import { QUESTS } from "../data/quests/quests";
import { getAvailableCampaignNodes } from "../game/campaign/campaignService";
import { hasInjury } from "../game/conditions/conditionService";
import { payrollDueOnDay, totalSalaryArrears } from "../game/economy/guildCalendarService";
import type { GuildState } from "../game/guild/types";
import { isQuestBoardCategoryUnlocked } from "../game/quests/questAvailability";

export interface GuildNotification {
  id: string;
  text: string;
  tone: "info" | "warning";
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

  return [
    contractsUnlocked
      ? {
          id: "contracts",
          text: `${contracts} contract${contracts === 1 ? "" : "s"} available in this region`,
          tone: "info",
        }
      : {
          id: "contracts_locked",
          text: `Repeatable contracts unlock when a hero reaches Level 2 (${highestHeroLevel}/2)`,
          tone: "info",
        },
    ...(campaign
      ? [{ id: "campaign", text: `${campaign} campaign objective${campaign === 1 ? "" : "s"} ready`, tone: "info" as const }]
      : []),
    ...(tomorrowPayroll
      ? [{ id: "payroll", text: `${tomorrowPayroll} gold payroll is due tomorrow`, tone: tomorrowPayroll > guild.gold ? "warning" as const : "info" as const }]
      : []),
    ...(arrears ? [{ id: "arrears", text: `${arrears} gold in unpaid salary arrears`, tone: "warning" as const }] : []),
    ...(fallen
      ? [{ id: "fallen", text: `${fallen} fallen hero${fallen === 1 ? " awaits" : "es await"} revival at the Temple`, tone: "warning" as const }]
      : []),
    ...(injured
      ? [{ id: "injured", text: `${injured} hero${injured === 1 ? " is" : "es are"} injured`, tone: "warning" as const }]
      : []),
  ];
}
