import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

type ProgressRow = {
  chapter: number;
  startLevel: number;
  endLevel: number;
  sideQuestsUsed: number;
  dungeonRunsUsed: number;
  nextMin: number | null;
};

function campaignQuestIds(chapterNumber: number): string[] {
  const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
  return chapter.nodeIds
    .map((id) => CAMPAIGN_NODES[id]?.questId)
    .filter((id): id is string => Boolean(id));
}

function runQuest(hero: ReturnType<typeof testHero>, questId: string) {
  return grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
}

describe("full campaign progression diagnostics", () => {
  it("compares mandatory, optional, and adaptive catch-up paths", () => {
    for (const mode of ["mainline", "one-side", "all-sides"] as const) {
      let hero = { ...testHero(), level: 1, xp: 0 };
      const rows: ProgressRow[] = [];
      for (let chapterNumber = 1; chapterNumber <= 9; chapterNumber += 1) {
        const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
        const startLevel = hero.level;
        for (const questId of campaignQuestIds(chapterNumber)) hero = runQuest(hero, questId);
        const sideIds = chapter.sideQuestIds ?? [];
        const chosen = mode === "all-sides" ? sideIds : mode === "one-side" ? sideIds.slice(0, 1) : [];
        for (const questId of chosen) hero = runQuest(hero, questId);
        rows.push({
          chapter: chapterNumber,
          startLevel,
          endLevel: hero.level,
          sideQuestsUsed: chosen.length,
          dungeonRunsUsed: 0,
          nextMin: CAMPAIGN_CHAPTERS[chapterNumber + 1]?.recommendedLevelMin ?? null,
        });
      }
      console.log("XP_PATH", mode);
      console.table(rows);
    }

    let hero = { ...testHero(), level: 1, xp: 0 };
    const adaptive: ProgressRow[] = [];
    for (let chapterNumber = 1; chapterNumber <= 9; chapterNumber += 1) {
      const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
      const startLevel = hero.level;
      for (const questId of campaignQuestIds(chapterNumber)) hero = runQuest(hero, questId);

      let sideQuestsUsed = 0;
      let dungeonRunsUsed = 0;
      const nextMin = CAMPAIGN_CHAPTERS[chapterNumber + 1]?.recommendedLevelMin ?? null;
      if (nextMin !== null && hero.level < nextMin) {
        for (const questId of chapter.sideQuestIds ?? []) {
          hero = runQuest(hero, questId);
          sideQuestsUsed += 1;
          if (hero.level >= nextMin) break;
        }
      }
      while (nextMin !== null && hero.level < nextMin && dungeonRunsUsed < 2 && chapterNumber >= 2) {
        hero = grantHeroXp(hero, getDungeonCatchupXpTarget(hero.level));
        dungeonRunsUsed += 1;
      }

      adaptive.push({ chapter: chapterNumber, startLevel, endLevel: hero.level, sideQuestsUsed, dungeonRunsUsed, nextMin });
    }
    console.log("XP_PATH adaptive");
    console.table(adaptive);
  });
});
