import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import type { Hero } from "../src/game/heroes/types";
import { createGuild } from "../src/game/guild/guildService";
import { suggestPartyForQuest } from "../src/game/party/partyRecommendationService";
import { testHero } from "./testHero";

function fullHp(hero: Hero): Hero {
  return { ...hero, currentHP: calculateHero(hero).stats.maxHP, adventureStamina: 100, isAvailable: true };
}

describe("party recommendation gear readiness", () => {
  it("prefers a fully equipped Level-12 veteran over a sparse Level-13 replacement", () => {
    const sparse = fullHp({
      ...testHero(),
      id: "fresh-replacement",
      name: "Fresh Replacement",
      classId: "warrior",
      level: 13,
      equipment: {
        weapon: "wayfarers-longsword",
        armor: "wayfarer-fieldcoat",
        helmet: null,
        boots: null,
        accessory1: null,
        accessory2: null,
      },
    });
    const geared = fullHp({
      ...testHero(),
      id: "equipped-veteran",
      name: "Equipped Veteran",
      classId: "warrior",
      level: 12,
      equipment: {
        weapon: "wayfarers-longsword",
        armor: "wayfarer-fieldcoat",
        helmet: "leather-cap",
        boots: "trail-boots",
        accessory1: "copper-luck-ring",
        accessory2: "wayfarer-clasp",
      },
    });
    const guild = { ...createGuild(), heroes: [sparse, geared] };
    const quest = { ...QUESTS.guildhaven_cellar_slimes!, minPartySize: 1, maxPartySize: 1, recommendedLevelMin: 13 };

    expect(suggestPartyForQuest(guild, quest)).toEqual([geared.id]);
  });

  it("strongly deprioritizes missing or badly lagging primary gear", () => {
    const ready = fullHp({
      ...testHero(),
      id: "ready",
      classId: "warrior",
      level: 12,
      equipment: {
        weapon: "wayfarers-longsword",
        armor: "wayfarer-fieldcoat",
        helmet: null,
        boots: null,
        accessory1: null,
        accessory2: null,
      },
    });
    const missing = fullHp({ ...testHero(), id: "missing", classId: "warrior", level: 14 });
    const lagging = fullHp({
      ...testHero(),
      id: "lagging",
      classId: "warrior",
      level: 14,
      equipment: { ...testHero().equipment, weapon: "worn-sword", armor: "padded-armor" },
    });
    const guild = { ...createGuild(), heroes: [missing, lagging, ready] };
    const quest = { ...QUESTS.guildhaven_cellar_slimes!, minPartySize: 1, maxPartySize: 1, recommendedLevelMin: 14 };

    expect(suggestPartyForQuest(guild, quest)).toEqual([ready.id]);
  });
});
