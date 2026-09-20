import { describe, expect, it } from "vitest";
import { createCombatState } from "../src/game/combat/combatEngine";
import { resolveBossPhaseTransitions } from "../src/game/bosses/bossCombatMechanicService";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { createSeededRandom } from "../src/utils/random";

const heroes = (count: number, seed = 1800) => {
  const random = createSeededRandom(seed);
  return Array.from({ length: count }, (_, index) => ({ ...generateHero(random), id: `boss-test-${seed}-${index}` }));
};

const setBossHp = (state: ReturnType<typeof createCombatState>, enemyDefinitionId: string, ratio: number) => ({
  ...state,
  enemies: state.enemies.map((enemy) => enemy.instance.enemyDefinitionId !== enemyDefinitionId ? enemy : {
    ...enemy,
    unit: { ...enemy.unit, currentHP: enemy.unit.maxHP * ratio },
    instance: { ...enemy.instance, currentHP: enemy.instance.maxHP * ratio },
  }),
});

describe("standard boss combat mechanics", () => {
  it("summons a reinforcement exactly once when the Chieftain crosses his first threshold", () => {
    const random = createSeededRandom(91);
    let state = createCombatState("goblin_chieftain_boss", 1, heroes(4), random);
    const scoutsBefore = state.enemies.filter((enemy) => enemy.instance.enemyDefinitionId === "goblin_scout").length;
    state = resolveBossPhaseTransitions(setBossHp(state, "goblin_chieftain", .50));
    expect(state.enemies.filter((enemy) => enemy.instance.enemyDefinitionId === "goblin_scout")).toHaveLength(scoutsBefore + 1);
    expect(state.enemies.find((enemy) => enemy.instance.enemyDefinitionId === "goblin_chieftain")?.instance.triggeredPhaseIds).toContain("chieftain_rallies_last_scouts");
    const countAfter = state.enemies.length;
    state = resolveBossPhaseTransitions(state);
    expect(state.enemies).toHaveLength(countAfter);
  });

  it("applies short party pressure without turning a four-hero boss into a raid objective fight", () => {
    const random = createSeededRandom(92);
    let state = createCombatState("ghorak_chainbreaker_boss", 1, heroes(4, 1810), random);
    state = resolveBossPhaseTransitions(setBossHp(state, "ghorak_chainbreaker", .45));
    expect(state.heroes.every((hero) => hero.unit.activeModifiers.some((modifier) => modifier.sourceSkillId === "boss_phase:ghorak_breaks_chain" && modifier.stat === "attackRollModifier"))).toBe(true);
    expect(state.raidMechanic).toBeNull();
  });

  it("never layers standard boss phases on top of bespoke raid mechanics", () => {
    const random = createSeededRandom(93);
    let state = createCombatState("raid_broodheart_awakening", 1, heroes(8, 1820), random);
    const enemyCount = state.enemies.length;
    state = resolveBossPhaseTransitions(setBossHp(state, "spider_queen", .40));
    expect(state.enemies).toHaveLength(enemyCount);
    expect(state.enemies.find((enemy) => enemy.instance.enemyDefinitionId === "spider_queen")?.instance.triggeredPhaseIds ?? []).toEqual([]);
  });
});
