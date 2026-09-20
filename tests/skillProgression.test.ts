import { describe, expect, it } from "vitest";
import { getHeroSkillIds } from "../src/game/progression/subclasses/subclassService";
import { getAvailableClassSkillPoints, getHeroSkillTree, learnClassSkill } from "../src/game/progression/skills/skillProgressionService";
import { testHero } from "./testHero";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";

describe("hero class skill progression", () => {
  it("starts a Level 1 hero with only the automatic basic skill", () => {
    expect(getHeroSkillIds(testHero())).toEqual(["warrior_sword_strike"]);
    expect(getAvailableClassSkillPoints(testHero())).toBe(0);
  });

  it("awards a choice at Level 2 and permanently learns the selected skill", () => {
    const levelTwo = { ...testHero(), level: 2 };
    expect(getAvailableClassSkillPoints(levelTwo)).toBe(1);
    expect(getHeroSkillTree(levelTwo).filter((node) => node.state === "available").map((node) => node.skillId)).toEqual(["warrior_shield_bash", "warrior_power_strike"]);
    const learned = learnClassSkill(levelTwo, "warrior_power_strike");
    expect(learned.learnedSkillIds).toEqual(["warrior_power_strike"]);
    expect(getHeroSkillIds(learned)).toEqual(["warrior_sword_strike", "warrior_power_strike"]);
    expect(getAvailableClassSkillPoints(learned)).toBe(0);
  });

  it("unlocks the passive tier and another point at Level 4", () => {
    const hero = { ...testHero(), level: 4, learnedSkillIds: ["warrior_power_strike"] };
    expect(getAvailableClassSkillPoints(hero)).toBe(1);
    expect(getHeroSkillTree(hero).find((node) => node.skillId === "warrior_battle_hardened")?.state).toBe("available");
  });

  it("rejects early, duplicate, cross-class, and no-point selections", () => {
    expect(() => learnClassSkill(testHero(), "warrior_power_strike")).toThrow("Level 2");
    expect(() => learnClassSkill({ ...testHero(), level: 2 }, "mage_fireball")).toThrow("does not belong");
    const learned = learnClassSkill({ ...testHero(), level: 2 }, "warrior_power_strike");
    expect(() => learnClassSkill(learned, "warrior_power_strike")).toThrow("already learned");
    expect(() => learnClassSkill(learned, "warrior_shield_bash")).toThrow("No class skill points");
  });

  it("grants subclass skills separately from class choices", () => {
    const guardian = { ...testHero(), level: 10, subclassId: "guardian", learnedSkillIds: ["warrior_power_strike"] };
    expect(getHeroSkillIds(guardian)).toEqual(["warrior_sword_strike", "warrior_power_strike", "guardian_taunt"]);
  });

  it("persists learned choices and migrates older heroes with unspent choices", () => {
    const guild = { ...createGuild(), heroes: [{ ...testHero(), level: 4, learnedSkillIds: ["warrior_power_strike"] }] };
    expect(deserializeGuild(serializeGuild(guild)).heroes[0]?.learnedSkillIds).toEqual(["warrior_power_strike"]);
    const { learnedSkillIds: _removed, ...legacyHero } = guild.heroes[0]!;
    const legacy = deserializeGuild(JSON.stringify({ ...guild, heroes: [legacyHero] }));
    expect(legacy.heroes[0]?.learnedSkillIds).toEqual([]);
    expect(getAvailableClassSkillPoints(legacy.heroes[0]!)).toBe(2);
  });
});
