import type { CombatTile, TerrainType } from "./gridTypes";
export type TerrainRule = Pick<CombatTile, "movementCost" | "blocksMovement" | "blocksLineOfSight">;
export const TERRAIN_RULES: Record<TerrainType, TerrainRule> = {
  normal: { movementCost: 1, blocksMovement: false, blocksLineOfSight: false },
  forest: { movementCost: 2, blocksMovement: false, blocksLineOfSight: true },
  mountain: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
  shallow_water: { movementCost: 2, blocksMovement: false, blocksLineOfSight: false },
  cave_wall: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
  barricade: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
  obstacle: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
};
