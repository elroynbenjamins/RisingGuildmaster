import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "../src/config/gameConfig";
import { QUESTS } from "../src/data/quests/quests";
import { getCampaignLevelGuidance } from "../src/game/campaign/campaignReadinessService";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { createGuild } from "../src/game/guild/guildService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

const chapter7Mainline = [
  "road_above_the_clouds",
  "embassy_of_empty_armor",
  "siege_of_skyvault",
  "the_severed_voice",
  "varkesh_gilded_rupture_boss",
] as const;

const chapter8Mainline = [
  "road_to_tidewatch",
  "harbor_without_horizon",
  "siege_of_tidewatch",
  "board_the_nameless",
  "admiral_nhal_veyr_boss",
] as const;

function runQuests(startLevel: number, questIds: readonly string[]) {
  let hero = { ...testHero(), level: startLevel, xp: 0 };
  for (const questId of questIds) hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
  return hero;
}

function runWithRotatingFalls(startLevel: number, questIds: readonly string[]) {
  let heroes = Array.from({ length: 4 }, (_, index) => ({
    ...testHero(),
    id: `late-handoff-${startLevel}-${index}`,
    level: startLevel,
    xp: 0,
  }));

  questIds.forEach((questId, questIndex) => {
    const quest = QUESTS[questId]!;
    const fallenIndex = questIndex % 2 === 1 ? questIndex % heroes.length : null;
    heroes = heroes.map((hero, index) => {
      const xp = getQuestXpForHero(hero, quest, heroes.length);
      return grantHeroXp(hero, index === fallenIndex ? Math.round(xp * GAME_CONFIG.fallenHeroXpRate) : xp);
    });
  });
  return heroes;
}

function grantQuestToParty(heroes: ReturnType<typeof runWithRotatingFalls>, questId: string) {
  const quest = QUESTS[questId]!;
  return heroes.map((hero) => grantHeroXp(hero, getQuestXpForHero(hero, quest, heroes.length)));
}

function grantExpeditionToParty(heroes: ReturnType<typeof runWithRotatingFalls>) {
  return heroes.map((hero) => grantHeroXp(hero, getDungeonCatchupXpTarget(hero.level)));
}

function averageLevel(heroes: ReturnType<typeof runWithRotatingFalls>) {
  return heroes.reduce((sum, hero) => sum + hero.level, 0) / heroes.length;
}

describe("late campaign progression handoffs", () => {
  it("takes Chapter 7 mainline to Level 13 and one authored side quest to the Level-14 Chapter 8 floor", () => {
    const afterMainline = runQuests(12, chapter7Mainline);
    const afterOneSide = runQuests(12, [...chapter7Mainline, "the_bell_that_hatched"]);

    expect(afterMainline.level).toBe(13);
    expect(afterOneSide.level).toBeGreaterThanOrEqual(14);
  });

  it("keeps a casualty-affected Chapter 7 core within one expedition of Level 14", () => {
    let heroes = runWithRotatingFalls(12, chapter7Mainline);
    heroes = grantQuestToParty(heroes, "the_bell_that_hatched");

    expect(averageLevel(heroes)).toBeGreaterThanOrEqual(13);
    heroes = grantExpeditionToParty(heroes);
    expect(averageLevel(heroes), "normal casualties should need at most one catch-up expedition").toBeGreaterThanOrEqual(14);
  });

  it("recommends the remaining Iron Hills side quest before the Chapter 8 opener when needed", () => {
    const guild = createGuild();
    guild.heroes = Array.from({ length: 4 }, (_, index) => ({
      ...testHero(),
      id: `ch8-handoff-${index}`,
      name: `Chapter 8 Handoff ${index + 1}`,
      level: 13,
    }));
    guild.world.campaignChapter = 8;
    guild.world.unlockedRegionIds = [...new Set([...guild.world.unlockedRegionIds, "iron_hills", "greenveil"])];
    guild.world.completedCampaignNodeIds = [
      "the_answer_in_brass", "road_above_the_clouds", "embassy_of_empty_armor", "the_scale_and_the_signature",
      "siege_of_skyvault", "the_severed_voice", "varkesh_boss", "the_concord_of_six", "six_bells_west",
    ];
    guild.world.completedQuestIds = [...chapter7Mainline, "the_bell_that_hatched"];

    expect(getCampaignLevelGuidance(guild)).toMatchObject({
      averageLevel: 13,
      targetLevel: 14,
      nextQuestId: "road_to_tidewatch",
      recommendedSideQuestId: "feathers_over_the_abyss",
    });
  });

  it("reaches the Level-16 Chapter 9 floor from Chapter 8 mainline alone", () => {
    const afterMainline = runQuests(14, chapter8Mainline);
    expect(afterMainline.level).toBeGreaterThanOrEqual(16);
  });

  it("keeps a casualty-affected Chapter 8 core within one side quest and one expedition of Level 16", () => {
    let heroes = runWithRotatingFalls(14, chapter8Mainline);
    heroes = grantQuestToParty(heroes, "the_lighthouse_that_walked");

    expect(averageLevel(heroes)).toBeGreaterThanOrEqual(15);
    heroes = grantExpeditionToParty(heroes);
    expect(averageLevel(heroes), "normal casualties should not require repeated late-game grind").toBeGreaterThanOrEqual(16);
  });

  it("recommends the remaining Tidewatch side quest before the Chapter 9 opener when needed", () => {
    const guild = createGuild();
    guild.heroes = Array.from({ length: 4 }, (_, index) => ({
      ...testHero(),
      id: `ch9-handoff-${index}`,
      name: `Chapter 9 Handoff ${index + 1}`,
      level: 15,
    }));
    guild.world.campaignChapter = 9;
    guild.world.unlockedRegionIds = [...new Set([...guild.world.unlockedRegionIds, "greenveil"])];
    guild.world.completedCampaignNodeIds = [
      "six_bells_west", "road_to_tidewatch", "harbor_without_horizon", "terms_at_low_tide",
      "siege_of_tidewatch", "board_the_nameless", "nhal_veyr_boss", "the_seventh_bell", "map_that_bled_salt",
    ];
    guild.world.completedQuestIds = [...chapter8Mainline, "the_lighthouse_that_walked"];

    expect(getCampaignLevelGuidance(guild)).toMatchObject({
      averageLevel: 15,
      targetLevel: 16,
      nextQuestId: "descent_below_bells",
      recommendedSideQuestId: "letters_from_a_sunken_ship",
    });
  });
});
