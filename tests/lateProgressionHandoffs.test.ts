import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { getDungeonCatchupXpTarget } from "../src/game/dungeons/dungeonRunService";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

function runQuests(startLevel: number, questIds: readonly string[]) {
  let hero = { ...testHero(), level: startLevel, xp: 0 };
  for (const questId of questIds) {
    hero = grantHeroXp(hero, getQuestXpForHero(hero, QUESTS[questId]!, 4));
  }
  return hero;
}

describe("late campaign progression handoffs", () => {
  it("reports the Chapter 7 to 8 authored and expedition routes", () => {
    const mainline = [
      "road_above_the_clouds",
      "embassy_of_empty_armor",
      "siege_of_skyvault",
      "the_severed_voice",
      "varkesh_gilded_rupture_boss",
    ] as const;

    const afterMainline = runQuests(12, mainline);
    const afterOneSide = runQuests(12, [...mainline, "the_bell_that_hatched"]);
    const afterBothSides = runQuests(12, [...mainline, "the_bell_that_hatched", "feathers_over_the_abyss"]);
    const afterOneSideAndExpedition = grantHeroXp(
      afterOneSide,
      getDungeonCatchupXpTarget(afterOneSide.level),
    );

    console.table([
      { route: "ch7-mainline", level: afterMainline.level, xp: afterMainline.xp },
      { route: "ch7-plus-one-side", level: afterOneSide.level, xp: afterOneSide.xp },
      { route: "ch7-plus-both-sides", level: afterBothSides.level, xp: afterBothSides.xp },
      { route: "ch7-one-side-plus-expedition", level: afterOneSideAndExpedition.level, xp: afterOneSideAndExpedition.xp },
    ]);

    expect(afterOneSide.level).toBeGreaterThanOrEqual(13);
    expect(
      Math.max(afterBothSides.level, afterOneSideAndExpedition.level),
      "authored side content or one catch-up expedition should provide a clean Level-14 route",
    ).toBeGreaterThanOrEqual(14);
  });

  it("reports the Chapter 8 to 9 authored and expedition routes", () => {
    const mainline = [
      "road_to_tidewatch",
      "harbor_without_horizon",
      "siege_of_tidewatch",
      "board_the_nameless",
      "admiral_nhal_veyr_boss",
    ] as const;

    const afterMainline = runQuests(14, mainline);
    const afterOneSide = runQuests(14, [...mainline, "the_lighthouse_that_walked"]);
    const afterBothSides = runQuests(14, [...mainline, "the_lighthouse_that_walked", "letters_from_a_sunken_ship"]);
    const afterOneSideAndExpedition = grantHeroXp(
      afterOneSide,
      getDungeonCatchupXpTarget(afterOneSide.level),
    );
    const afterOneSideAndTwoExpeditions = grantHeroXp(
      afterOneSideAndExpedition,
      getDungeonCatchupXpTarget(afterOneSideAndExpedition.level),
    );

    console.table([
      { route: "ch8-mainline", level: afterMainline.level, xp: afterMainline.xp },
      { route: "ch8-plus-one-side", level: afterOneSide.level, xp: afterOneSide.xp },
      { route: "ch8-plus-both-sides", level: afterBothSides.level, xp: afterBothSides.xp },
      { route: "ch8-one-side-plus-expedition", level: afterOneSideAndExpedition.level, xp: afterOneSideAndExpedition.xp },
      { route: "ch8-one-side-plus-two-expeditions", level: afterOneSideAndTwoExpeditions.level, xp: afterOneSideAndTwoExpeditions.xp },
    ]);

    expect(afterOneSide.level).toBeGreaterThanOrEqual(15);
    expect(
      Math.max(afterBothSides.level, afterOneSideAndTwoExpeditions.level),
      "authored side content or at most two catch-up expeditions should provide a clean Level-16 route",
    ).toBeGreaterThanOrEqual(16);
  });
});
