import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getCampaignPreparationRecommendation } from "../src/game/campaign/campaignPreparationGuide";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { testHero } from "./testHero";

function heroes(count: number, level: number, weapon: string | null) {
  return Array.from({ length: count }, (_, index) => ({
    ...testHero(),
    id: `prep-hero-${index}`,
    name: `Prep ${index + 1}`,
    level,
    equipment: { ...testHero().equipment, weapon },
  }));
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
