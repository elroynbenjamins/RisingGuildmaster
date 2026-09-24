import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { getRogueliteXpForHero } from "../src/game/dungeons/dungeonRunService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
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
    expect(endLevels).toEqual([4, 5, 7, 8, 10, 12, 14, 17, 19]);
  });

  it("reduces roguelite XP only when a hero outlevels the selected theme", () => {
    expect(getRogueliteXpForHero(100, 8, 8)).toBe(100);
    expect(getRogueliteXpForHero(100, 9, 8)).toBe(50);
    expect(getRogueliteXpForHero(100, 10, 8)).toBe(25);
    expect(getRogueliteXpForHero(100, 11, 8)).toBe(10);
    expect(getRogueliteXpForHero(100, 12, 8)).toBe(0);
    expect(getRogueliteXpForHero(100, 20, 8)).toBe(0);
  });
});
