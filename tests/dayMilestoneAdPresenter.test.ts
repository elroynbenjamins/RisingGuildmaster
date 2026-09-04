import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import type { GuildState } from "../src/game/guild/types";
import { presentPendingDayMilestoneAd } from "../src/game/monetization/dayMilestoneAdPresenter";

const showMilestoneAd = vi.fn();
vi.mock("../src/game/monetization/admobRewardedAdProvider", () => ({
  showDayMilestoneRewardedInterstitial: () => showMilestoneAd(),
}));

describe("day milestone ad presentation", () => {
  beforeEach(() => showMilestoneAd.mockReset());

  it("requires the milestone message and records it only after the reward is earned", async () => {
    const guild = { ...createGuild(), currentDay: 20 };
    const updates: GuildState[] = [];
    const dialogs: Array<{ actions?: Array<{ label: string; onPress?(): void }> }> = [];
    showMilestoneAd.mockResolvedValue({ transactionId: "milestone-20", source: "rewarded_ad", gems: 5, verified: true });

    expect(presentPendingDayMilestoneAd(guild, (next) => updates.push(next), (dialog) => dialogs.push(dialog))).toBe(true);
    expect(updates).toHaveLength(0);
    expect(dialogs[0]!.actions?.map((action) => action.label)).toEqual(["Watch · +5 Gems"]);

    dialogs[0]!.actions?.[0]!.onPress?.();
    await vi.waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0]!.viewedAdMilestoneDays).toContain(20);
    expect(updates[0]!.gems).toBe(guild.gems + 5);
  });

});
