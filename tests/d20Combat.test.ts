import { describe, expect, it } from "vitest";
import { resolveAttackRoll, rollAttack } from "../src/game/combat/dice/attackRoll";
import { rollDie } from "../src/game/combat/dice/diceService";
import { calculateArmorClass, calculateEnemyMagicAttackBonus, calculateEnemyPhysicalAttackBonus, calculateMagicAttackBonus, calculateMagicDefenseScore, calculatePhysicalAttackBonus, calculateProficiencyBonus } from "../src/game/combat/tacticalStats";
import { sequenceRandom } from "./combatTestUtils";
import { combineD20RollModes } from "../src/game/combat/dice/d20RollMode";

const attributes = { strength: 16, dexterity: 12, constitution: 15, intelligence: 18, wisdom: 12, charisma: 10 };
describe("D20 combat", () => {
  it("rollDie produces the seeded minimum and maximum", () => { expect(rollDie(20, sequenceRandom([0]))).toBe(1); expect(rollDie(20, sequenceRandom([0.999999]))).toBe(20); });
  it("hits when 12 + 5 meets AC 16", () => expect(resolveAttackRoll(12, 5, 0, 16)).toMatchObject({ total: 17, hit: true, critical: false }));
  it("natural 1 always misses despite a huge bonus", () => expect(resolveAttackRoll(1, 50, 0, 10)).toMatchObject({ hit: false, criticalMiss: true, result: "critical_miss" }));
  it("natural 20 always critically hits despite impossible defense", () => expect(resolveAttackRoll(20, -50, 0, 100)).toMatchObject({ hit: true, critical: true, result: "critical" }));
  it("uses central seeded RNG for attack rolls", () => expect(rollAttack(sequenceRandom([.55]), 5, 0, 16).diceRoll).toBe(12));
  it("keeps the higher of two D20s with Advantage", () => expect(rollAttack(sequenceRandom([.15, .75]), 5, 0, 16, "advantage")).toMatchObject({ diceRolls: [4, 16], diceRoll: 16, rollMode: "advantage", hit: true }));
  it("keeps the lower of two D20s with Disadvantage", () => expect(rollAttack(sequenceRandom([.15, .75]), 5, 0, 16, "disadvantage")).toMatchObject({ diceRolls: [4, 16], diceRoll: 4, rollMode: "disadvantage", hit: false }));
  it("cancels Advantage and Disadvantage without stacking either", () => { expect(combineD20RollModes("advantage", "advantage")).toBe("advantage"); expect(combineD20RollModes("advantage", "disadvantage")).toBe("normal"); });
  it("calculates D&D-style attack and defense scores from attributes", () => { expect(calculatePhysicalAttackBonus(attributes, 3)).toBe(5); expect(calculateMagicAttackBonus(attributes, 3)).toBe(6); expect(calculateArmorClass(attributes, 3)).toBe(18); expect(calculateMagicDefenseScore(attributes, 2)).toBe(18); });
  it("uses the D&D proficiency progression instead of adding full level to attacks", () => { expect([1,4,5,8,9,12,13,16,17,20,30].map(calculateProficiencyBonus)).toEqual([2,2,3,3,4,4,5,5,6,6,6]); expect(calculateEnemyPhysicalAttackBonus(1)).toBe(4); expect(calculateEnemyPhysicalAttackBonus(17)).toBe(8); expect(calculateEnemyMagicAttackBonus(17)).toBe(7); });
});
