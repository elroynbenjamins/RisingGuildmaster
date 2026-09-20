import type { CombatState } from "./combatEngine";
import type { BattlefieldInteractiveDefinition, BattlefieldInteractiveState } from "./battlefieldMechanicTypes";
import { isEncounterObjectiveComplete } from "./combatObjectiveService";
import { setOccupant, setTerrainType } from "./grid/boardFactory";
import { manhattanDistance } from "./grid/distanceCalculator";
import { getTile, isPositionInBounds, positionKey, type CombatBoardState } from "./grid/gridTypes";
import { orthogonalNeighbors } from "./grid/distanceCalculator";

export function validateBattlefieldInteractives(board: CombatBoardState, definitions: readonly BattlefieldInteractiveDefinition[] = []): void {
  const ids = new Set<string>();
  for (const definition of definitions) {
    if (ids.has(definition.id)) throw new Error(`Duplicate battlefield interactive id: ${definition.id}`);
    ids.add(definition.id);
    if (!isPositionInBounds(definition.position, board)) throw new Error(`Battlefield object ${definition.id} is out of bounds`);
    const usableFrom = [definition.position, ...orthogonalNeighbors(definition.position)].some((position) => {
      const tile = getTile(board, position);
      return Boolean(tile && !tile.blocksMovement);
    });
    if (!usableFrom) throw new Error(`Battlefield object ${definition.id} has no usable adjacent tile`);
    for (const linked of definition.linkedPositions ?? []) {
      if (!isPositionInBounds(linked, board)) throw new Error(`Battlefield object ${definition.id} links out of bounds`);
    }
  }
}

export function initializeBattlefieldInteractives(definitions: readonly BattlefieldInteractiveDefinition[] = []): BattlefieldInteractiveState[] {
  return definitions.map((definition) => ({
    ...definition,
    currentIntegrity: Math.max(1, definition.integrity ?? 1),
    used: false,
  }));
}

function appendLog(state: CombatState, actionId: string, message: string): CombatState {
  return { ...state, log: [...state.log, { turn: state.turn, actorId: "battlefield", actionId, targetIds: [], message }] };
}

function clearTerrain(state: CombatState, positions: readonly { x: number; y: number }[]): CombatState {
  let board = state.board;
  for (const position of positions) board = setTerrainType(board, position, "normal");
  return { ...state, board };
}

function resolveOutcome(state: CombatState): CombatState {
  if (state.heroes.every((item) => !item.unit.isAlive)) return { ...state, status: "defeat", awaitingHeroId: null };
  const complete = isEncounterObjectiveComplete(
    state.objective,
    state.round,
    state.heroes.map((item) => ({ isAlive: item.unit.isAlive, position: item.unit.position })),
    state.enemies.map((item) => ({ isAlive: item.unit.isAlive, enemyDefinitionId: item.instance.enemyDefinitionId })),
  );
  return complete ? { ...state, status: "victory", awaitingHeroId: null } : state;
}

function explode(state: CombatState, interactive: BattlefieldInteractiveState): CombatState {
  const radius = Math.max(1, interactive.radius ?? 1);
  const ratio = Math.max(.01, interactive.damageMaxHpRatio ?? .12);
  const hitIds: string[] = [];
  let board = state.board;

  const heroes = state.heroes.map((hero) => {
    if (!hero.unit.isAlive || manhattanDistance(hero.unit.position, interactive.position) > radius) return hero;
    const damage = Math.max(1, Math.round(hero.unit.maxHP * ratio));
    const currentHP = Math.max(0, hero.unit.currentHP - damage);
    hitIds.push(hero.unit.combatantId);
    if (currentHP === 0) board = setOccupant(board, hero.unit.position, null);
    return {
      ...hero,
      unit: { ...hero.unit, currentHP, isAlive: currentHP > 0 },
      instance: { ...hero.instance, currentHP, isAlive: currentHP > 0 },
    };
  });

  const enemies = state.enemies.map((enemy) => {
    if (!enemy.unit.isAlive || manhattanDistance(enemy.unit.position, interactive.position) > radius) return enemy;
    const damage = Math.max(1, Math.round(enemy.unit.maxHP * ratio));
    const currentHP = Math.max(0, enemy.unit.currentHP - damage);
    hitIds.push(enemy.unit.combatantId);
    if (currentHP === 0) board = setOccupant(board, enemy.unit.position, null);
    return {
      ...enemy,
      unit: { ...enemy.unit, currentHP, isAlive: currentHP > 0 },
      instance: { ...enemy.instance, currentHP, isAlive: currentHP > 0 },
    };
  });

  let next: CombatState = {
    ...state,
    board,
    heroes,
    enemies,
    lastVisualEvent: {
      id: state.log.length + 1 + state.turn * 1000,
      kind: "phase",
      actionId: "battlefield_explosion",
      actorId: interactive.id,
      range: radius,
      effects: hitIds.map((targetId) => ({ targetId, hit: true, critical: false, damage: 0, healing: 0, conditionIds: [] })),
    },
  };
  next = clearTerrain(next, [interactive.position, ...(interactive.linkedPositions ?? [])]);
  return resolveOutcome(appendLog(next, "battlefield_explosion", `${interactive.name} explodes, blasting every unit within ${radius} tile${radius === 1 ? "" : "s"}.`));
}

export function interactWithBattlefieldObject(state: CombatState, position: { x: number; y: number }): CombatState {
  const actor = state.heroes.find((hero) => hero.hero.id === state.awaitingHeroId);
  if (!actor || state.actions.combatActionUsed) throw new Error("No battlefield interaction is available");
  const interactive = state.battlefieldInteractives.find((entry) => !entry.used && positionKey(entry.position) === positionKey(position));
  if (!interactive) throw new Error("No active battlefield object on this tile");
  if (manhattanDistance(actor.unit.position, interactive.position) > 1) throw new Error("Move adjacent to interact");

  const mark = (entry: BattlefieldInteractiveState): BattlefieldInteractiveState =>
    entry.id === interactive.id ? { ...entry, used: true, currentIntegrity: 0 } : entry;

  if (interactive.kind === "healing_shrine") {
    const heal = Math.max(1, Math.round(actor.unit.maxHP * (interactive.healMaxHpRatio ?? .25)));
    const currentHP = Math.min(actor.unit.maxHP, actor.unit.currentHP + heal);
    const next = {
      ...state,
      actions: { ...state.actions, combatActionUsed: true },
      battlefieldInteractives: state.battlefieldInteractives.map(mark),
      heroes: state.heroes.map((hero) => hero.hero.id === actor.hero.id
        ? { ...hero, unit: { ...hero.unit, currentHP }, instance: { ...hero.instance, currentHP } }
        : hero),
    };
    return appendLog(next, "healing_shrine", `${actor.hero.name} invokes ${interactive.name} and restores ${currentHP - actor.unit.currentHP} HP.`);
  }

  if (interactive.kind === "lever") {
    let next: CombatState = {
      ...state,
      actions: { ...state.actions, combatActionUsed: true },
      battlefieldInteractives: state.battlefieldInteractives.map(mark),
    };
    next = clearTerrain(next, interactive.linkedPositions ?? []);
    return appendLog(next, "battlefield_lever", `${actor.hero.name} activates ${interactive.name}; a battlefield shortcut opens.`);
  }

  const remaining = interactive.currentIntegrity - 1;
  if (remaining > 0) {
    return appendLog({
      ...state,
      actions: { ...state.actions, combatActionUsed: true },
      battlefieldInteractives: state.battlefieldInteractives.map((entry) => entry.id === interactive.id ? { ...entry, currentIntegrity: remaining } : entry),
    }, "battlefield_object", `${actor.hero.name} strikes ${interactive.name} · ${remaining}/${interactive.currentIntegrity} integrity remains.`);
  }

  const primed = {
    ...state,
    actions: { ...state.actions, combatActionUsed: true },
    battlefieldInteractives: state.battlefieldInteractives.map(mark),
  };
  return explode(primed, interactive);
}
