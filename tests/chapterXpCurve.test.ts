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
