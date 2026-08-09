import { describe, expect, it } from "vitest";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { calculateCriticalChance, calculateHitChance, calculateSkillDamage } from "../src/game/combat/damageCalculator";
import { combatUnit } from "./combatTestUtils";

describe("combat damage, accuracy, and criticals", () => {
  const attacker = combatUnit("attacker").stats;
  const defender = combatUnit("defender").stats;
  it("uses normal physical damage for a 1.00 basic attack", () => expect(calculateSkillDamage(attacker, defender, ENEMY_SKILLS.goblin_stab!)).toBe(53));
  it("matches the specified 1.20 physical example", () => expect(calculateSkillDamage(attacker, defender, { ...ENEMY_SKILLS.goblin_stab!, damageMultiplier: 1.20 })).toBe(64));
  it("supports magic defense and defense-ignoring true damage", () => {
    expect(calculateSkillDamage(attacker, defender, { id: "magic", name: "Magic", type: "active", damageType: "magic", damageMultiplier: 1 })).toBe(43);
    expect(calculateSkillDamage(attacker, defender, { id: "true", name: "True", type: "active", damageType: "true", damageMultiplier: 1 })).toBe(80);
  });
  it("clamps accuracy from 5% to 95%", () => { expect(calculateHitChance(ENEMY_SKILLS.quick_strike!, 0.15)).toBeCloseTo(0.85); expect(calculateHitChance(ENEMY_SKILLS.quick_strike!, -1)).toBe(0.95); expect(calculateHitChance(ENEMY_SKILLS.aimed_shot!, 2)).toBe(0.05); });
  it("adds skill critical chance and applies 1.5x critical damage", () => { expect(calculateCriticalChance(0.10, ENEMY_SKILLS.aimed_shot!)).toBe(0.20); expect(calculateSkillDamage(attacker, defender, ENEMY_SKILLS.goblin_stab!, true)).toBe(80); });
});
