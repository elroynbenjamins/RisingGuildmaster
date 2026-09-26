import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { testHero } from "./testHero";

const partyClasses = ["warrior", "ranger", "cleric", "mage"] as const;

describe("Chapter 6 balance probe", () => {
  it("compares Chapter 5 handoff with Chapter 6 first-encounter pressure using lagged basic gear", () => {
    const scenarios = [
      { id: "chapter5-road-glass-first", questId: "road_of_glass", heroLevel: 8, seed: 15000 },
      { id: "chapter5-burning-causeway-first", questId: "the_burning_causeway", heroLevel: 9, seed: 15100 },
      { id: "chapter5-solkar-first", questId: "solkar_ash_herald_boss", heroLevel: 9, seed: 15200 },
      { id: "chapter6-laurel-law-first", questId: "laurel_law", heroLevel: 10, seed: 16000 },
      { id: "chapter6-five-roads-first", questId: "the_five_roads_run", heroLevel: 10, seed: 16100 },
      { id: "chapter6-guildhall-first", questId: "guildhall_under_siege", heroLevel: 11, seed: 16200 },
      { id: "chapter6-sixth-voice-first", questId: "the_sixth_voice", heroLevel: 11, seed: 16300 },
      { id: "chapter6-cassian-guard-first", questId: "cassian_vane_boss", heroLevel: 11, seed: 16400 },
      { id: "chapter6-empty-banner-first", questId: "the_empty_banner", heroLevel: 10, seed: 16500 },
      { id: "chapter6-last-lantern-first", questId: "supper_at_the_last_lantern", heroLevel: 11, seed: 16600 },
    ].map((scenario) => ({
      ...scenario,
      partyClasses,
      difficultyId: "standard" as const,
      runs: 6,
      gearProfile: "lagged_basic" as const,
      encounterLimit: 1,
    }));

    const results = scenarios.map(simulateCombatScenario);
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 180_000);

  it("measures the Chapter 6 full-quest curve at intended levels", () => {
    const scenarios = [
      { id: "chapter6-laurel-law", questId: "laurel_law", heroLevel: 10, seed: 17000 },
      { id: "chapter6-five-roads", questId: "the_five_roads_run", heroLevel: 10, seed: 17100 },
      { id: "chapter6-guildhall", questId: "guildhall_under_siege", heroLevel: 11, seed: 17200 },
      { id: "chapter6-sixth-voice", questId: "the_sixth_voice", heroLevel: 11, seed: 17300 },
      { id: "chapter6-cassian-standard", questId: "cassian_vane_boss", heroLevel: 11, seed: 17400 },
      { id: "chapter6-empty-banner", questId: "the_empty_banner", heroLevel: 10, seed: 17500 },
      { id: "chapter6-last-lantern", questId: "supper_at_the_last_lantern", heroLevel: 11, seed: 17600 },
    ].map((scenario) => ({
      ...scenario,
      partyClasses,
      difficultyId: "standard" as const,
      runs: 4,
      gearProfile: "lagged_basic" as const,
    }));

    const results = scenarios.map(simulateCombatScenario);
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 180_000);

  it("records natural XP carry into and through Chapter 6 with and without side quests", () => {
    const runPath = (includeSideQuests: boolean) => {
      let hero = { ...testHero(), level: 1, xp: 0 };
      const rows: { checkpoint: string; level: number; xp: number }[] = [];

      for (const chapter of Object.values(CAMPAIGN_CHAPTERS).filter((entry) => entry.chapterNumber <= 5)) {
        const campaignQuestIds = chapter.nodeIds
          .map((id) => CAMPAIGN_NODES[id]?.questId)
          .filter((id): id is string => Boolean(id));
        for (const questId of [...campaignQuestIds, ...(includeSideQuests ? chapter.sideQuestIds ?? [] : [])]) {
          hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
        }
        rows.push({ checkpoint: `end-chapter-${chapter.chapterNumber}`, level: hero.level, xp: hero.xp });
      }

      rows.push({ checkpoint: "chapter-6-entry", level: hero.level, xp: hero.xp });
      const chapter6 = CAMPAIGN_CHAPTERS.chapter_6!;
      const chapter6MainIds = chapter6.nodeIds
        .map((id) => CAMPAIGN_NODES[id]?.questId)
        .filter((id): id is string => Boolean(id));

      for (const questId of chapter6MainIds) {
        hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
        rows.push({ checkpoint: `after-${questId}`, level: hero.level, xp: hero.xp });
      }
      if (includeSideQuests) {
        for (const questId of chapter6.sideQuestIds ?? []) {
          hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
          rows.push({ checkpoint: `after-${questId}`, level: hero.level, xp: hero.xp });
        }
      }
      return rows;
    };

    const mainOnly = runPath(false);
    const allAuthored = runPath(true);
    console.log("MAIN STORY ONLY");
    console.table(mainOnly);
    console.log("MAIN + SIDE QUESTS");
    console.table(allAuthored);

    expect(mainOnly.find((row) => row.checkpoint === "chapter-6-entry")?.level).toBeGreaterThanOrEqual(9);
    expect(allAuthored.find((row) => row.checkpoint === "chapter-6-entry")?.level).toBeGreaterThanOrEqual(10);
  });
});
