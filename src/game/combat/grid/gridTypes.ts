export const COMBAT_BOARD_SIZES = {
  skirmish: { id: "skirmish", name: "Skirmish", width: 7, height: 5 },
  battlefield: { id: "battlefield", name: "Battlefield", width: 9, height: 7 },
  grand_battlefield: { id: "grand_battlefield", name: "Grand Battlefield", width: 11, height: 9 },
  warfront: { id: "warfront", name: "Warfront", width: 15, height: 11 },
} as const;
export type CombatBoardSizeId = keyof typeof COMBAT_BOARD_SIZES;
export const COMBAT_BOARD = COMBAT_BOARD_SIZES.skirmish;
export interface GridPosition { x: number; y: number }
export type TerrainType = "normal" | "forest" | "mountain" | "shallow_water" | "snow" | "cracked_ice" | "sand" | "ash" | "cave_wall" | "barricade" | "web" | "egg_sac" | "caravan" | "escort_npc" | "obstacle" | "trap";
export interface TerrainPlacement { position: GridPosition; terrainType: TerrainType }
export interface CombatTile { position: GridPosition; terrainType: TerrainType; occupantId: string | null; movementCost: number; blocksMovement: boolean; blocksLineOfSight: boolean }
export interface CombatBoardState { sizeId: CombatBoardSizeId; environmentId: string; width: number; height: number; tiles: CombatTile[] }
export const positionKey = (position: GridPosition): string => `${position.x},${position.y}`;
export function isPositionInBounds(position: GridPosition, board: Pick<CombatBoardState, "width" | "height">): boolean { return position.x >= 0 && position.y >= 0 && position.x < board.width && position.y < board.height; }
export function getTile(board: CombatBoardState, position: GridPosition): CombatTile | undefined { return board.tiles.find((tile) => tile.position.x === position.x && tile.position.y === position.y); }
