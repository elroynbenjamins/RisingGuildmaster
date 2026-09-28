import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getCampaignPreparationRecommendation } from "../src/game/campaign/campaignPreparationGuide";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { testHero } from "./testHero";

function heroes(count: number, level: number, weapon: string | null, armor: string | null = "tidewatch-mail") {
  return Array.from({ length: count }, (_, index) => ({
    ...testHero(),
    id: `prep-hero-${index}`,
    name: `Prep ${index + 1}`,
    level,
    equipment: {
      ...testHero().equipment,
      weapon,
      armor,
      helmet: "sunscar-veil",
      boots: "gravewater-waders",
      accessory1: "truthglass-signet",
      accessory2: "ossuary-reliquary",
    },
  }));
}

function chapterSevenBossGuild() {
  const guild = createGuild();
  return {
    ...guild,
    heroes: heroes(4, 13, "wayfarers-longsword", "wayfarer-fieldcoat"),
    world: {
      ...guild.world,
      campaignChapter: 7,
      completedCampaignNodeIds: [
        ...guild.world.completedCampaignNodeIds,
        "broken_wardstone",
        "the_answer_in_brass",
        "road_above_the_clouds",
        "embassy_of_empty_armor",
        "the_scale_and_the_signature",
        "siege_of_skyvault",
        "the_severed_voice",
      ],
      completedQuestIds: [
        "road_above_the_clouds",
        "embassy_of_empty_armor",
        "siege_of_skyvault",
        "the_severed_voice",
      ],
    },
  };
}

function chapterEightGuild() {
  const guild = createGuild();
  return {
    ...guild,
    heroes: heroes(4, 14, "sixth-voice-blade"),
    world: {
      ...guild.world,
      campaignChapter: 8,
      completedCampaignNodeIds: [
        ...guild.world.completedCampaignNodeIds,
        "broken_wardstone",
        "the_concord_of_six",
        "six_bells_west",
        "road_to_tidewatch",
        "harbor_without_horizon",
        "terms_at_low_tide",
      ],
      completedQuestIds: ["road_to_tidewatch", "harbor_without_horizon"],
    },
  };
}

describe("campaign preparation guidance", () => {
  it("recommends the best available chapter side quest when weapons lag", () => {
    const guild = chapterEightGuild();
    guild.heroes = guild.heroes.map((hero) => ({
      ...hero,
      classId: "mage" as const,
      level: 15,
      equipment: { ...hero.equipment, weapon: "skyvault-crozier" },
    }));
    const recommendation = getCampaignPreparationRecommendation(guild);
    expect(recommendation).toMatchObject({
      type: "side_quest",
      questId: "the_lighthouse_that_walked",
      reason: "weapon",
    });
    expect(recommendation?.detail).toContain("weapon recipe");
  });

  it("does not manufacture prep work for a ready, adequately equipped party", () => {
    const guild = chapterEightGuild();
    guild.heroes = heroes(4, 14, "concordance-glaive");
    expect(getCampaignPreparationRecommendation(guild)).toBeNull();
  });

  it("prefers an armor-recipe side quest when multiple core heroes have badly lagging armor", () => {
    const guild = chapterEightGuild();
    guild.heroes = heroes(4, 15, "concordance-glaive").map((hero, index) => index < 2 ? {
      ...hero,
      classId: index === 0 ? "mage" as const : "cleric" as const,
      equipment: { ...hero.equipment, weapon: "lighthouse-prism-crozier", armor: "free-oath-coat" },
    } : hero);
    const recommendation = getCampaignPreparationRecommendation(guild);
    expect(recommendation).toMatchObject({
      type: "side_quest",
      questId: "letters_from_a_sunken_ship",
      reason: "armor",
    });
    expect(recommendation?.detail).toContain("armor at least three levels behind");
    expect(recommendation?.detail).toContain("armor recipe");
  });

  it("routes a Chapter 7 replacement toward the Bell side quest before Varkesh", () => {
    const guild = chapterSevenBossGuild();
    guild.heroes = guild.heroes.map((hero, index) => index === 0 ? {
      ...hero,
      level: 12,
      equipment: {
        ...hero.equipment,
        helmet: null,
        boots: null,
        accessory1: null,
        accessory2: null,
      },
    } : hero);
    const recommendation = getCampaignPreparationRecommendation(guild);
    expect(recommendation).toMatchObject({
      type: "side_quest",
      questId: "the_bell_that_hatched",
      reason: "secondary",
    });
    expect(recommendation?.detail).toContain("missing three or more helmet, boots, or accessory slots");
    expect(recommendation?.detail).toContain("secondary-slot recipe");
  });

  it("routes a late fresh recruit with empty secondary slots through a useful side quest", () => {
    const guild = chapterEightGuild();
    guild.heroes = heroes(4, 15, "concordance-glaive").map((hero, index) => index === 0 ? {
      ...hero,
      equipment: {
        ...hero.equipment,
        helmet: null,
        boots: null,
        accessory1: null,
        accessory2: null,
      },
    } : hero);
    const recommendation = getCampaignPreparationRecommendation(guild);
    expect(recommendation).toMatchObject({
      type: "side_quest",
      questId: "the_lighthouse_that_walked",
      reason: "secondary",
    });
    expect(recommendation?.detail).toContain("missing three or more helmet, boots, or accessory slots");
    expect(recommendation?.detail).toContain("secondary-slot recipe");
  });

  it("uses two expeditions when a late replacement still lacks secondary gear after local side stories", () => {
    const guild = chapterEightGuild();
    guild.heroes = heroes(6, 15, "concordance-glaive").map((hero, index) => index === 0 ? {
      ...hero,
      equipment: {
        ...hero.equipment,
        helmet: null,
        boots: null,
        accessory1: null,
        accessory2: null,
      },
    } : hero);
    guild.world = {
      ...guild.world,
      completedQuestIds: [
        ...guild.world.completedQuestIds,
        "the_lighthouse_that_walked",
        "letters_from_a_sunken_ship",
      ],
    };
    expect(getCampaignPreparationRecommendation(guild)).toMatchObject({
      type: "dungeon",
      reason: "secondary",
      suggestedRuns: 2,
      title: "2 Wardstone Expeditions",
    });
  });

  it("falls back to a Wardstone expedition when side stories are cleared and the next mission is ahead", () => {
    const guild = chapterEightGuild();
    guild.heroes = heroes(6, 14, "concordance-glaive");
    guild.world = {
      ...guild.world,
      completedCampaignNodeIds: [...guild.world.completedCampaignNodeIds, "siege_of_tidewatch", "board_the_nameless"],
      completedQuestIds: [
        ...guild.world.completedQuestIds,
        "siege_of_tidewatch",
        "board_the_nameless",
        "the_lighthouse_that_walked",
        "letters_from_a_sunken_ship",
      ],
    };
    expect(getCampaignPreparationRecommendation(guild)).toMatchObject({
      type: "dungeon",
      reason: "level",
      suggestedRuns: 2,
      title: "2 Wardstone Expeditions",
    });
  });

  it("recommends two Wardstone runs when multiple core weapons badly lag", () => {
    const guild = chapterEightGuild();
    guild.heroes = heroes(6, 15, "concordance-glaive").map((hero, index) => index < 2 ? {
      ...hero,
      classId: index === 0 ? "mage" as const : "cleric" as const,
      equipment: { ...hero.equipment, weapon: "skyvault-crozier" },
    } : hero);
    guild.world = {
      ...guild.world,
      completedQuestIds: [
        ...guild.world.completedQuestIds,
        "the_lighthouse_that_walked",
        "letters_from_a_sunken_ship",
      ],
    };
    expect(getCampaignPreparationRecommendation(guild)).toMatchObject({
      type: "dungeon",
      reason: "weapon",
      suggestedRuns: 2,
      title: "2 Wardstone Expeditions",
    });
  });

  it("recommends one Wardstone run when the core party is within one catch-up target of the next level", () => {
    const guild = chapterEightGuild();
    const level = 14;
    const remainingTarget = getDungeonCatchupXpTarget(level);
    guild.heroes = heroes(6, level, "concordance-glaive").map((hero) => ({
      ...hero,
      xp: xpRequiredForNextLevel(level) - remainingTarget,
    }));
    guild.world = {
      ...guild.world,
      completedCampaignNodeIds: [...guild.world.completedCampaignNodeIds, "siege_of_tidewatch", "board_the_nameless"],
      completedQuestIds: [
        ...guild.world.completedQuestIds,
        "siege_of_tidewatch",
        "board_the_nameless",
        "the_lighthouse_that_walked",
        "letters_from_a_sunken_ship",
      ],
    };
    expect(getCampaignPreparationRecommendation(guild)).toMatchObject({
      type: "dungeon",
      reason: "level",
      suggestedRuns: 1,
      title: "Wardstone Expedition",
    });
  });
});
