import { describe, expect, it } from "vitest";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { calculateMaxMana, calculateMaxStamina, canPaySkillCost, paySkillCost, recoverBetweenEncounters, regenerateHeroResources } from "../src/game/combat/resourceService";
import type { HeroCombatInstance } from "../src/game/combat/combatTypes";
const instance = (values: Partial<HeroCombatInstance> = {}): HeroCombatInstance => ({ heroId: "h", currentHP: 100, maxHP: 100, currentMana: 50, maxMana: 100, currentStamina: 40, maxStamina: 100, activeConditions: [], activeCooldowns: {}, isAlive: true, position: { x: 1, y: 2 }, movementRange: 3, ...values });
describe("hero combat resources", () => {
  it("calculates mana and stamina formulas", () => { expect(calculateMaxMana({ strength: 1, dexterity: 1, constitution: 1, intelligence: 15, wisdom: 10, charisma: 1 })).toBe(85); expect(calculateMaxStamina({ strength: 14, dexterity: 10, constitution: 12, intelligence: 1, wisdom: 1, charisma: 1 })).toBe(92); });
  it("regenerates 5% mana and 10% stamina without exceeding max", () => { expect(regenerateHeroResources(instance())).toMatchObject({ currentMana: 55, currentStamina: 50 }); expect(regenerateHeroResources(instance({ currentMana: 99, currentStamina: 99 }))).toMatchObject({ currentMana: 100, currentStamina: 100 }); });
  it("pays and validates skill costs", () => { expect(canPaySkillCost(instance({ currentStamina: 30 }), HERO_SKILLS.warrior_power_strike!)).toBe(true); expect(paySkillCost(instance({ currentStamina: 30 }), HERO_SKILLS.warrior_power_strike!).currentStamina).toBe(0); expect(canPaySkillCost(instance({ currentStamina: 29 }), HERO_SKILLS.warrior_power_strike!)).toBe(false); });
  it("recovers resources but not HP between encounters by default", () => expect(recoverBetweenEncounters(instance({ currentHP: 25 }))).toMatchObject({ currentHP: 25, currentMana: 60, currentStamina: 60 }));
  it("supports authored between-wave healing without reviving fallen heroes", () => {
    expect(recoverBetweenEncounters(instance({ currentHP: 25 }), .15)).toMatchObject({ currentHP: 40, currentMana: 60, currentStamina: 60 });
    expect(recoverBetweenEncounters(instance({ currentHP: 0, isAlive: false }), .15)).toMatchObject({ currentHP: 0, isAlive: false });
  });
});
