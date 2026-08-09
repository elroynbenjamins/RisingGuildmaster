import { getTile, type CombatBoardState, type GridPosition } from "./gridTypes";
export function hasLineOfSight(start: GridPosition, end: GridPosition, board: CombatBoardState): boolean {
  let x = start.x; let y = start.y; const dx = Math.abs(end.x - start.x); const dy = Math.abs(end.y - start.y); const sx = start.x < end.x ? 1 : -1; const sy = start.y < end.y ? 1 : -1; let error = dx - dy;
  while (!(x === end.x && y === end.y)) {
    const doubled = error * 2; if (doubled > -dy) { error -= dy; x += sx; } if (doubled < dx) { error += dx; y += sy; }
    if (x === end.x && y === end.y) return true;
    if (getTile(board, { x, y })?.blocksLineOfSight) return false;
  }
  return true;
}
