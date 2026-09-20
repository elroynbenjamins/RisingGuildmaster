import { describe, expect, it } from "vitest";
import { COMBAT_CONDITIONS } from "../src/data/conditions/combatConditions";
import { applyCombatCondition, getConditionAttackRollMode, getConditionAttacksAgainstRollMode, getConditionStatPercentage, getEffectiveMovementRange, resolveStartOfTurnConditions } from "../src/game/combat/conditionResolver";
import { combatUnit } from "./combatTestUtils";

describe("D&D combat conditions", () => {
  it("provides the standard condition vocabulary", () => {
    const ids = ["blinded", "charmed", "deafened", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"];
    expect(ids.every((id) => COMBAT_CONDITIONS[id])).toBe(true);
  });

  it("grappled prevents movement without skipping the combat action", () => {
    const unit = { ...combatUnit("hero", "heroes"), activeConditions: applyCombatCondition([], "grappled", 2) };
    expect(getEffectiveMovementRange(unit)).toBe(0);
    expect(resolveStartOfTurnConditions(unit).skipTurn).toBe(false);
  });

  it("invisibility grants offensive Advantage and defensive Disadvantage", () => {
    const unit = { ...combatUnit("hero", "heroes"), activeConditions: applyCombatCondition([], "invisible", 2) };
    expect(getConditionAttackRollMode(unit)).toBe("advantage");
    expect(getConditionAttacksAgainstRollMode(unit)).toBe("disadvantage");
  });

  it("paralysis skips turns while petrification halves incoming damage", () => {
    const paralyzed = { ...combatUnit("hero", "heroes"), activeConditions: applyCombatCondition([], "paralyzed", 1) };
    const petrified = { ...combatUnit("stone", "heroes"), activeConditions: applyCombatCondition([], "petrified", 2) };
    expect(resolveStartOfTurnConditions(paralyzed).skipTurn).toBe(true);
    expect(getConditionStatPercentage(petrified, "damageReceived")).toBe(-.5);
  });
});
