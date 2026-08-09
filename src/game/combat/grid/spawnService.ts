import { setOccupant } from "./boardFactory";
import { getTile, type CombatBoardState, type GridPosition } from "./gridTypes";
export function spawnOccupants(board: CombatBoardState, spawns: readonly { occupantId: string; position: GridPosition }[]): CombatBoardState {
  let updated = board;
  for (const spawn of spawns) { const tile = getTile(updated, spawn.position); if (!tile || tile.blocksMovement || tile.occupantId) throw new Error(`Invalid spawn tile: ${spawn.position.x},${spawn.position.y}`); updated = setOccupant(updated, spawn.position, spawn.occupantId); }
  return updated;
}
