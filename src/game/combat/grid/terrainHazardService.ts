import type { CombatUnit } from "../combatTypes";
import { setTerrainType } from "./boardFactory";
import { getTile, type CombatBoardState, type GridPosition } from "./gridTypes";

export interface TerrainHazardResolution {
  board: CombatBoardState;
  unit: CombatUnit;
  triggeredPositions: GridPosition[];
  damage: number;
  travelledTiles: number;
}

export function resolveMovementTerrainHazards(
  board: CombatBoardState,
  unit: CombatUnit,
  traversedPath: readonly GridPosition[],
): TerrainHazardResolution {
  let nextBoard = board;
  let nextUnit = { ...unit };
  let damage = 0;
  const triggeredPositions: GridPosition[] = [];
  let travelledTiles = 0;

  for (const position of traversedPath.slice(1)) {
    if (!nextUnit.isAlive) break;
    const tile = getTile(nextBoard, position);
    if (tile?.terrainType !== "trap") {
      travelledTiles += 1;
      nextUnit = { ...nextUnit, position: { ...position } };
      continue;
    }

    const hit = Math.max(1, Math.round(nextUnit.maxHP * .08));
    const currentHP = Math.max(0, nextUnit.currentHP - hit);
    damage += hit;
    travelledTiles += 1;
    triggeredPositions.push({ ...position });
    nextUnit = { ...nextUnit, position: { ...position }, currentHP, isAlive: currentHP > 0 };
    nextBoard = setTerrainType(nextBoard, position, "normal");
  }

  return { board: nextBoard, unit: nextUnit, triggeredPositions, damage, travelledTiles };
}
