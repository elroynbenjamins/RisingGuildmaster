import { describe, expect, it } from "vitest";
import { createCombatState, moveCurrentHero, performHeroTurn } from "../src/game/combat/combatEngine";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";
import { createSeededRandom } from "../src/utils/random";
describe("tactical action economy", () => {
  it("allows Skill then Move without ending the hero turn", () => {
    const hero = { ...testHero(), classId: "ranger" as const };
    let state = createCombatState("goblin_patrol", 0, [hero], createSeededRandom(77));
    state = { ...state, awaitingHeroId: hero.id, turnOrderIds: [hero.id], actions: { movementUsed: false, combatActionUsed: false } };
    const enemyId = state.enemies[1]!.instance.instanceId;
    state = performHeroTurn(state, "ranger_precise_shot", sequenceRandom([.999]), enemyId);
    expect(state.awaitingHeroId).toBe(hero.id); expect(state.actions).toMatchObject({ movementUsed: false, combatActionUsed: true });
    state = moveCurrentHero(state, { x: 0, y: 0 });
    expect(state.actions).toMatchObject({ movementUsed: true, combatActionUsed: true }); expect(state.heroes[0]?.unit.position).toEqual({ x: 0, y: 0 }); expect(() => moveCurrentHero(state, { x: 1, y: 0 })).toThrow();
  });
});
