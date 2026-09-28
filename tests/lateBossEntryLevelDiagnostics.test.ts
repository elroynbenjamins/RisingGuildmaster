import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

describe("late boss entry level diagnostics", () => {
  it("prints normal and completionist levels when Chapters 7–9 bosses are reached", () => {
    for (const mode of ["normal", "completionist"] as const) {
      let hero = { ...testHero(), level: 1, xp: 0 };
      for (let chapterNumber = 1; chapterNumber <= 9; chapterNumber += 1) {
        const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
        const sideIds = chapter.sideQuestIds ?? [];
        let sideGranted = false;
        for (const nodeId of chapter.nodeIds) {
          const node = CAMPAIGN_NODES[nodeId];
          if (!node?.questId) continue;
          if (node.type === "boss" && !sideGranted) {
            const selected = mode === "completionist" ? sideIds : sideIds.slice(0, 1);
            for (const sideId of selected) hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[sideId]!, 4));
            sideGranted = true;
            if (chapterNumber >= 7) console.log("BOSS_ENTRY", {
              mode,
              chapter: chapterNumber,
              bossQuestId: node.questId,
              level: hero.level,
              xp: hero.xp,
              recommendedMin: QUESTS[node.questId]!.recommendedLevelMin,
              recommendedMax: QUESTS[node.questId]!.recommendedLevelMax,
            });
          }
          hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[node.questId]!, 4));
        }
        if (!sideGranted) {
          const selected = mode === "completionist" ? sideIds : sideIds.slice(0, 1);
          for (const sideId of selected) hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[sideId]!, 4));
        }

        if (mode === "normal" && chapterNumber <= 8) {
          const nextMinimum = CAMPAIGN_CHAPTERS[chapterNumber + 1]!.recommendedLevelMin ?? 1;
          let runs = 0;
          while (chapterNumber >= 2 && hero.level < nextMinimum && runs < 2) {
            hero = grantHeroXp(hero, getDungeonCatchupXpTarget(hero.level));
            runs += 1;
          }
        }
      }
    }
  });
});
