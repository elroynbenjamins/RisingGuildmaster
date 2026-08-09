import type { ClassDefinition } from "../../../data/classes/classes";
import type { RaceDefinition } from "../../../data/races/races";
import { setOccupant } from "./boardFactory";
import { findShortestPath } from "./pathfinding";
import type { CombatBoardState, GridPosition } from "./gridTypes";
const clamp = (value: number): number => Math.min(5, Math.max(2, value));
export function calculateMovementRange(speed: number, classDefinition?: ClassDefinition, raceDefinition?: RaceDefinition): number { return clamp(3 + Math.floor(speed / 30) + (classDefinition?.tactical.movementRangeModifier ?? 0) + (raceDefinition?.tactical.movementRangeModifier ?? 0)); }
export function moveOccupant(board: CombatBoardState, occupantId: string, from: GridPosition, destination: GridPosition, movementRange: number): { board: CombatBoardState; path: GridPosition[] } {
  const path = findShortestPath(board, from, destination, movementRange); if (!path) throw new Error("Destination is not reachable");
  return { board: setOccupant(setOccupant(board, from, null), destination, occupantId), path };
}
