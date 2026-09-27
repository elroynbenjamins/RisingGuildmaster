import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

describe("campaign transition XP diagnostic", () => {
  it("measures main-story progression with only the side quests needed for the next chapter", () => {
    let hero = { ...testHero(), level: 1, xp: 0 };
    const rows: Array<{
      chapter: number;
      coreEndLevel: number;
      nextTarget: number | null;
      catchupSideQuests: number;
      sideQuestIds: string;
      readyLevel: number;
    }> = [];

    for (let chapterNumber = 1; chapterNumber <= 9; chapterNumber += 1) {
      const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
      const campaignQuestIds = chapter.nodeIds
        .map((id) => CAMPAIGN_NODES[id]?.questId)
        .filter((id): id is string => Boolean(id));
      for (const questId of campaignQuestIds) {
        hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
      }

      const coreEndLevel = hero.level;
      const nextTarget = CAMPAIGN_CHAPTERS[chapterNumber + 1]?.recommendedLevelMin ?? null;
      const used: string[] = [];
      if (nextTarget !== null) {
        for (const sideQuestId of chapter.sideQuestIds ?? []) {
          if (hero.level >= nextTarget || used.length >= 2) break;
          hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[sideQuestId]!, 4));
          used.push(sideQuestId);
        }
      }

      rows.push({
        chapter: chapterNumber,
        coreEndLevel,
        nextTarget,
        catchupSideQuests: used.length,
        sideQuestIds: used.join(", "),
        readyLevel: hero.level,
      });
    }

    console.table(rows);
    for (const row of rows.filter((entry) => entry.nextTarget !== null)) {
      expect(row.catchupSideQuests, `Chapter ${row.chapter} catch-up load`).toBeLessThanOrEqual(2);
      expect(row.readyLevel, `Chapter ${row.chapter} readiness for next chapter`).toBeGreaterThanOrEqual(row.nextTarget!);
    }
  });
});
