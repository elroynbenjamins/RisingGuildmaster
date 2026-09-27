import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

function campaignQuestIds(chapterNumber: number): string[] {
  const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
  return chapter.nodeIds
    .map((id) => CAMPAIGN_NODES[id]?.questId)
    .filter((id): id is string => Boolean(id));
}
function runQuest(hero: ReturnType<typeof testHero>, questId: string) {
  return grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
}
function xpToReach(level: number, xp: number, targetLevel: number): number {
  let needed = 0;
  let currentLevel = level;
  let currentXp = xp;
  while (currentLevel < targetLevel) {
    needed += Math.max(0, xpRequiredForNextLevel(currentLevel) - currentXp);
    currentLevel += 1;
    currentXp = 0;
  }
  return needed;
}

describe("full campaign progression diagnostics", () => {
  it("measures exact transition deficits after mainline and one side quest", () => {
    for (const mode of ["mainline", "one-side"] as const) {
      let hero = { ...testHero(), level: 1, xp: 0 };
      const rows = [];
      for (let chapterNumber = 1; chapterNumber <= 9; chapterNumber += 1) {
        const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
        for (const questId of campaignQuestIds(chapterNumber)) hero = runQuest(hero, questId);
        if (mode === "one-side" && chapter.sideQuestIds?.[0]) hero = runQuest(hero, chapter.sideQuestIds[0]);
        const nextMin = CAMPAIGN_CHAPTERS[chapterNumber + 1]?.recommendedLevelMin ?? null;
        const deficitXp = nextMin === null ? 0 : xpToReach(hero.level, hero.xp, nextMin);
        const dungeonXp = getDungeonCatchupXpTarget(hero.level);
        rows.push({
          chapter: chapterNumber,
          level: hero.level,
          xpIntoLevel: hero.xp,
          nextMin,
          deficitXp,
          dungeonXp,
          equivalentDungeonRuns: dungeonXp > 0 ? Math.ceil(deficitXp / dungeonXp) : 0,
        });
      }
      console.log("XP_DEFICIT", mode);
      console.table(rows);
    }
  });
});
