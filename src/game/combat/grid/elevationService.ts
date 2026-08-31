import type { CombatBoardState, GridPosition } from "./gridTypes";
import { getTile } from "./gridTypes";

/** Battle-Brothers-inspired high ground: ranged attacks gain +1 per level above, capped at +2; shooting uphill takes the inverse penalty. */
export function getElevationAttackRollModifier(board: CombatBoardState | undefined, attacker: GridPosition, target: GridPosition, range: number): number {
  if (!board || range <= 1) return 0;
  const difference = (getTile(board, attacker)?.elevation ?? 0) - (getTile(board, target)?.elevation ?? 0);
  return Math.max(-2, Math.min(2, difference));
}
