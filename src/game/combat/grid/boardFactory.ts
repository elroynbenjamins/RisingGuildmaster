import type { TerrainType } from "./gridTypes";
import { COMBAT_BOARD, COMBAT_BOARD_SIZES, positionKey, type CombatBoardSizeId, type CombatBoardState, type GridPosition, type TerrainPlacement } from "./gridTypes";
import { TERRAIN_RULES } from "./terrainRules";
import { getGroundTheme, getGroundVariant } from "./ambientGround";
export function createCombatBoard(obstacles: readonly GridPosition[] = [], sizeId: CombatBoardSizeId = "skirmish", terrainPlacements: readonly TerrainPlacement[] = [], environmentId = "open_field"): CombatBoardState {
  const size = COMBAT_BOARD_SIZES[sizeId] ?? COMBAT_BOARD; const terrain = new Map(terrainPlacements.map((placement) => [positionKey(placement.position), placement]));
  const groundTheme = getGroundTheme(environmentId);
  for (const position of obstacles) terrain.set(positionKey(position), { position, terrainType: "obstacle" as const });
  const tiles = [];
  for (let y = 0; y < size.height; y++) for (let x = 0; x < size.width; x++) { const position = { x, y }; const placement = terrain.get(positionKey(position)); const terrainType = placement?.terrainType ?? "normal"; tiles.push({ position, terrainType, elevation: placement?.elevation ?? 0, occupantId: null, groundTheme, groundVariant: getGroundVariant(environmentId, position), ...TERRAIN_RULES[terrainType] }); }
  return { sizeId, environmentId, width: size.width, height: size.height, tiles };
}
export function setOccupant(board: CombatBoardState, position: GridPosition, occupantId: string | null): CombatBoardState { return { ...board, tiles: board.tiles.map((tile) => tile.position.x === position.x && tile.position.y === position.y ? { ...tile, occupantId } : tile) }; }
export function setTerrainType(board: CombatBoardState, position: GridPosition, terrainType: TerrainType, elevation = 0): CombatBoardState {
  return { ...board, tiles: board.tiles.map((tile) => tile.position.x === position.x && tile.position.y === position.y ? { ...tile, terrainType, elevation, ...TERRAIN_RULES[terrainType] } : tile) };
}
