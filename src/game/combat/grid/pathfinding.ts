import { orthogonalNeighbors } from "./distanceCalculator";
import { getTile, isPositionInBounds, positionKey, type CombatBoardState, type GridPosition, type TerrainType } from "./gridTypes";

/** Dijkstra pathfinding returns the lowest movement-cost orthogonal path. */
export function findShortestPath(board: CombatBoardState, start: GridPosition, destination: GridPosition, maxMovement = Infinity, ignoredTerrainMovementCosts: readonly TerrainType[] = []): GridPosition[] | null {
  if (!isPositionInBounds(start, board) || !isPositionInBounds(destination, board)) return null;
  const destinationTile = getTile(board, destination); if (!destinationTile || destinationTile.blocksMovement || destinationTile.occupantId) return null;
  const queue: { position: GridPosition; path: GridPosition[]; cost: number }[] = [{ position: start, path: [start], cost: 0 }]; const bestCost = new Map([[positionKey(start), 0]]);
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost); const current = queue.shift()!;
    if (current.position.x === destination.x && current.position.y === destination.y) return current.path;
    for (const neighbor of orthogonalNeighbors(current.position)) {
      if (!isPositionInBounds(neighbor, board)) continue; const tile = getTile(board, neighbor); if (!tile || tile.blocksMovement || tile.occupantId) continue;
      const cost = current.cost + (ignoredTerrainMovementCosts.includes(tile.terrainType) ? 1 : tile.movementCost); const key = positionKey(neighbor); if (cost > maxMovement || cost >= (bestCost.get(key) ?? Infinity)) continue;
      bestCost.set(key, cost); queue.push({ position: neighbor, path: [...current.path, neighbor], cost });
    }
  }
  return null;
}
export function calculatePathCost(board: CombatBoardState, path: readonly GridPosition[]): number { return path.slice(1).reduce((sum, position) => sum + (getTile(board, position)?.movementCost ?? Infinity), 0); }
export function getReachablePositions(board: CombatBoardState, start: GridPosition, movementRange: number, ignoredTerrainMovementCosts: readonly TerrainType[] = []): GridPosition[] { return board.tiles.filter((tile) => !tile.blocksMovement && !tile.occupantId && findShortestPath(board, start, tile.position, movementRange, ignoredTerrainMovementCosts)).map((tile) => tile.position); }
