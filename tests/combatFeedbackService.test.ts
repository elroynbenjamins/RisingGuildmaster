import { describe, expect, it } from "vitest";
import { getCombatHealthState, getCombatImpactSummary } from "../src/game/combat/combatFeedbackService";
import type { CombatUnit, CombatVisualEvent } from "../src/game/combat/combatTypes";

function unit(overrides: Partial<CombatUnit> = {}): CombatUnit {
  return {
    combatantId: "enemy",
    side: "enemies",
    currentHP: 75,
    maxHP: 100,
    stats: { physicalDamage: 1, physicalDefense: 1, magicDamage: 1, magicDefense: 1, speed: 1, initiativeBonus: 0, evasion: 0, criticalChance: 0, accuracy: 0, healingPower: 0, physicalAttackBonus: 0, magicAttackBonus: 0, armorClass: 10, magicDefenseScore: 10, attackRollModifier: 0, rangedAttackRollModifier: 0 },
    activeConditions: [], activeModifiers: [], isAlive: true, position: { x: 1, y: 1 }, movementRange: 3,
    ...overrides,
  };
}
function event(overrides: Partial<CombatVisualEvent> = {}): CombatVisualEvent {
  return { id: 1, kind: "skill", actionId: "strike", actorId: "hero", damageType: "physical", range: 1, effects: [{ targetId: "enemy", hit: true, critical: false, damage: 10, healing: 0, conditionIds: [] }], ...overrides };
}

describe("combat feedback", () => {
  it("classifies health bands", () => {
    expect(getCombatHealthState(100, 100)).toBe("healthy");
    expect(getCombatHealthState(60, 100)).toBe("wounded");
    expect(getCombatHealthState(30, 100)).toBe("critical");
    expect(getCombatHealthState(0, 100)).toBe("defeated");
  });

  it("promotes defeat and critical impacts over ordinary hits", () => {
    expect(getCombatImpactSummary(event(), [unit()]).kind).toBe("hit");
    expect(getCombatImpactSummary(event({ effects: [{ targetId: "enemy", hit: true, critical: false, damage: 30, healing: 0, conditionIds: [] }] }), [unit({ currentHP: 70 })]).kind).toBe("heavy");
    expect(getCombatImpactSummary(event({ effects: [{ targetId: "enemy", hit: true, critical: true, damage: 15, healing: 0, conditionIds: [] }] }), [unit()]).kind).toBe("critical");
    expect(getCombatImpactSummary(event({ effects: [{ targetId: "enemy", hit: true, critical: false, damage: 40, healing: 0, conditionIds: [] }] }), [unit({ currentHP: 0, isAlive: false })]).kind).toBe("defeat");
  });
});
