import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHAPTERS } from "../src/data/campaign/chapter1";
import { RAIDS } from "../src/data/raids/raids";
import { createDungeonDraft } from "../src/game/dungeons/dungeonDraftService";
import { createGuild } from "../src/game/guild/guildService";
import { getGuildCommandOrders } from "../src/game/guild/guildCommandCenterService";
import { getEligibleOperationHeroIds, isGuildOperationsUnlocked } from "../src/game/operations/guildOperationService";
import { getCurrentUnlockNotices } from "../src/game/progression/unlockSummaryService";
import { isRaidUnlocked } from "../src/game/raids/raidService";
import { canUnlockRegionalThreats } from "../src/game/world/regionalThreatService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";

const roster = (count: number, level: number) => Array.from({ length: count }, (_, index) => ({
  ...testHero(),
  id: `journey-${index}`,
  name: `Journey Hero ${index + 1}`,
  level,
}));

function chapterOneGuild(heroCount: number, level = 2) {
  const guild = createGuild();
  guild.heroes = roster(heroCount, level);
  guild.world = {
    ...guild.world,
    campaignChapter: 2,
    completedCampaignNodeIds: [...CAMPAIGN_CHAPTERS[1]!.nodeIds],
  };
  return guild;
}

describe("end-to-end roster progression handoffs", () => {
  it("keeps post-Chapter-1 strategic modes informative but not falsely announced with four heroes", () => {
    const guild = chapterOneGuild(4);

    expect(isGuildOperationsUnlocked(guild)).toBe(true);
    expect(getEligibleOperationHeroIds(guild)).toHaveLength(4);
    expect(canUnlockRegionalThreats(guild.heroes)).toBe(false);
    expect(() => createDungeonDraft(guild, createSeededRandom(11))).toThrow(/6 owned heroes/);

    const noticeIds = getCurrentUnlockNotices(guild).map((notice) => notice.id);
    expect(noticeIds).not.toContain("system:operations");
    expect(noticeIds).not.toContain("system:roguelite");
    expect(getGuildCommandOrders(guild).map((order) => order.id)).toContain("strategic_roster_expansion");
  });

  it("guides six owned but under-levelled heroes toward the strategic threshold", () => {
    const guild = chapterOneGuild(6, 1);
    expect(getGuildCommandOrders(guild).map((order) => order.id)).toContain("strategic_roster_training");
    expect(canUnlockRegionalThreats(guild.heroes)).toBe(false);
  });

  it("brings Operations, Roguelite Expeditions, and Regional Threat readiness together at six Level-2 heroes", () => {
    const guild = chapterOneGuild(6);

    expect(getEligibleOperationHeroIds(guild)).toHaveLength(6);
    expect(canUnlockRegionalThreats(guild.heroes)).toBe(true);

    const draft = createDungeonDraft(guild, createSeededRandom(12));
    expect(draft.eligibleHeroIds).toHaveLength(6);
    expect(draft.offeredHeroIds).toHaveLength(3);

    const noticeIds = getCurrentUnlockNotices(guild).map((notice) => notice.id);
    expect(noticeIds).toContain("system:operations");
    expect(noticeIds).toContain("system:roguelite");
  });

  it("does not unlock the first Raid until both its campaign chapter and eight-hero roster are ready", () => {
    const raid = RAIDS.broodheart_awakening!;
    const sevenHeroGuild = chapterOneGuild(7, 10);
    sevenHeroGuild.world.campaignChapter = raid.unlockChapter;
    expect(isRaidUnlocked(raid, sevenHeroGuild.world.campaignChapter, sevenHeroGuild.heroes.length)).toBe(false);

    const eightHeroGuild = chapterOneGuild(8, 10);
    eightHeroGuild.world.campaignChapter = raid.unlockChapter;
    expect(isRaidUnlocked(raid, eightHeroGuild.world.campaignChapter, eightHeroGuild.heroes.length)).toBe(true);
    expect(getCurrentUnlockNotices(eightHeroGuild).map((notice) => notice.id)).toContain(`raid:${raid.id}`);
  });
});
