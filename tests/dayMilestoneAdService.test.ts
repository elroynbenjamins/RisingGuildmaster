import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { pendingDayMilestone, recordDayMilestoneAd } from "../src/game/monetization/dayMilestoneAdService";

describe("15-day rewarded-ad milestones", () => {
  it("triggers at each reached 15-day milestone", () => {
    expect(pendingDayMilestone({ ...createGuild(), currentDay: 14 })).toBeNull();
    expect(pendingDayMilestone({ ...createGuild(), currentDay: 15 })).toBe(15);
    expect(pendingDayMilestone({ ...createGuild(), currentDay: 30 })).toBe(30);
  });

  it("records each milestone once without affecting game resources", () => {
    const guild = { ...createGuild(), currentDay: 15 };
    const recorded = recordDayMilestoneAd(guild, 15);
    expect(pendingDayMilestone(recorded)).toBeNull();
    expect(recorded.gems).toBe(guild.gems);
    expect(recordDayMilestoneAd(recorded, 15)).toBe(recorded);
  });
});
it("suppresses ads for owners, preserves legacy history, and rejects invalid milestones", () => {
  const guild = createGuild();
  expect(pendingDayMilestone({ ...guild, currentDay: 150, entitlements: { ...guild.entitlements, adsRemoved: true } })).toBeNull();
  expect(pendingDayMilestone({ ...guild, currentDay: 46, viewedAdMilestoneDays: [45] })).toBeNull();
  expect(pendingDayMilestone({ ...guild, currentDay: 60, viewedAdMilestoneDays: [45] })).toBe(60);
  expect(pendingDayMilestone({ ...guild, currentDay: 29, viewedAdMilestoneDays: [15] })).toBeNull();
  for (const day of [0, -15, 16, 30, NaN]) expect(() => recordDayMilestoneAd({ ...guild, currentDay: 15 }, day)).toThrow();
});
