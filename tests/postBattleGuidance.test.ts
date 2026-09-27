import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getPostBattleManagementActions, markPostBattleGuidanceSeen } from "../src/game/onboarding/postBattleGuidanceService";
import type { Hero } from "../src/game/heroes/types";
import type { QuestHeroOutcomeRecord } from "../src/game/quests/questChronicleTypes";
import { testHero } from "./testHero";

function outcome(overrides: Partial<QuestHeroOutcomeRecord> = {}): QuestHeroOutcomeRecord {
  const hero = testHero();
  return { heroId: hero.id, name: hero.name, raceId: hero.raceId, classId: hero.classId, gender: hero.gender, portraitVariant: hero.portraitVariant ?? 0, levelBefore: 1, levelAfter: 2, currentHP: 50, maxHP: 100, conditionIds: ["injured"], availableSkillPoints: 1, fellInBattle: false, newlyInjured: true, ...overrides };
}

function outcomeFor(hero: Hero, overrides: Partial<QuestHeroOutcomeRecord> = {}): QuestHeroOutcomeRecord {
  return outcome({
    heroId: hero.id,
    name: hero.name,
    raceId: hero.raceId,
    classId: hero.classId,
    gender: hero.gender,
    portraitVariant: hero.portraitVariant ?? 0,
    levelBefore: hero.level,
    levelAfter: hero.level,
    currentHP: hero.currentHP,
    maxHP: 100,
    conditionIds: [],
    availableSkillPoints: 0,
    newlyInjured: false,
    ...overrides,
  });
}

function heroes(count: number, level: number, weapon: string | null): Hero[] {
  return Array.from({ length: count }, (_, index) => ({
    ...testHero(),
    id: `post-battle-prep-${index}`,
    name: `Prep ${index + 1}`,
    level,
    currentHP: 100,
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

describe("post-battle management guidance", () => {
  it("offers only actions relevant to the persisted quest result", () => {
    const hero = { ...testHero(), currentHP: 50, conditions: [{ conditionId: "injured" as const, remainingDuration: 2 }], adventureStamina: 75 };
    const guild = { ...createGuild(), heroes: [hero], inventory: ["worn-sword"] };
    const actions = getPostBattleManagementActions({ lootIds: ["worn-sword"], heroOutcomes: [outcome()] }, guild);
    expect(actions.map((action) => action.id)).toEqual(["recovery", "skills", "equipment", "readiness"]);
    expect(actions.find((action) => action.id === "skills")?.heroId).toBe(hero.id);
    expect(actions.find((action) => action.id === "equipment")?.itemId).toBe("worn-sword");
  });

  it("does not recommend management when the party returned fully ready without rewards", () => {
    const hero = { ...testHero(), adventureStamina: 100 };
    const guild = { ...createGuild(), heroes: [hero] };
    const result = getPostBattleManagementActions({ lootIds: [], heroOutcomes: [outcome({ currentHP: 100, maxHP: 100, availableSkillPoints: 0, levelAfter: 1 })] }, guild);
    expect(result).toEqual([]);
  });

  it("removes the first-time badge without removing the useful action", () => {
    const guild = { ...createGuild(), inventory: ["worn-sword"] };
    const summary = { lootIds: ["worn-sword"], heroOutcomes: [] };
    expect(getPostBattleManagementActions(summary, guild)[0]?.isNew).toBe(true);
    const seen = markPostBattleGuidanceSeen(guild, "equipment");
    expect(getPostBattleManagementActions(summary, seen)[0]).toMatchObject({ id: "equipment", isNew: false });
  });

  it("puts recovery first and then recommends a useful side quest after a damaging defeat", () => {
    const guild = chapterEightGuild();
    guild.heroes = guild.heroes.map((hero, index) => ({
      ...hero,
      classId: "mage" as const,
      level: 15,
      currentHP: index === 0 ? 0 : 70,
      equipment: { ...hero.equipment, weapon: "skyvault-crozier" },
    }));
    const heroOutcomes = guild.heroes.slice(0, 4).map((hero, index) => outcomeFor(hero, {
      fellInBattle: index === 0,
      currentHP: hero.currentHP,
    }));
    const actions = getPostBattleManagementActions({ status: "defeat", lootIds: [], heroOutcomes }, guild);
    expect(actions[0]?.id).toBe("recovery");
    expect(actions[1]).toMatchObject({
      id: "preparation",
      destination: "side_quests",
      actionLabel: "Browse Side Quests",
    });
    expect(actions[1]?.description).toContain("The Lighthouse That Walked");
  });

  it("falls back to a Roguelite Expedition when catch-up is needed and chapter side quests are cleared", () => {
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
    const actions = getPostBattleManagementActions({
      status: "defeat",
      lootIds: [],
      heroOutcomes: guild.heroes.slice(0, 4).map((hero) => outcomeFor(hero)),
    }, guild);
    expect(actions.find((action) => action.id === "preparation")).toMatchObject({
      destination: "dungeon",
      actionLabel: "Open Roguelite",
    });
  });

  it("does not manufacture prep work after a clean victory", () => {
    const guild = chapterEightGuild();
    guild.heroes = guild.heroes.map((hero) => ({
      ...hero,
      classId: "mage" as const,
      level: 15,
      currentHP: 100,
      equipment: { ...hero.equipment, weapon: "skyvault-crozier" },
    }));
    const actions = getPostBattleManagementActions({
      status: "victory",
      lootIds: [],
      heroOutcomes: guild.heroes.map((hero) => outcomeFor(hero, { fellInBattle: false, currentHP: 100 })),
    }, guild);
    expect(actions.some((action) => action.id === "preparation")).toBe(false);
  });
});
