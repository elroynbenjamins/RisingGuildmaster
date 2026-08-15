import { describe, expect, it } from "vitest";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { resolveOpportunityMovement } from "../src/game/combat/opportunityAttackService";
import { combatUnit, sequenceRandom } from "./combatTestUtils";
import { createCombatState, moveCurrentHero } from "../src/game/combat/combatEngine";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { spawnOccupants } from "../src/game/combat/grid/spawnService";

describe("reactions and opportunity attacks", () => {
  const sword = HERO_SKILLS.warrior_sword_strike!;

  it("triggers immediately before a unit leaves melee reach", () => {
    const mover = combatUnit("enemy", "enemies", { position: { x: 2, y: 1 } });
    const reactor = combatUnit("warrior", "heroes", { position: { x: 1, y: 1 } });
    const result = resolveOpportunityMovement(mover, [{ unit: reactor, skill: sword }], [{ x: 2, y: 1 }, { x: 3, y: 1 }], [], sequenceRandom([.75]));
    expect(result.events).toHaveLength(1);
    expect(result.spentReactionIds).toContain("warrior");
    expect(result.mover.currentHP).toBeLessThan(100);
    expect(result.finalPosition).toEqual({ x: 3, y: 1 });
  });

  it("does not trigger while moving within the same melee reach", () => {
    const mover = combatUnit("enemy", "enemies", { position: { x: 2, y: 1 } });
    const reactor = combatUnit("warrior", "heroes", { position: { x: 1, y: 1 } });
    const result = resolveOpportunityMovement(mover, [{ unit: reactor, skill: sword }], [{ x: 2, y: 1 }, { x: 1, y: 2 }], [], sequenceRandom([.75]));
    expect(result.events).toHaveLength(0);
  });

  it("allows only one reaction per round and blocks ranged basic attacks", () => {
    const mover = combatUnit("enemy", "enemies", { position: { x: 2, y: 1 } });
    const warrior = combatUnit("warrior", "heroes", { position: { x: 1, y: 1 } });
    const ranger = combatUnit("ranger", "heroes", { position: { x: 2, y: 0 } });
    const result = resolveOpportunityMovement(mover, [{ unit: warrior, skill: sword }, { unit: ranger, skill: HERO_SKILLS.ranger_bow_shot! }], [{ x: 2, y: 1 }, { x: 3, y: 1 }], ["warrior"], sequenceRandom([.75]));
    expect(result.events).toHaveLength(0);
  });

  it("prevents stunned units from reacting", () => {
    const mover = combatUnit("enemy", "enemies", { position: { x: 2, y: 1 } });
    const reactor = combatUnit("warrior", "heroes", { position: { x: 1, y: 1 }, activeConditions: [{ conditionId: "stunned", remainingTurns: 1 }] });
    const result = resolveOpportunityMovement(mover, [{ unit: reactor, skill: sword }], [{ x: 2, y: 1 }, { x: 3, y: 1 }], [], sequenceRandom([.75]));
    expect(result.events).toHaveLength(0);
  });

  it("integrates enemy reactions into player movement, state, and combat logs", () => {
    const hero = { ...testHero(), classId: "warrior" as const };
    let state = createCombatState("goblin_patrol", 0, [hero], createSeededRandom(91));
    const heroPosition = { x: 1, y: 1 };
    const enemyPositions = [{ x: 2, y: 1 }, { x: 5, y: 0 }, { x: 5, y: 2 }];
    const heroes = state.heroes.map((item) => ({ ...item, instance: { ...item.instance, position: heroPosition }, unit: { ...item.unit, position: heroPosition } }));
    const enemies = state.enemies.map((item, index) => ({ ...item, instance: { ...item.instance, position: enemyPositions[index]! }, unit: { ...item.unit, position: enemyPositions[index]! } }));
    const board = spawnOccupants(createCombatBoard([], "skirmish"), [...heroes.map((item) => ({ occupantId: item.unit.combatantId, position: item.unit.position })), ...enemies.map((item) => ({ occupantId: item.unit.combatantId, position: item.unit.position }))]);
    state = { ...state, heroes, enemies, board, awaitingHeroId: hero.id, actions: { movementUsed: false, combatActionUsed: false } };
    const startingHP = state.heroes[0]!.unit.currentHP;
    state = moveCurrentHero(state, { x: 0, y: 1 }, sequenceRandom([.999]));
    expect(state.heroes[0]!.unit.currentHP).toBeLessThan(startingHP);
    expect(state.spentReactionIds).toContain(state.enemies[0]!.unit.combatantId);
    expect(state.log.some((entry) => entry.message.includes("REACTION · Opportunity Attack"))).toBe(true);
  });
});
