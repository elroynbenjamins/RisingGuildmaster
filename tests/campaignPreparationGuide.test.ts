import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getCampaignPreparationRecommendation } from "../src/game/campaign/campaignPreparationGuide";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { advanceGuildTime } from "../src/game/economy/guildCalendarService";
import { startHeroTraining } from "../src/game/training/trainingService";
import { testHero } from "./testHero";
import type { Hero } from "../src/game/heroes/types";

function heroes(count: number, level: number, weapon: string | null, armor: string | null = "tidewatch-mail"): Hero[] {
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

function chapterSevenBossGuild(count = 4) {
  const guild = createGuild();
  return {
    ...guild,
    heroes: heroes(count, 13, "wayfarers-longsword", "wayfarer-fieldcoat"),
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

function chapterNineBossGuild(count = 4) {
  const guild = createGuild();
  return {
    ...guild,
    heroes: heroes(count, 17, "deepward-longsword", "deepward-fieldcoat"),
    world: {
      ...guild.world,
      campaignChapter: 9,
      completedCampaignNodeIds: [
        ...guild.world.completedCampaignNodeIds,
        "broken_wardstone",
        "the_seventh_bell",
        "map_that_bled_salt",
        "descent_below_bells",
        "streets_drown_twice",
        "name_of_the_seventh",
        "citadel_unwritten_law",
        "chain_beneath_fleet",
      ],
      completedQuestIds: [
        "descent_below_bells",
        "streets_drown_twice",
        "citadel_unwritten_law",
        "chain_beneath_fleet",
      ],
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

  it("stops severe secondary-gap guidance after two secondary pieces are restored", () => {
    const guild = chapterEightGuild();
    guild.heroes = heroes(4, 14, "concordance-glaive").map((hero, index) => index === 0 ? {
      ...hero,
      equipment: {
        ...hero.equipment,
        accessory1: null,
        accessory2: null,
      },
    } : hero);
    expect(getCampaignPreparationRecommendation(guild)).toBeNull();
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

  it("routes a Chapter 9 replacement toward the Choir side quest before Serekh", () => {
    const guild = chapterNineBossGuild();
    guild.heroes = guild.heroes.map((hero, index) => index === 0 ? {
      ...hero,
      level: 16,
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
      questId: "choir_in_the_diving_bell",
      reason: "secondary",
    });
    expect(recommendation?.detail).toContain("secondary-slot recipe");
  });

  it("keeps an available Side Quest as the first recommendation when the whole field team is under-levelled", () => {
    const guild = chapterEightGuild();
    guild.heroes = heroes(4, 13, "sixth-voice-blade");
    const recommendation = getCampaignPreparationRecommendation(guild);
    expect(recommendation).toMatchObject({
      type: "side_quest",
      reason: "level",
    });
    expect(recommendation?.detail).toMatch(/side quest/i);
  });

  it("offers roguelite or Training Hall XP catch-up after a Chapter 7 replacement fixes gear", () => {
    const guild = chapterSevenBossGuild(6);
    guild.heroes = guild.heroes.map((hero, index) => index === 0 ? {
      ...hero,
      level: 12,
      xp: 0,
    } : hero);
    guild.recentPartyHeroIds = guild.heroes.slice(0, 4).map((hero) => hero.id);
    const recommendation = getCampaignPreparationRecommendation(guild);
    expect(recommendation).toMatchObject({
      type: "dungeon",
      reason: "level",
      title: "2 Roguelite Expeditions",
      trainingAlternative: {
        heroId: guild.heroes[0]!.id,
        heroName: guild.heroes[0]!.name,
        currentLevel: 12,
        targetLevel: 13,
      },
    });
    expect(recommendation?.detail).toMatch(/Roguelite Expedition/i);
    expect(recommendation?.detail).toMatch(/Training Hall/i);
  });

  it("shows the late Training Hall time and gold estimate for an under-level Chapter 9 recruit", () => {
    const guild = chapterNineBossGuild(6);
    guild.trainingGround.level = 3;
    guild.heroes = guild.heroes.map((hero, index) => index === 0 ? {
      ...hero,
      level: 16,
      xp: 0,
    } : hero);
    guild.recentPartyHeroIds = guild.heroes.slice(0, 4).map((hero) => hero.id);
    guild.world = {
      ...guild.world,
      completedQuestIds: [
        ...guild.world.completedQuestIds,
        "choir_in_the_diving_bell",
        "tavern_at_the_bottom_of_the_sea",
      ],
    };
    const recommendation = getCampaignPreparationRecommendation(guild);
    expect(recommendation).toMatchObject({
      type: "dungeon",
      reason: "level",
      trainingAlternative: {
        heroId: guild.heroes[0]!.id,
        currentLevel: 16,
        targetLevel: 17,
        programId: "heroic_regimen",
        programName: "Heroic Curriculum",
        sessions: 2,
        estimatedDays: 8,
        estimatedGoldCost: 720,
      },
    });
    expect(recommendation?.detail).toContain("2 Heroic Curriculum sessions");
    expect(recommendation?.detail).toContain("8 days");
    expect(recommendation?.detail).toContain("720 gold");
  });

  it("updates and clears Chapter 9 Training Hall catch-up advice as the replacement recovers", () => {
    let guild = chapterNineBossGuild(6);
    guild.trainingGround.level = 3;
    guild.heroes = guild.heroes.map((hero, index) => index === 0 ? {
      ...hero,
      level: 16,
      xp: 0,
    } : hero);
    guild.recentPartyHeroIds = guild.heroes.slice(0, 4).map((hero) => hero.id);
    guild.world = {
      ...guild.world,
      completedQuestIds: [
        ...guild.world.completedQuestIds,
        "choir_in_the_diving_bell",
        "tavern_at_the_bottom_of_the_sea",
      ],
    };

    const traineeId = guild.heroes[0]!.id;
    const firstAdvice = getCampaignPreparationRecommendation(guild);
    expect(firstAdvice).toMatchObject({
      type: "dungeon",
      reason: "level",
      trainingAlternative: {
        heroId: traineeId,
        programId: "heroic_regimen",
        sessions: 2,
        estimatedDays: 8,
        estimatedGoldCost: 720,
      },
    });

    guild = startHeroTraining(guild, traineeId, firstAdvice!.trainingAlternative!.programId);
    expect(getCampaignPreparationRecommendation(guild)?.trainingAlternative).toBeUndefined();

    guild = advanceGuildTime(guild, 4).guild;
    const traineeAfterOne = guild.heroes.find((hero) => hero.id === traineeId)!;
    expect(traineeAfterOne.level).toBe(16);
    expect(traineeAfterOne.xp).toBeGreaterThan(0);

    const secondAdvice = getCampaignPreparationRecommendation(guild);
    expect(secondAdvice).toMatchObject({
      type: "dungeon",
      reason: "level",
      trainingAlternative: {
        heroId: traineeId,
        programId: "class_mastery",
        sessions: 1,
        estimatedDays: 3,
        estimatedGoldCost: 190,
      },
    });

    guild = startHeroTraining(guild, traineeId, secondAdvice!.trainingAlternative!.programId);
    guild = advanceGuildTime(guild, 3).guild;
    const recovered = guild.heroes.find((hero) => hero.id === traineeId)!;
    expect(recovered.level).toBe(17);
    expect(getCampaignPreparationRecommendation(guild)).toBeNull();
  });

  it("falls back to two Roguelite runs for a Chapter 9 sparse replacement after local side stories", () => {
    const guild = chapterNineBossGuild(6);
    guild.heroes = guild.heroes.map((hero, index) => index === 0 ? {
      ...hero,
      level: 16,
      equipment: {
        ...hero.equipment,
        helmet: null,
        boots: null,
        accessory1: null,
        accessory2: null,
      },
    } : hero);
    guild.recentPartyHeroIds = guild.heroes.slice(0, 4).map((hero) => hero.id);
    guild.world = {
      ...guild.world,
      completedQuestIds: [
        ...guild.world.completedQuestIds,
        "choir_in_the_diving_bell",
        "tavern_at_the_bottom_of_the_sea",
      ],
    };
    expect(getCampaignPreparationRecommendation(guild)).toMatchObject({
      type: "dungeon",
      reason: "secondary",
      suggestedRuns: 2,
      title: "2 Roguelite Expeditions",
    });
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
      title: "2 Roguelite Expeditions",
    });
  });

  it("falls back to Roguelite expeditions when side stories are cleared and the next mission is ahead", () => {
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
      title: "2 Roguelite Expeditions",
    });
  });

  it("recommends two Roguelite runs when multiple core weapons badly lag", () => {
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
      title: "2 Roguelite Expeditions",
    });
  });

  it("recommends one Roguelite run when the core party is within one catch-up target of the next level", () => {
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
      title: "Roguelite Expedition",
    });
  });
});
