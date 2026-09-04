import type { GuildState } from "../guild/types";

export const DAY_MILESTONE_AD_INTERVAL = 20;

export function pendingDayMilestone(guild: GuildState): number | null {
  if (guild.entitlements.adsRemoved) return null;
  if (guild.currentDay < DAY_MILESTONE_AD_INTERVAL) return null;
  const milestone = Math.floor(guild.currentDay / DAY_MILESTONE_AD_INTERVAL) * DAY_MILESTONE_AD_INTERVAL;
  return guild.viewedAdMilestoneDays.some((day) => day >= milestone) ? null : milestone;
}

export function recordDayMilestoneAd(guild: GuildState, milestone: number): GuildState {
  if (!Number.isInteger(milestone) || milestone <= 0 || milestone > guild.currentDay || milestone % DAY_MILESTONE_AD_INTERVAL !== 0) throw new Error("Invalid day milestone");
  if (guild.viewedAdMilestoneDays.includes(milestone)) return guild;
  return { ...guild, viewedAdMilestoneDays: [...guild.viewedAdMilestoneDays, milestone] };
}
