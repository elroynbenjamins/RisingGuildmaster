import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

type HeroState = ReturnType<typeof testHero>;

function campaignQuestIds(chapterNumber: number): string[] {
  const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
  return chapter.nodeIds.map((id) => CAMPAIGN_NODES[id]?.questId).filter((id): id is string => Boolean(id));
}
function averageLevel(heroes: readonly HeroState[]): number {
  return heroes.reduce((sum, hero) => sum + hero.level, 0) / heroes.length;
}
function grantQuest(heroes: HeroState[], questId: string, casualtyIndex: number | null, fallenXpRate: number): HeroState[] {
  const quest = QUESTS[questId]!;
  return heroes.map((hero, index) => {
    const xp = getQuestXpForHero(hero, quest, heroes.length);
    return grantHeroXp(hero, index === casualtyIndex ? Math.round(xp * fallenXpRate) : xp);
  });
}
function grantDungeon(heroes: HeroState[], casualtyIndex: number | null, fallenXpRate: number): HeroState[] {
  return heroes.map((hero, index) => {
    const xp = getDungeonCatchupXpTarget(hero.level);
    return grantHeroXp(hero, index === casualtyIndex ? Math.round(xp * fallenXpRate) : xp);
  });
}

describe("casualty-adjusted campaign XP diagnostics", () => {
  it("finds a fallen-hero XP rate that preserves casualty meaning without progression traps", () => {
    for (const fallenXpRate of [.60, .70, .75, .80, .85] as const) {
      for (const profile of [
        { id: "rotating", unlucky: false, dungeonCasualty: false },
        { id: "rotating-dungeon-casualty", unlucky: false, dungeonCasualty: true },
        { id: "unlucky", unlucky: true, dungeonCasualty: false },
      ] as const) {
        let heroes: HeroState[] = Array.from({ length: 4 }, (_, index) => ({ ...testHero(), id: `xp-${profile.id}-${index}`, level: 1, xp: 0 }));
        let mainlineIndex = 0;
        let casualtyCount = 0;
        const rows = [];

        for (let chapterNumber = 1; chapterNumber <= 8; chapterNumber += 1) {
          const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
          for (const questId of campaignQuestIds(chapterNumber)) {
            const hasCasualty = mainlineIndex % 2 === 1;
            const casualtyIndex = hasCasualty ? (profile.unlucky ? 0 : casualtyCount++ % heroes.length) : null;
            heroes = grantQuest(heroes, questId, casualtyIndex, fallenXpRate);
            mainlineIndex += 1;
          }

          const sideQuestId = chapter.sideQuestIds?.[0];
          if (sideQuestId) heroes = grantQuest(heroes, sideQuestId, null, fallenXpRate);

          const nextMinimum = CAMPAIGN_CHAPTERS[chapterNumber + 1]!.recommendedLevelMin ?? 1;
          let dungeonRuns = 0;
          while (averageLevel(heroes) + .001 < nextMinimum && dungeonRuns < 2 && chapterNumber >= 2) {
            const casualtyIndex = profile.dungeonCasualty ? dungeonRuns % heroes.length : null;
            heroes = grantDungeon(heroes, casualtyIndex, fallenXpRate);
            dungeonRuns += 1;
          }

          rows.push({
            chapter: chapterNumber,
            averageLevel: Number(averageLevel(heroes).toFixed(2)),
            minLevel: Math.min(...heroes.map((hero) => hero.level)),
            maxLevel: Math.max(...heroes.map((hero) => hero.level)),
            dungeonRuns,
            nextMinimum,
            readyByAverage: averageLevel(heroes) + .001 >= nextMinimum,
          });
        }
        console.log("CASUALTY_XP_RATE", fallenXpRate, profile.id);
        console.table(rows);
      }
    }
  });
});
