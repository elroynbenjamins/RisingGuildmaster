import { describe, expect, it } from "vitest";
import type { ActiveCompanion } from "../src/game/combat/combatTypes";
import { getCompanionPressureModifier } from "../src/game/combat/heroActionService";
import { combatUnit } from "./combatTestUtils";

const companion = (damageType: "physical" | "magic"): ActiveCompanion => ({
  id: damageType === "physical" ? "wolf_companion" : "bound_wisp",
  sourceSkillId: "summon",
  currentHP: 40,
  maxHP: 40,
  damagePerTurn: 20,
  damageType,
  armorClass: 12,
  movementRange: 5,
  remainingTurns: 4,
});

describe("companion combat pressure", () => {
  it("routes wolf pressure only through physical damage", () => {
    const actor = combatUnit("ranger"); actor.stats = { ...actor.stats, physicalDamage: 80, magicDamage: 50 };
    const modifier = getCompanionPressureModifier(companion("physical"), actor);
    expect(modifier).toMatchObject({ stat: "physicalDamage", operation: "percentage", value: .125 });
  });

  it("routes spirit pressure only through magic damage", () => {
    const actor = combatUnit("summoner"); actor.stats = { ...actor.stats, physicalDamage: 80, magicDamage: 50 };
    const modifier = getCompanionPressureModifier(companion("magic"), actor);
    expect(modifier).toMatchObject({ stat: "magicDamage", operation: "percentage", value: .2 });
  });

  it("caps companion pressure at twenty-five percent", () => {
    const actor = combatUnit("summoner"); actor.stats = { ...actor.stats, magicDamage: 10 };
    expect(getCompanionPressureModifier(companion("magic"), actor)?.value).toBe(.25);
  });
});
