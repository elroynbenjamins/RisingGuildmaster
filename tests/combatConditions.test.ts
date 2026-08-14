import { describe, expect, it } from "vitest";
import { advanceCombatConditions, applyCombatCondition, blocksMagicSkills, getConditionFlatModifier, getConditionStatPercentage, getEffectiveMovementRange, resolveStartOfTurnConditions } from "../src/game/combat/conditionResolver";
import { combatUnit } from "./combatTestUtils";

describe("turn-based combat conditions", () => {
  it("deals three percent max HP poison damage with a minimum of one", () => {
    const poisoned = combatUnit("target", "heroes", { maxHP: 200, currentHP: 100, activeConditions: [{ conditionId: "poisoned", remainingTurns: 3 }] });
    expect(resolveStartOfTurnConditions(poisoned)).toMatchObject({ damage: 6, unit: { currentHP: 94 } });
    expect(resolveStartOfTurnConditions({ ...poisoned, maxHP: 10 }).damage).toBe(1);
  });
  it("stun skips a turn and expires after advancing", () => {
    const conditions = applyCombatCondition([], "stunned", 1);
    expect(resolveStartOfTurnConditions(combatUnit("target", "heroes", { activeConditions: conditions })).skipTurn).toBe(true);
    expect(advanceCombatConditions(conditions)).toEqual([]);
  });
  it("infection supplies a ten percent physical damage penalty", () => expect(getConditionStatPercentage(combatUnit("target", "heroes", { activeConditions: [{ conditionId: "infected", remainingTurns: 3 }] }), "physicalDamage")).toBe(-0.10));
  it("burning deals four percent max HP for two turns", () => { const burning = combatUnit("target", "heroes", { maxHP: 200, activeConditions: [{ conditionId: "burning", remainingTurns: 2 }] }); expect(resolveStartOfTurnConditions(burning).damage).toBe(8); expect(advanceCombatConditions(burning.activeConditions)).toEqual([{ conditionId: "burning", remainingTurns: 1 }]); });
  it("supports common control and debuff conditions", () => { const unit = combatUnit("target", "heroes", { movementRange: 4, activeConditions: [{ conditionId: "blinded", remainingTurns: 2 }, { conditionId: "frightened", remainingTurns: 2 }] }); expect(getConditionFlatModifier(unit, "attackRollModifier")).toBe(-6); expect(getConditionFlatModifier(unit, "armorClass")).toBe(-2); expect(getEffectiveMovementRange(unit)).toBe(3); });
  it("rooted overrides movement and silence blocks mana skills", () => { expect(getEffectiveMovementRange(combatUnit("rooted", "heroes", { movementRange: 5, activeConditions: [{ conditionId: "rooted", remainingTurns: 1 }] }))).toBe(0); expect(blocksMagicSkills(combatUnit("silent", "heroes", { activeConditions: [{ conditionId: "silenced", remainingTurns: 2 }] }))).toBe(true); });
  it("bleeding deals three percent max HP damage", () => expect(resolveStartOfTurnConditions(combatUnit("bleeding", "heroes", { maxHP: 200, activeConditions: [{ conditionId: "bleeding", remainingTurns: 3 }] })).damage).toBe(6));
});
