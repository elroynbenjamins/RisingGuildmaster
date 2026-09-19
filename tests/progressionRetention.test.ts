import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getAchievementProgress, claimAchievement, getClaimableAchievements } from "../src/game/achievements/achievementService";
import { ACHIEVEMENTS } from "../src/data/achievements/achievements";
import { acknowledgeUnlockNotices, getNewUnlockNotices } from "../src/game/progression/unlockSummaryService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { CURRENT_SAVE_VERSION } from "../src/game/save/saveVersion";
import { testHero } from "./testHero";

describe("progression and retention systems", () => {
  it("migrates v2 saves into the v3 progression schema", () => {
    const payload = JSON.parse(serializeGuild(createGuild()));
    payload.saveVersion = 2;
    delete payload.achievementClaims;
    delete payload.seenUnlockSummaryIds;
    delete payload.metrics;
    const migrated = deserializeGuild(JSON.stringify(payload));
    expect(migrated.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(migrated.achievementClaims).toEqual([]);
    expect(migrated.metrics).toEqual({ craftedItemsCount: 0 });
    expect(migrated.seenUnlockSummaryIds).toContain("region:greenveil");
  });

  it("claims completed achievements once and grants small gem rewards", () => {
    const guild = createGuild();
    guild.heroes = [{ ...testHero(), id: "a" }, { ...testHero(), id: "b" }];
    const achievement = ACHIEVEMENTS.find((entry) => entry.id === "first_banner")!;
    expect(getAchievementProgress(guild, achievement).complete).toBe(true);
    const claimed = claimAchievement(guild, achievement.id);
    expect(claimed.gems).toBe(guild.gems + achievement.rewardGems);
    expect(claimed.achievementClaims).toContain(achievement.id);
    expect(claimed.gemTransactions.at(-1)).toMatchObject({ type: "achievement", amount: achievement.rewardGems });
    expect(() => claimAchievement(claimed, achievement.id)).toThrow(/already claimed/);
  });

  it("tracks crafted-item achievements from the durable guild metric", () => {
    const guild = createGuild();
    guild.metrics.craftedItemsCount = 5;
    const ready = getClaimableAchievements(guild).map((entry) => entry.definition.id);
    expect(ready).toContain("craft_5");
  });

  it("emits new unlocks once and acknowledges them", () => {
    const guild = createGuild();
    expect(getNewUnlockNotices(guild)).toHaveLength(0);
    guild.world.unlockedRegionIds.push("iron_hills");
    const notices = getNewUnlockNotices(guild);
    expect(notices.some((notice) => notice.id === "region:iron_hills")).toBe(true);
    const acknowledged = acknowledgeUnlockNotices(guild, notices.map((notice) => notice.id));
    expect(getNewUnlockNotices(acknowledged).some((notice) => notice.id === "region:iron_hills")).toBe(false);
  });
});
