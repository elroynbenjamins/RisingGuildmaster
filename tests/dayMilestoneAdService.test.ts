import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { pendingDayMilestone, recordDayMilestoneAd } from "../src/game/monetization/dayMilestoneAdService";

describe("20-day rewarded-ad milestones", () => {
  it("triggers at each reached 20-day milestone", () => {
    expect(pendingDayMilestone({ ...createGuild(), currentDay: 19 })).toBeNull();
    expect(pendingDayMilestone({ ...createGuild(), currentDay: 20 })).toBe(20);
    expect(pendingDayMilestone({ ...createGuild(), currentDay: 40 })).toBe(40);
  });

  it("records each milestone once without affecting game resources", () => {
    const guild = { ...createGuild(), currentDay: 20 };
    const recorded = recordDayMilestoneAd(guild, 20);
    expect(pendingDayMilestone(recorded)).toBeNull();
    expect(recorded.gems).toBe(guild.gems);
    expect(recordDayMilestoneAd(recorded, 20)).toBe(recorded);
  });
});
it("suppresses ads for owners, preserves legacy history, and rejects invalid milestones", () => {
  const guild = createGuild();
  expect(pendingDayMilestone({ ...guild, currentDay: 200, entitlements: { ...guild.entitlements, adsRemoved: true } })).toBeNull();
  expect(pendingDayMilestone({ ...guild, currentDay: 51, viewedAdMilestoneDays: [50] })).toBeNull();
  expect(pendingDayMilestone({ ...guild, currentDay: 60, viewedAdMilestoneDays: [50] })).toBe(60);
  expect(pendingDayMilestone({ ...guild, currentDay: 39, viewedAdMilestoneDays: [20] })).toBeNull();
  for (const day of [0, -20, 21, 40, NaN]) expect(() => recordDayMilestoneAd({ ...guild, currentDay: 20 }, day)).toThrow();
});
