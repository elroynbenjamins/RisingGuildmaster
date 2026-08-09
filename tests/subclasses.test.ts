import { describe, expect, it } from "vitest";
import { CLASSES } from "../src/data/classes/classes";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { SUBCLASSES } from "../src/data/subclasses/subclasses";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { getHeroSkillIds, getSubclassChoices, selectSubclass } from "../src/game/progression/subclasses/subclassService";
import { testHero } from "./testHero";

describe("subclass progression", () => {
  it("keeps exactly six base classes and gives every class exactly two subclasses", () => { expect(Object.keys(CLASSES)).toEqual(["warrior", "ranger", "mage", "cleric", "paladin", "berserker"]); expect(Object.keys(SUBCLASSES)).toHaveLength(12); for (const classId of Object.keys(CLASSES)) expect(Object.values(SUBCLASSES).filter((subclass) => subclass.baseClassId === classId)).toHaveLength(2); });
  it("rejects Guardian at level 9, allows both Warrior choices at 10, and makes selection permanent", () => { const level9 = { ...testHero(), level: 9 }; expect(() => selectSubclass(level9, "guardian")).toThrow(); const level10 = { ...level9, level: 10 }; expect(getSubclassChoices(level10).map((choice) => choice.id)).toEqual(["guardian", "battlemage_commander"]); const guardian = selectSubclass(level10, "guardian"); expect(guardian.subclassId).toBe("guardian"); expect(() => selectSubclass(guardian, "battlemage_commander")).toThrow(); });
  it("rejects a subclass from the wrong base class", () => expect(() => selectSubclass({ ...testHero(), level: 10, classId: "mage" }, "guardian")).toThrow());
  it("assigns subclass skills through the shared combat skill registry", () => { const hero = selectSubclass({ ...testHero(), level: 10 }, "guardian"); expect(getHeroSkillIds(hero)).toContain("guardian_taunt"); expect(HERO_SKILLS.guardian_taunt).toMatchObject({ range: 3, cooldownTurns: 8, taunt: { durationTurns: 2, offTargetAttackRollModifier: -2 } }); });
  it("applies subclass modifiers to derived and tactical stats", () => { const base = { ...testHero(), level: 10 }; const guardian = selectSubclass(base, "guardian"); expect(calculateHero(guardian).stats.maxHP).toBeGreaterThan(calculateHero(base).stats.maxHP); const baseUnit = createHeroCombatUnit(base, createHeroCombatInstance(base)); const guardianUnit = createHeroCombatUnit(guardian, createHeroCombatInstance(guardian)); expect(guardianUnit.stats.armorClass).toBe(baseUnit.stats.armorClass + 2); expect(guardianUnit.stats.physicalDamage).toBeLessThan(baseUnit.stats.physicalDamage); });
  it("stores all subclass numerical special effects in shared skill definitions", () => { expect(HERO_SKILLS.beastmaster_summon_wolf?.companion).toMatchObject({ hpMultiplier: .4, maxActive: 1 }); expect(HERO_SKILLS.pyromancer_flame_wall?.flameWall).toMatchObject({ connectedTileCount: 3, durationRounds: 2 }); expect(HERO_SKILLS.cryomancer_ice_prison?.savingThrowCondition).toMatchObject({ difficultyClass: 14, conditionId: "rooted" }); expect(HERO_SKILLS.bloodreaver_blood_strike?.lifeStealModifier).toBe(.2); });
});
