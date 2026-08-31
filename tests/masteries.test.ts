import { describe, expect, it } from "vitest";
import { MASTERIES } from "../src/data/masteries/masteries";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { getAdvancedClassName, getMasteryChoices, selectMastery, validateMasterySelection } from "../src/game/progression/masteries/masteryService";
import { getHeroSkillIds } from "../src/game/progression/subclasses/subclassService";
import { testHero } from "./testHero";

describe("level 10 masteries", () => {
  it("provides exactly two choices for every base class", () => { for (const classId of ["warrior","ranger","mage","cleric","paladin","berserker"] as const) expect(getMasteryChoices({ ...testHero(), classId })).toHaveLength(2); });
  it("requires level 10 and a first subclass", () => { expect(validateMasterySelection({ ...testHero(), level: 10 }, "vanguard")).toContain("Choose a level-5 subclass first"); expect(validateMasterySelection({ ...testHero(), level: 9, subclassId: "guardian" }, "vanguard")).toContain("Mastery unlocks at level 10"); });
  it("selects once, adds the skill, and derives the combination title", () => { const hero = selectMastery({ ...testHero(), level: 10, subclassId: "guardian" }, "vanguard"); expect(hero.masteryId).toBe("vanguard"); expect(getHeroSkillIds(hero)).toContain("vanguard_rallying_advance"); expect(getAdvancedClassName(hero)).toBe("Bastion Marshal"); expect(() => selectMastery(hero, "warmaster")).toThrow(/already/); });
  it("defines every mastery skill", () => { for (const mastery of Object.values(MASTERIES)) for (const id of mastery.addedSkillIds) expect(HERO_SKILLS[id]).toBeDefined(); });
});
