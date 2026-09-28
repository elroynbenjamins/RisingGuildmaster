import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import type { ClassId, Hero } from "../src/game/heroes/types";
import { createGuild } from "../src/game/guild/guildService";
import { suggestPartyForQuest } from "../src/game/party/partyRecommendationService";
import { buildRecommendedQuestParty } from "../src/game/party/questDeploymentService";
import { testHero } from "./testHero";

const lateSecondary = {
  helmet: "veyr-memory-helm",
  boots: "abysswalker-boots",
  accessory1: "echopearl-ring",
  accessory2: "seventh-seal-charm",
} as const;

function lateHero(id: string, classId: ClassId, level: number, sparse = false): Hero {
  const weapon = classId === "ranger"
    ? (level >= 16 ? "deepward-longbow" : "delvers-longbow")
    : classId === "mage" || classId === "cleric"
      ? (level >= 16 ? "deepward-crozier" : "delvers-crozier")
      : (level >= 16 ? "deepward-longsword" : "delvers-longsword");
  const armor = level >= 16 ? "deepward-fieldcoat" : "delver-fieldcoat";
  const base: Hero = {
    ...testHero(),
    id,
    name: id,
    classId,
    level,
    isAvailable: true,
    equipment: {
      ...testHero().equipment,
      weapon,
      armor,
      ...(sparse ? { helmet: null, boots: null, accessory1: null, accessory2: null } : lateSecondary),
    },
  };
  return { ...base, currentHP: calculateHero(base).stats.maxHP };
}

describe("gear-aware party recommendations", () => {
  const quest = QUESTS.serekh_chartmaker_boss!;

  it("prefers a fully geared Level-15 veteran over a sparse Level-16 recruit for the same role", () => {
    const sparseRecruit = lateHero("sparse-warrior", "warrior", 16, true);
    const gearedVeteran = lateHero("geared-warrior", "warrior", 15);
    const guild = createGuild();
    guild.heroes = [
      sparseRecruit,
      gearedVeteran,
      lateHero("cleric", "cleric", 16),
      lateHero("ranger", "ranger", 16),
      lateHero("mage", "mage", 16),
    ];

    const suggested = suggestPartyForQuest(guild, quest);
    expect(suggested).toContain(gearedVeteran.id);
    expect(suggested).not.toContain(sparseRecruit.id);

    const recommended = buildRecommendedQuestParty(quest, guild.heroes);
    expect(recommended).toContain(gearedVeteran.id);
    expect(recommended).not.toContain(sparseRecruit.id);
  });

  it("still selects a sparse recruit when they are the only frontline solution", () => {
    const sparseFrontline = lateHero("only-frontline", "warrior", 16, true);
    const guild = createGuild();
    guild.heroes = [
      sparseFrontline,
      lateHero("cleric", "cleric", 16),
      lateHero("ranger", "ranger", 16),
      lateHero("mage", "mage", 16),
      lateHero("second-support", "cleric", 16),
    ];

    expect(suggestPartyForQuest(guild, quest)).toContain(sparseFrontline.id);
    expect(buildRecommendedQuestParty(quest, guild.heroes)).toContain(sparseFrontline.id);
  });
});
