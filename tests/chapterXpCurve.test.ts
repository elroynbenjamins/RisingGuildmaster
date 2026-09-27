import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { getDungeonCatchupXpTarget, getRogueliteXpForHero } from "../src/game/dungeons/dungeonRunService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestEnemyXpPool, getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

describe("campaign and roguelite XP curve", () => {
  it("keeps a standard four-hero core aligned through every released chapter", () => {
    let hero = { ...testHero(), level: 1, xp: 0 };
    const endLevels: number[] = [];
    for (const chapter of Object.values(CAMPAIGN_CHAPTERS)) {
      const campaignQuestIds = chapter.nodeIds.map((id) => CAMPAIGN_NODES[id]?.questId).filter((id): id is string => Boolean(id));
      for (const questId of [...campaignQuestIds, ...(chapter.sideQuestIds ?? [])]) hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
      endLevels.push(hero.level);
    }
    expect(endLevels).toEqual([4, 5, 7, 9, 10, 12, 15, 17, 19]);
  });

  it("applies the pacing lift only to campaign-node quests", () => {
    const hero = { ...testHero(), level: 1, xp: 0 };
    const mainline = QUESTS.road_of_broken_carts!;
    const sideQuest = QUESTS.blackbridge_ledger!;
    const raid = QUESTS.raid_chartmaker_ascendant!;
    const baseXp = (quest: typeof mainline) => Math.floor(getQuestEnemyXpPool(quest) / 4) + quest.xpRewardPerHero;

    expect(getQuestXpForHero(hero, mainline, 4)).toBe(Math.round(baseXp(mainline) * 1.25 * 1.10));
    expect(getQuestXpForHero(hero, sideQuest, 4)).toBe(Math.round(baseXp(sideQuest) * 1.25));
    expect(getQuestXpForHero(hero, raid, 4)).toBe(Math.round(baseXp(raid) * 1.25));
  });

  it("keeps a normal one-side-per-chapter core ready with at most two catch-up expeditions", () => {
    let hero = { ...testHero(), level: 1, xp: 0 };
    const dungeonRunsByChapter: number[] = [];

    for (let chapterNumber = 1; chapterNumber <= 8; chapterNumber += 1) {
      const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
      const campaignQuestIds = chapter.nodeIds.map((id) => CAMPAIGN_NODES[id]?.questId).filter((id): id is string => Boolean(id));
      for (const questId of campaignQuestIds) hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));

      const representativeSideQuestId = chapter.sideQuestIds?.[0];
      if (representativeSideQuestId) hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[representativeSideQuestId]!, 4));

      const nextMinimum = CAMPAIGN_CHAPTERS[chapterNumber + 1]!.recommendedLevelMin;
      let dungeonRuns = 0;
      while (chapterNumber >= 2 && hero.level < nextMinimum && dungeonRuns < 2) {
        hero = grantHeroXp(hero, getDungeonCatchupXpTarget(hero.level));
        dungeonRuns += 1;
      }

      dungeonRunsByChapter.push(dungeonRuns);
      expect(hero.level, `Chapter ${chapterNumber} transition level`).toBeGreaterThanOrEqual(nextMinimum);
    }

    expect(Math.max(...dungeonRunsByChapter)).toBeLessThanOrEqual(2);
    expect(dungeonRunsByChapter.reduce((sum, count) => sum + count, 0)).toBeGreaterThanOrEqual(2);
    expect(dungeonRunsByChapter.reduce((sum, count) => sum + count, 0)).toBeLessThanOrEqual(4);
  });

  it("takes a fresh Level-5 core to Level 6 before the Chapter-3 finale without side-quest grind", () => {
    let hero = { ...testHero(), level: 5, xp: 0 };
    for (const questId of ["road_of_frozen_names", "night_of_blue_horns", "hroth_iceblood_boss", "beneath_glimmerlake"] as const) {
      hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
    }
    expect(hero.level).toBeGreaterThanOrEqual(6);
  });

  it("keeps full roguelite catch-up XP because expedition enemies scale to the drafted party", () => {
    for (const heroLevel of [8, 9, 10, 11, 12, 20]) expect(getRogueliteXpForHero(100, heroLevel, 8)).toBe(100);
  });
});
