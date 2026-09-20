import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUESTS } from "../src/data/quests/quests";
import { interactWithBattlefieldObject, validateBattlefieldInteractives } from "../src/game/combat/battlefieldMechanicService";
import { createCombatState } from "../src/game/combat/combatEngine";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { ensureConnectedBattlefield } from "../src/game/combat/grid/boardConnectivity";
import { getTile } from "../src/game/combat/grid/gridTypes";
import { resolveMovementTerrainHazards } from "../src/game/combat/grid/terrainHazardService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";

function stateForEncounter(encounterId: string) {
  const quest = Object.values(QUESTS).find((entry) => entry.encounterIds.includes(encounterId));
  if (!quest) throw new Error(`No quest contains encounter ${encounterId}`);
  const encounterIndex = quest.encounterIds.indexOf(encounterId);
  const heroes = Array.from({ length: 4 }, (_, index) => ({ ...testHero(), id: `mechanic-hero-${index}`, name: `Mechanic ${index + 1}` }));
  return createCombatState(quest.id, encounterIndex, heroes, createSeededRandom(440 + encounterIndex));
}

describe("ordinary battlefield mechanics", () => {
  it("damages and disarms one-shot trap tiles for any moving unit", () => {
    const battlefield = BATTLEFIELDS.empty_banner_maze!;
    const board = ensureConnectedBattlefield(createCombatBoard([], battlefield.boardSizeId, battlefield.terrainPlacements, battlefield.id));
    const unit = { ...stateForEncounter("empty_banner_maze").heroes[0]!.unit, position: { x: 5, y: 5 }, currentHP: 100, maxHP: 100 };
    const result = resolveMovementTerrainHazards(board, unit, [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }]);
    expect(result.damage).toBe(8);
    expect(result.unit.currentHP).toBe(92);
    expect(result.unit.position).toEqual({ x: 7, y: 5 });
    expect(getTile(result.board, { x: 6, y: 5 })?.terrainType).toBe("normal");
    expect(result.triggeredPositions).toEqual([{ x: 6, y: 5 }]);
  });

  it("lets an adjacent hero detonate a powder keg that hurts nearby enemies and removes the barricade", () => {
    let state = stateForEncounter("cave_hideout_command_room");
    const hero = state.heroes[0]!;
    const bruteBefore = state.enemies.find((enemy) => enemy.unit.position.x === 9 && enemy.unit.position.y === 4)!;
    state = {
      ...state,
      awaitingHeroId: hero.hero.id,
      heroes: state.heroes.map((entry, index) => index === 0 ? { ...entry, unit: { ...entry.unit, position: { x: 7, y: 4 } }, instance: { ...entry.instance, position: { x: 7, y: 4 } } } : entry),
    };
    state = interactWithBattlefieldObject(state, { x: 8, y: 4 });
    expect(state.actions.combatActionUsed).toBe(true);
    expect(state.battlefieldInteractives.find((entry) => entry.id === "command-room-keg")?.used).toBe(true);
    expect(state.enemies.find((enemy) => enemy.unit.combatantId === bruteBefore.unit.combatantId)!.unit.currentHP).toBeLessThan(bruteBefore.unit.currentHP);
    expect(getTile(state.board, { x: 8, y: 4 })?.terrainType).toBe("normal");
  });

  it("opens optional shortcut tiles when a lever is pulled", () => {
    let state = stateForEncounter("flintwatch_lift_gallery");
    const hero = state.heroes[0]!;
    expect(getTile(state.board, { x: 6, y: 3 })?.blocksMovement).toBe(true);
    state = {
      ...state,
      awaitingHeroId: hero.hero.id,
      heroes: state.heroes.map((entry, index) => index === 0 ? { ...entry, unit: { ...entry.unit, position: { x: 4, y: 3 } }, instance: { ...entry.instance, position: { x: 4, y: 3 } } } : entry),
    };
    state = interactWithBattlefieldObject(state, { x: 4, y: 4 });
    expect(getTile(state.board, { x: 6, y: 3 })?.terrainType).toBe("normal");
    expect(getTile(state.board, { x: 6, y: 5 })?.blocksMovement).toBe(false);
    expect(state.battlefieldInteractives.find((entry) => entry.id === "liftworks-counterweight")?.used).toBe(true);
  });

  it("makes restoration shrines useful exactly once", () => {
    let state = stateForEncounter("mosswatch_vault_encounter");
    const hero = state.heroes[0]!;
    const woundedHp = Math.max(1, Math.floor(hero.unit.maxHP / 2));
    state = {
      ...state,
      awaitingHeroId: hero.hero.id,
      heroes: state.heroes.map((entry, index) => index === 0 ? { ...entry, unit: { ...entry.unit, position: { x: 2, y: 3 }, currentHP: woundedHp }, instance: { ...entry.instance, position: { x: 2, y: 3 }, currentHP: woundedHp } } : entry),
    };
    state = interactWithBattlefieldObject(state, { x: 2, y: 4 });
    expect(state.heroes[0]!.unit.currentHP).toBeGreaterThan(woundedHp);
    expect(state.battlefieldInteractives.find((entry) => entry.id === "mosswatch-font")?.used).toBe(true);
    expect(() => interactWithBattlefieldObject({ ...state, actions: { ...state.actions, combatActionUsed: false } }, { x: 2, y: 4 })).toThrow("No active battlefield object");
  });

  it("keeps every authored battlefield object in bounds and usable from a walkable tile", () => {
    for (const battlefield of Object.values(BATTLEFIELDS)) {
      const board = ensureConnectedBattlefield(createCombatBoard([], battlefield.boardSizeId, battlefield.terrainPlacements, battlefield.id));
      expect(() => validateBattlefieldInteractives(board, battlefield.interactives), battlefield.id).not.toThrow();
    }
  });
});
