import type { GuildState } from "../guild/types";

export const DAY_MILESTONE_AD_INTERVAL = 50;

export function pendingDayMilestone(guild: GuildState): number | null {
  if (guild.currentDay < DAY_MILESTONE_AD_INTERVAL) return null;
  const milestone = Math.floor(guild.currentDay / DAY_MILESTONE_AD_INTERVAL) * DAY_MILESTONE_AD_INTERVAL;
  return guild.viewedAdMilestoneDays.includes(milestone) ? null : milestone;
}

export function recordDayMilestoneAd(guild: GuildState, milestone: number): GuildState {
  if (milestone <= 0 || milestone % DAY_MILESTONE_AD_INTERVAL !== 0) throw new Error("Invalid day milestone");
  if (guild.viewedAdMilestoneDays.includes(milestone)) return guild;
  return { ...guild, viewedAdMilestoneDays: [...guild.viewedAdMilestoneDays, milestone] };
}
