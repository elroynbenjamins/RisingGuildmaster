import type { GridPosition } from "./gridTypes";
export function manhattanDistance(a: GridPosition, b: GridPosition): number { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
export function orthogonalNeighbors(position: GridPosition): GridPosition[] { return [{ x: position.x + 1, y: position.y }, { x: position.x - 1, y: position.y }, { x: position.x, y: position.y + 1 }, { x: position.x, y: position.y - 1 }]; }
