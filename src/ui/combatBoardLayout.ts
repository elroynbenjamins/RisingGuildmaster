import type { GridPosition } from "../game/combat/grid/gridTypes";

export interface MovementBoundaryEdges { top: boolean; right: boolean; bottom: boolean; left: boolean }
/** Marks only the outside edge of movement range; walls do not receive a misleading yellow border. */
export function getMovementBoundaryEdges(position: GridPosition, reachableKeys: ReadonlySet<string>, blockedKeys: ReadonlySet<string>, columns: number, rows: number): MovementBoundaryEdges {
  const exposed = (x: number, y: number) => x < 0 || y < 0 || x >= columns || y >= rows || (!blockedKeys.has(`${x},${y}`) && !reachableKeys.has(`${x},${y}`));
  return { top: exposed(position.x, position.y - 1), right: exposed(position.x + 1, position.y), bottom: exposed(position.x, position.y + 1), left: exposed(position.x - 1, position.y) };
}

/** Interior dots only, so the route does not obscure unit portraits. */
export function getMovementPathDots(path: readonly GridPosition[], columns: number, rows: number) {
  return path.slice(1).flatMap((end, index) => [0.25, 0.5, 0.75].map((fraction) => {
    const start = path[index]!;
    return {
      left: `${(start.x + 0.5 + (end.x - start.x) * fraction) * 100 / columns}%` as const,
      top: `${(start.y + 0.5 + (end.y - start.y) * fraction) * 100 / rows}%` as const,
    };
  }));
}

/** Position by logical coordinates, never by wrapping percentage-width children. */
export function getCombatTileLayout(position: GridPosition, columns: number, rows: number) {
  return {
    position: "absolute" as const,
    left: `${position.x * 100 / columns}%` as const,
    top: `${position.y * 100 / rows}%` as const,
    width: `${100 / columns}%` as const,
    height: `${100 / rows}%` as const,
  };
}
