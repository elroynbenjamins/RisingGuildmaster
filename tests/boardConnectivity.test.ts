import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { ensureConnectedBattlefield } from "../src/game/combat/grid/boardConnectivity";
import { findShortestPath } from "../src/game/combat/grid/pathfinding";
import { orthogonalNeighbors } from "../src/game/combat/grid/distanceCalculator";
import { positionKey } from "../src/game/combat/grid/gridTypes";

describe("battlefield connectivity", () => {
  it("opens the authored cave passage to the spiders", () => {
    const field = BATTLEFIELDS.cave_tunnels!;
    const board = createCombatBoard([], field.boardSizeId, field.terrainPlacements, field.id);
    expect(findShortestPath(board, { x: 3, y: 3 }, { x: 7, y: 3 })).not.toBeNull();
    expect(ensureConnectedBattlefield(board)).toBe(board);
  });
  it("repairs a solid barrier without mutating the source", () => {
    for (const vertical of [true, false]) {
      const board = createCombatBoard(Array.from({ length: vertical ? 5 : 7 }, (_, i) => vertical ? { x: 3, y: i } : { x: i, y: 2 }));
      const snapshot = JSON.stringify(board);
      const fixed = ensureConnectedBattlefield(board);
      expect(board.tiles.filter(t => t.blocksMovement).length - fixed.tiles.filter(t => t.blocksMovement).length).toBe(1);
      expect(JSON.stringify(board)).toBe(snapshot);
      expect(ensureConnectedBattlefield(fixed)).toBe(fixed);
    }
  });
  it("connects every encounter floor and preserves quest props", () => {
    for (const encounter of Object.values(QUEST_ENCOUNTERS)) {
      const field = BATTLEFIELDS[encounter.battlefieldId]!;
      const board = createCombatBoard(encounter.obstaclePositions, field.boardSizeId, field.terrainPlacements, field.id);
      const fixed = ensureConnectedBattlefield(board);
      const walkable = new Map(fixed.tiles.filter(t => !t.blocksMovement).map(t => [positionKey(t.position), t.position]));
      const queue = [walkable.values().next().value!];
      const reached = new Set([positionKey(queue[0]!)]);
      for (let i = 0; i < queue.length; i++) for (const neighbor of orthogonalNeighbors(queue[i]!)) {
        const key = positionKey(neighbor);
        if (walkable.has(key) && !reached.has(key)) { reached.add(key); queue.push(neighbor); }
      }
      expect(reached.size, field.id).toBe(walkable.size);
      board.tiles.forEach((tile, index) => {
        if (["caravan", "escort_npc", "egg_sac"].includes(tile.terrainType)) expect(fixed.tiles[index]).toEqual(tile);
      });
    }
  });
});
