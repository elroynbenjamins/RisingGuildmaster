import { manhattanDistance } from "./distanceCalculator";
import { isPositionInBounds, type CombatBoardState, type GridPosition } from "./gridTypes";
export function getAreaPositions(center: GridPosition, radius: number, board: Pick<CombatBoardState, "width" | "height">): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let y = center.y - radius; y <= center.y + radius; y++) for (let x = center.x - radius; x <= center.x + radius; x++) { const position = { x, y }; if (isPositionInBounds(position, board) && manhattanDistance(center, position) <= radius) positions.push(position); }
  return positions;
}
