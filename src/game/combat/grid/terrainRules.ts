import type { CombatTile, TerrainType } from "./gridTypes";
export type TerrainRule = Pick<CombatTile, "movementCost" | "blocksMovement" | "blocksLineOfSight">;
export const TERRAIN_RULES: Record<TerrainType, TerrainRule> = {
  normal: { movementCost: 1, blocksMovement: false, blocksLineOfSight: false },
  forest: { movementCost: 2, blocksMovement: false, blocksLineOfSight: true },
  mountain: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
  shallow_water: { movementCost: 2, blocksMovement: false, blocksLineOfSight: false },
  snow: { movementCost: 2, blocksMovement: false, blocksLineOfSight: false },
  cracked_ice: { movementCost: 2, blocksMovement: false, blocksLineOfSight: false },
  sand: { movementCost: 2, blocksMovement: false, blocksLineOfSight: false },
  ash: { movementCost: 2, blocksMovement: false, blocksLineOfSight: true },
  cave_wall: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
  barricade: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
  web: { movementCost: 2, blocksMovement: false, blocksLineOfSight: false },
  egg_sac: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
  caravan: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
  escort_npc: { movementCost: 0, blocksMovement: true, blocksLineOfSight: false },
  obstacle: { movementCost: 0, blocksMovement: true, blocksLineOfSight: true },
};
