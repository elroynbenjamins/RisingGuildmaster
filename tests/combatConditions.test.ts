import { describe, expect, it } from "vitest";
import { advanceCombatConditions, applyCombatCondition, getConditionStatPercentage, resolveStartOfTurnConditions } from "../src/game/combat/conditionResolver";
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
});
