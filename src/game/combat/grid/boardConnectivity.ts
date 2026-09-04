import { orthogonalNeighbors } from "./distanceCalculator";
import { positionKey, type CombatBoardState } from "./gridTypes";
import { TERRAIN_RULES } from "./terrainRules";

/** Connect terrain, not occupants: units may temporarily block a narrow passage. */
export function ensureConnectedBattlefield(board: CombatBoardState): CombatBoardState {
  let result = board;
  const carveable = new Set(["cave_wall", "obstacle", "mountain", "barricade"]);
  for (;;) {
    const tiles = new Map(result.tiles.map(tile => [positionKey(tile.position), tile]));
    const start = result.tiles.find(tile => !tile.blocksMovement);
    if (!start) throw new Error(`Battlefield ${board.environmentId} has no walkable ground`);
    const connected = new Set<string>();
    const pending = [positionKey(start.position)];
    for (let i = 0; i < pending.length; i++) {
      const key = pending[i]!;
      if (connected.has(key)) continue;
      connected.add(key);
      for (const neighbor of orthogonalNeighbors(tiles.get(key)!.position)) {
        const next = positionKey(neighbor);
        if (tiles.has(next) && !tiles.get(next)!.blocksMovement && !connected.has(next)) pending.push(next);
      }
    }
    if (result.tiles.every(tile => tile.blocksMovement || connected.has(positionKey(tile.position)))) return result;

    // Minimum walls first, shortest corridor second. Never remove quest props.
    const costs = new Map([...connected].map(key => [key, 0]));
    const previous = new Map<string, string>();
    const open = new Set(connected);
    let destination: string | undefined;
    while (open.size) {
      const key = [...open].reduce((a, b) => costs.get(a)! <= costs.get(b)! ? a : b);
      open.delete(key);
      const tile = tiles.get(key)!;
      if (!tile.blocksMovement && !connected.has(key)) { destination = key; break; }
      for (const neighbor of orthogonalNeighbors(tile.position)) {
        const next = positionKey(neighbor);
        const candidate = tiles.get(next);
        if (!candidate || (candidate.blocksMovement && !carveable.has(candidate.terrainType))) continue;
        const cost = costs.get(key)! + 1 + (candidate.blocksMovement ? result.tiles.length + 1 : 0);
        if (cost >= (costs.get(next) ?? Infinity)) continue;
        costs.set(next, cost);
        previous.set(next, key);
        open.add(next);
      }
    }
    if (!destination) throw new Error(`Battlefield ${board.environmentId} is disconnected by protected quest props`);
    const corridor = new Set<string>();
    for (let key: string | undefined = destination; key && !connected.has(key); key = previous.get(key)) corridor.add(key);
    result = { ...result, tiles: result.tiles.map(tile => corridor.has(positionKey(tile.position)) && tile.blocksMovement
      ? { ...tile, terrainType: "normal", elevation: 0, ...TERRAIN_RULES.normal } : tile) };
  }
}
