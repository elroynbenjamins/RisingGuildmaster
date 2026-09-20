import { describe, expect, it } from "vitest";
import { advanceCombat, createCombatState, moveCurrentHero, performHeroTurn } from "../src/game/combat/combatEngine";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";
import { createSeededRandom } from "../src/utils/random";
describe("tactical action economy", () => {
  it("allows Skill then Move without ending the hero turn", () => {
    const hero = { ...testHero(), classId: "ranger" as const, learnedSkillIds: ["ranger_precise_shot"] };
    let state = createCombatState("goblin_patrol", 0, [hero], createSeededRandom(77));
    state = { ...state, awaitingHeroId: hero.id, turnOrderIds: [hero.id], actions: { movementUsed: false, combatActionUsed: false } };
    const enemyId = state.enemies[1]!.instance.instanceId;
    state = performHeroTurn(state, "ranger_precise_shot", sequenceRandom([.999]), enemyId);
    expect(state.awaitingHeroId).toBe(hero.id); expect(state.actions).toMatchObject({ movementUsed: false, combatActionUsed: true });
    expect(state.lastVisualEvent).toMatchObject({actionId:"ranger_precise_shot",actorId:hero.id,damageType:"physical",range:6});
    expect(state.lastVisualEvent?.effects[0]).toMatchObject({targetId:enemyId,hit:true});
    state = moveCurrentHero(state, { x: 0, y: 0 }, sequenceRandom([.5]));
    expect(state.actions).toMatchObject({ movementUsed: true, combatActionUsed: true }); expect(state.heroes[0]?.unit.position).toEqual({ x: 0, y: 0 }); expect(() => moveCurrentHero(state, { x: 1, y: 0 }, sequenceRandom([.5]))).toThrow();
    expect(state.lastVisualEvent).toMatchObject({kind:"movement",actionId:"move",toPosition:{x:0,y:0}});
  });
  it("can pause and step one automatic enemy turn for readable combat pacing", () => {
    const heroA = testHero(); const heroB = { ...testHero(), id: "paced-hero-b", name: "Bryn" };
    let state = createCombatState("goblin_patrol", 0, [heroA, heroB], createSeededRandom(88));
    const enemyA = state.enemies[0]!.unit.combatantId; const enemyB = state.enemies[1]!.unit.combatantId;
    state = { ...state, combatStarted: true, awaitingHeroId: null, turnOrderIds: [enemyA, enemyB, heroA.id, heroB.id], turnCursor: 0 };
    const paused = advanceCombat(state, createSeededRandom(2), 0);
    expect(paused.turnCursor).toBe(0);
    expect(paused.awaitingHeroId).toBeNull();
    const stepped = advanceCombat(paused, createSeededRandom(2), 1);
    expect(stepped.turnCursor).toBe(1);
    expect(stepped.awaitingHeroId).toBeNull();
  });
});
