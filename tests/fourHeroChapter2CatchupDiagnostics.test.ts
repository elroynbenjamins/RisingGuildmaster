import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

function campaignQuestIds(chapterNumber: number): string[] {
  const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
  return chapter.nodeIds.map((id) => CAMPAIGN_NODES[id]?.questId).filter((id): id is string => Boolean(id));
}
function applyQuest(hero: ReturnType<typeof testHero>, questId: string) {
  return grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
}

describe("four-hero Chapter 2 catch-up diagnostics", () => {
  it("checks side-story-only readiness before expeditions unlock", () => {
    let hero = { ...testHero(), level: 1, xp: 0 };

    for (const questId of campaignQuestIds(1)) hero = applyQuest(hero, questId);
    const chapter1Side = CAMPAIGN_CHAPTERS[1]!.sideQuestIds?.[0];
    if (chapter1Side) hero = applyQuest(hero, chapter1Side);

    console.log("FOUR_HERO_AFTER_CH1", { level: hero.level, xp: hero.xp });

    for (const questId of campaignQuestIds(2)) hero = applyQuest(hero, questId);
    console.log("FOUR_HERO_CH2_MAIN", { level: hero.level, xp: hero.xp });

    for (const questId of CAMPAIGN_CHAPTERS[2]!.sideQuestIds ?? []) {
      hero = applyQuest(hero, questId);
      console.log("FOUR_HERO_CH2_SIDE", questId, { level: hero.level, xp: hero.xp });
    }

    console.log("FOUR_HERO_CH3_READY", {
      level: hero.level,
      xp: hero.xp,
      chapter3Minimum: CAMPAIGN_CHAPTERS[3]!.recommendedLevelMin,
    });
  });
});
