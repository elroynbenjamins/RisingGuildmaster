import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { getCampaignLevelGuidance } from "../src/game/campaign/campaignReadinessService";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { createGuild } from "../src/game/guild/guildService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

const chapter6Mainline = [
  "laurel_law",
  "the_five_roads_run",
  "guildhall_under_siege",
  "the_sixth_voice",
  "cassian_vane_boss",
] as const;

describe("Chapter 6 to 7 transition", () => {
  it("keeps a fresh Level-10 core within one normal expedition of the Level-12 Iron Hills floor", () => {
    let hero = { ...testHero(), level: 10, xp: 0 };

    for (const questId of chapter6Mainline) {
      hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
    }
    hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS.the_empty_banner!, 4));

    expect(hero.level).toBe(11);
    expect(hero.xp).toBeGreaterThan(15_000);

    hero = grantHeroXp(hero, getDungeonCatchupXpTarget(hero.level));
    expect(hero.level, "one normal catch-up expedition should reach the Chapter 7 floor").toBeGreaterThanOrEqual(12);
  });

  it("also allows the remaining authored Greenveil side quest to replace the expedition", () => {
    let hero = { ...testHero(), level: 10, xp: 0 };

    for (const questId of chapter6Mainline) {
      hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
    }
    hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS.the_empty_banner!, 4));
    hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS.supper_at_the_last_lantern!, 4));

    expect(hero.level, "authored Chapter 6 side content should provide a no-grind route to Level 12").toBeGreaterThanOrEqual(12);
  });

  it("recommends the remaining authored Greenveil side quest before Road Above the Clouds", () => {
    const guild = createGuild();
    guild.heroes = Array.from({ length: 4 }, (_, index) => ({
      ...testHero(),
      id: `chapter7-handoff-${index}`,
      name: `Handoff Hero ${index + 1}`,
      level: 11,
    }));
    guild.world.campaignChapter = 7;
    guild.world.unlockedRegionIds = [...new Set([...guild.world.unlockedRegionIds, "greenveil", "iron_hills"])];
    guild.world.completedCampaignNodeIds = [
      "home_to_a_lowered_banner",
      "laurel_law",
      "the_five_roads_run",
      "trial_of_the_false_oath",
      "guildhall_under_siege",
      "the_sixth_voice",
      "cassian_vane_boss",
      "a_banner_freely_raised",
      "the_answer_in_brass",
    ];
    guild.world.completedQuestIds = [
      "laurel_law",
      "the_five_roads_run",
      "guildhall_under_siege",
      "the_sixth_voice",
      "cassian_vane_boss",
      "the_empty_banner",
    ];

    expect(getCampaignLevelGuidance(guild)).toMatchObject({
      averageLevel: 11,
      targetLevel: 12,
      nextQuestId: "road_above_the_clouds",
      recommendedSideQuestId: "supper_at_the_last_lantern",
    });
  });
});
