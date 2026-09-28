import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { CLASS_SKILL_TREES } from "../src/data/skills/classSkillTrees";
import { SUBCLASSES } from "../src/data/subclasses/subclasses";
import { MASTERIES } from "../src/data/masteries/masteries";
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

function lateHero(id: string, classId: ClassId, level: number, sparse = false, unfinished = false): Hero {
  const weapon = classId === "ranger"
    ? (level >= 16 ? "deepward-longbow" : "delvers-longbow")
    : classId === "mage" || classId === "cleric"
      ? (level >= 16 ? "deepward-crozier" : "delvers-crozier")
      : (level >= 16 ? "deepward-longsword" : "delvers-longsword");
  const armor = level >= 16 ? "deepward-fieldcoat" : "delver-fieldcoat";
  const tree = CLASS_SKILL_TREES[classId];
  const subclassId = Object.values(SUBCLASSES).find((entry) => entry.baseClassId === classId)?.id ?? null;
  const masteryId = Object.values(MASTERIES).find((entry) => entry.baseClassId === classId)?.id ?? null;
  const learnedSkillIds = unfinished
    ? []
    : tree.recommendedPaths[0]!.skillIds.filter((skillId) => (tree.nodes.find((node) => node.skillId === skillId)?.requiredLevel ?? Infinity) <= level);
  const base: Hero = {
    ...testHero(),
    id,
    name: id,
    classId,
    level,
    learnedSkillIds,
    subclassId: unfinished || level < 5 ? null : subclassId,
    masteryId: unfinished || level < 10 ? null : masteryId,
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

  it("prefers a completed Level-15 veteran over a fully geared unfinished Level-16 recruit for the same role", () => {
    const unfinishedRecruit = lateHero("unfinished-warrior", "warrior", 16, false, true);
    const completedVeteran = lateHero("completed-warrior", "warrior", 15);
    const guild = createGuild();
    guild.heroes = [
      unfinishedRecruit,
      completedVeteran,
      lateHero("cleric-progressed", "cleric", 16),
      lateHero("ranger-progressed", "ranger", 16),
      lateHero("mage-progressed", "mage", 16),
    ];

    const suggested = suggestPartyForQuest(guild, quest);
    expect(suggested).toContain(completedVeteran.id);
    expect(suggested).not.toContain(unfinishedRecruit.id);

    const recommended = buildRecommendedQuestParty(quest, guild.heroes);
    expect(recommended).toContain(completedVeteran.id);
    expect(recommended).not.toContain(unfinishedRecruit.id);
  });

  it("still selects an unfinished hero when they are the only frontline solution", () => {
    const unfinishedFrontline = lateHero("unfinished-frontline", "warrior", 16, false, true);
    const guild = createGuild();
    guild.heroes = [
      unfinishedFrontline,
      lateHero("cleric-only-role", "cleric", 16),
      lateHero("ranger-only-role", "ranger", 16),
      lateHero("mage-only-role", "mage", 16),
      lateHero("second-support-progressed", "cleric", 16),
    ];

    expect(suggestPartyForQuest(guild, quest)).toContain(unfinishedFrontline.id);
    expect(buildRecommendedQuestParty(quest, guild.heroes)).toContain(unfinishedFrontline.id);
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
