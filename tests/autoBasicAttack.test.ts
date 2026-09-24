import { describe, expect, it } from "vitest";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { getAutoBasicAttackTargets } from "../src/game/combat/heroActionService";
import { testHero } from "./testHero";
import { combatUnit } from "./combatTestUtils";

describe("auto basic attack targeting", () => {
  it("returns only enemies in range of the hero's basic attack", () => {
    const hero = testHero();
    const instance = createHeroCombatInstance(hero);
    const actor = { ...createHeroCombatUnit(hero, instance), position: { x: 1, y: 1 } };
    const adjacent = combatUnit("enemy-adjacent", "enemies", { position: { x: 2, y: 1 } });
    const distant = combatUnit("enemy-distant", "enemies", { position: { x: 6, y: 5 } });
    const board = createCombatBoard();

    const result = getAutoBasicAttackTargets(hero, instance, actor, [actor], [adjacent, distant], board);

    expect(result?.skill.type).toBe("basic_attack");
    expect(result?.targets.map((target) => target.combatantId)).toEqual(["enemy-adjacent"]);
  });
});
