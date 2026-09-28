import { describe, expect, it } from "vitest";
import { DUNGEONS, DUNGEON_NODES } from "../src/data/dungeons/dungeons";
import { ENEMIES } from "../src/data/enemies";
import { getCampaignPreparationRecommendation } from "../src/game/campaign/campaignPreparationGuide";
import { advanceGuildTime } from "../src/game/economy/guildCalendarService";
import { beginDungeonExpedition, closeDungeonExpedition, resolveDungeonCombat } from "../src/game/dungeons/dungeonRunService";
import { generateRogueliteThemeOffers } from "../src/game/dungeons/rogueliteRotationService";
import { createGuild } from "../src/game/guild/guildService";
import type { GuildState } from "../src/game/guild/types";
import type { Hero } from "../src/game/heroes/types";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";

function preparedHero(id: string, level: number): Hero {
  return {
    ...testHero(),
    id,
    name: id,
    level,
    xp: 0,
    isAvailable: true,
    equipment: {
      weapon: "wayfarers-longsword",
      armor: "wayfarer-fieldcoat",
      helmet: "sunscar-veil",
      boots: "gravewater-waders",
      accessory1: "truthglass-signet",
      accessory2: "ossuary-reliquary",
    },
  };
}

function chapterSevenCatchupGuild(): GuildState {
  const guild = createGuild();
  const heroes = [
    preparedHero("replacement", 12),
    preparedHero("veteran-1", 13),
    preparedHero("veteran-2", 13),
    preparedHero("veteran-3", 13),
    preparedHero("reserve-1", 13),
    preparedHero("reserve-2", 13),
  ];
  return {
    ...guild,
    heroes,
    discoveredEnemyIds: Object.keys(ENEMIES),
    recentPartyHeroIds: heroes.slice(0, 4).map((hero) => hero.id),
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
        "the_bell_that_hatched",
        "feathers_over_the_abyss",
      ],
    },
    rogueliteRotation: {
      ...guild.rogueliteRotation,
      offeredDungeonIds: ["wardstone_depths", "thornwood_trials", "temple_of_coils"],
    },
  };
}

function clearLowCombatRoute(guild: GuildState, dungeonId: string, partyHeroIds: string[], seed: number): GuildState {
  let next = beginDungeonExpedition(guild, dungeonId, partyHeroIds, [], createSeededRandom(seed));
  const dungeon = DUNGEONS[dungeonId]!;
  const guardId = dungeon.nodeIds.find((id) => id.endsWith("_guard"))!;
  const bossId = dungeon.nodeIds.find((id) => DUNGEON_NODES[id]?.type === "boss")!;

  next = { ...next, activeDungeonRun: { ...next.activeDungeonRun!, currentNodeId: guardId } };
  next = resolveDungeonCombat(next, "victory", next.activeDungeonRun!.heroInstances, createSeededRandom(seed + 1)).guild;

  next = {
    ...next,
    activeDungeonRun: { ...next.activeDungeonRun!, currentNodeId: bossId },
    activeRogueliteRun: { ...next.activeRogueliteRun!, bossRecipeAwarded: true },
  };
  next = resolveDungeonCombat(next, "victory", next.activeDungeonRun!.heroInstances, createSeededRandom(seed + 2)).guild;
  return closeDungeonExpedition(next);
}

describe("Roguelite replacement catch-up lifecycle", () => {
  it("turns two rotation-limited low-combat clears into a one-level replacement recovery", () => {
    let guild = chapterSevenCatchupGuild();
    const partyIds = guild.recentPartyHeroIds;
    const initial = getCampaignPreparationRecommendation(guild);
    expect(initial).toMatchObject({
      type: "dungeon",
      reason: "level",
      suggestedRuns: 2,
      title: "2 Roguelite Expeditions",
    });
    expect(initial?.detail).toContain("7 days");

    guild = clearLowCombatRoute(guild, "wardstone_depths", partyIds, 31_000);
    const afterFirst = guild.heroes.find((hero) => hero.id === "replacement")!;
    expect(afterFirst.level).toBe(12);
    expect(afterFirst.xp).toBeGreaterThan(0);
    expect(guild.rogueliteRotation.cooldownUntilDay).toBe(guild.currentDay + 7);
    expect(guild.rogueliteRotation.offeredDungeonIds).toHaveLength(0);
    expect(() => beginDungeonExpedition(guild, "wardstone_depths", partyIds)).toThrow(/recover on Day/i);

    const afterFirstAdvice = getCampaignPreparationRecommendation(guild);
    expect(afterFirstAdvice).toMatchObject({
      type: "dungeon",
      reason: "level",
      suggestedRuns: 1,
      title: "Roguelite Expedition",
    });
    expect(afterFirstAdvice?.detail).toContain(`Day ${guild.rogueliteRotation.cooldownUntilDay}`);

    const cooldownDays = guild.rogueliteRotation.cooldownUntilDay - guild.currentDay;
    guild = advanceGuildTime(guild, cooldownDays).guild;
    guild = generateRogueliteThemeOffers(guild, createSeededRandom(31_100));
    expect(guild.rogueliteRotation.offeredDungeonIds.length).toBeGreaterThan(0);

    const secondDungeonId = guild.rogueliteRotation.offeredDungeonIds[0]!;
    guild = clearLowCombatRoute(guild, secondDungeonId, partyIds, 31_200);

    const recovered = guild.heroes.find((hero) => hero.id === "replacement")!;
    expect(recovered.level).toBe(13);
    expect(getCampaignPreparationRecommendation(guild)).toBeNull();
  });
});
