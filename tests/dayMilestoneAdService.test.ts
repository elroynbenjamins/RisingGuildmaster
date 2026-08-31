import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { pendingDayMilestone, recordDayMilestoneAd } from "../src/game/monetization/dayMilestoneAdService";

describe("50-day rewarded-ad milestones", () => {
  it("triggers at each reached 50-day milestone", () => {
    expect(pendingDayMilestone({ ...createGuild(), currentDay: 49 })).toBeNull();
    expect(pendingDayMilestone({ ...createGuild(), currentDay: 50 })).toBe(50);
    expect(pendingDayMilestone({ ...createGuild(), currentDay: 100 })).toBe(100);
  });

  it("records each milestone once without affecting game resources", () => {
    const guild = { ...createGuild(), currentDay: 50 };
    const recorded = recordDayMilestoneAd(guild, 50);
    expect(pendingDayMilestone(recorded)).toBeNull();
    expect(recorded.gems).toBe(guild.gems);
    expect(recordDayMilestoneAd(recorded, 50)).toBe(recorded);
  });
});
