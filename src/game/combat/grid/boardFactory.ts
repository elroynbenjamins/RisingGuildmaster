import { COMBAT_BOARD, COMBAT_BOARD_SIZES, positionKey, type CombatBoardSizeId, type CombatBoardState, type GridPosition, type TerrainPlacement, type TerrainType } from "./gridTypes";
import { TERRAIN_RULES } from "./terrainRules";
export function createCombatBoard(obstacles: readonly GridPosition[] = [], sizeId: CombatBoardSizeId = "skirmish", terrainPlacements: readonly TerrainPlacement[] = [], environmentId = "open_field"): CombatBoardState {
  const size = COMBAT_BOARD_SIZES[sizeId] ?? COMBAT_BOARD; const terrain = new Map<string, TerrainType>(terrainPlacements.map((placement) => [positionKey(placement.position), placement.terrainType]));
  for (const position of obstacles) terrain.set(positionKey(position), "obstacle");
  const tiles = [];
  for (let y = 0; y < size.height; y++) for (let x = 0; x < size.width; x++) { const position = { x, y }; const terrainType = terrain.get(positionKey(position)) ?? "normal"; tiles.push({ position, terrainType, occupantId: null, ...TERRAIN_RULES[terrainType] }); }
  return { sizeId, environmentId, width: size.width, height: size.height, tiles };
}
export function setOccupant(board: CombatBoardState, position: GridPosition, occupantId: string | null): CombatBoardState { return { ...board, tiles: board.tiles.map((tile) => tile.position.x === position.x && tile.position.y === position.y ? { ...tile, occupantId } : tile) }; }
