import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

function campaignQuestIds(chapterNumber: number): string[] {
  const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
  return chapter.nodeIds
    .map((id) => CAMPAIGN_NODES[id]?.questId)
    .filter((id): id is string => Boolean(id));
}
function runQuest(hero: ReturnType<typeof testHero>, questId: string, multiplier = 1) {
  return grantHeroXp(hero, Math.round(getQuestXpForHero(hero, QUESTS[questId]!, 4) * multiplier));
}

describe("full campaign progression diagnostics", () => {
  it("finds a mainline XP lift that keeps one-side plus catch-up to two dungeons or fewer", () => {
    for (const multiplier of [1.10, 1.15, 1.20, 1.25, 1.30] as const) {
      let hero = { ...testHero(), level: 1, xp: 0 };
      const rows = [];
      for (let chapterNumber = 1; chapterNumber <= 9; chapterNumber += 1) {
        const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
        const startLevel = hero.level;
        for (const questId of campaignQuestIds(chapterNumber)) hero = runQuest(hero, questId, multiplier);

        let sideQuestsUsed = 0;
        if (chapter.sideQuestIds?.[0]) {
          hero = runQuest(hero, chapter.sideQuestIds[0], 1);
          sideQuestsUsed = 1;
        }

        let dungeonRunsUsed = 0;
        const nextMin = CAMPAIGN_CHAPTERS[chapterNumber + 1]?.recommendedLevelMin ?? null;
        while (nextMin !== null && hero.level < nextMin && dungeonRunsUsed < 2 && chapterNumber >= 2) {
          hero = grantHeroXp(hero, getDungeonCatchupXpTarget(hero.level));
          dungeonRunsUsed += 1;
        }

        rows.push({
          chapter: chapterNumber,
          startLevel,
          endLevel: hero.level,
          sideQuestsUsed,
          dungeonRunsUsed,
          nextMin,
          ready: nextMin === null || hero.level >= nextMin,
        });
      }
      console.log("XP_LIFT", multiplier);
      console.table(rows);
    }
  });
});
