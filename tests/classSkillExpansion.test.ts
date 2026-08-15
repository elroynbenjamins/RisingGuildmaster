import { describe, expect, it } from "vitest";
import { CLASS_SKILL_TREES } from "../src/data/skills/classSkillTrees";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { getAvailableClassSkillPoints, getHeroSkillTree, getNextClassSkillPointLevel, learnClassSkill } from "../src/game/progression/skills/skillProgressionService";
import type { ClassId } from "../src/game/heroes/types";
import { testHero } from "./testHero";

describe("expanded base-class skill trees", () => {
  it("gives every class authored choices through Level 8", () => {
    for (const [classId, tree] of Object.entries(CLASS_SKILL_TREES) as [ClassId, typeof CLASS_SKILL_TREES[ClassId]][]) {
      expect(HERO_SKILLS[tree.basicSkillId], `${classId} basic skill`).toBeDefined();
      expect(new Set(tree.nodes.map((node) => node.requiredLevel))).toEqual(new Set([2, 4, 6, 8]));
      expect(tree.nodes).toHaveLength(9);
      for (const node of tree.nodes) expect(HERO_SKILLS[node.skillId], `${classId}: ${node.skillId}`).toBeDefined();
      expect(tree.recommendedPaths).toHaveLength(2);
      for (const path of tree.recommendedPaths) {
        expect(path.skillIds).toHaveLength(4);
        expect(path.skillIds.map((id) => tree.nodes.find((node) => node.skillId === id)?.requiredLevel)).toEqual([2, 4, 6, 8]);
      }
    }
  });

  it("awards four permanent class choices by Level 8", () => {
    const hero = { ...testHero(), level: 8, learnedSkillIds: ["warrior_power_strike", "warrior_guarded_stance", "warrior_second_wind"] };
    expect(getAvailableClassSkillPoints(hero)).toBe(1);
    const learned = learnClassSkill(hero, "warrior_unbreakable");
    expect(learned.learnedSkillIds).toHaveLength(4);
    expect(getAvailableClassSkillPoints(learned)).toBe(0);
  });

  it("keeps higher-tier skills level locked", () => {
    const hero = { ...testHero(), level: 6, learnedSkillIds: ["warrior_power_strike", "warrior_guarded_stance", "warrior_second_wind"] };
    expect(getHeroSkillTree(hero).find((node) => node.skillId === "warrior_unbreakable")?.state).toBe("locked_level");
    expect(() => learnClassSkill(hero, "warrior_unbreakable")).toThrow("Level 8");
  });

  it("reports the next recommended class milestone", () => {
    expect(getNextClassSkillPointLevel(1)).toBe(2);
    expect(getNextClassSkillPointLevel(4)).toBe(6);
    expect(getNextClassSkillPointLevel(8)).toBeNull();
  });
});
