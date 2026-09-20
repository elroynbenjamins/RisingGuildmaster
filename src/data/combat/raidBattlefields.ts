import type { BattlefieldDefinition } from "./battlefields";
import type { TerrainPlacement, TerrainType } from "../../game/combat/grid/gridTypes";

const place = (terrainType: TerrainType, points: [number, number][], elevation = 0): TerrainPlacement[] => points.map(([x, y]) => ({ position: { x, y }, terrainType, elevation }));

/** Large arenas retain tactical lanes and safe regrouping space instead of becoming empty oversized grids. */
export const RAID_BATTLEFIELDS: Record<string, BattlefieldDefinition> = {
  raid_broodheart_cavern: {
    id: "raid_broodheart_cavern", name: "Broodheart Cathedral", boardSizeId: "raid_field",
    terrainPlacements: [
      ...place("cave_wall", [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[11,0],[12,0],[13,0],[14,0],[15,0],[16,0],[0,12],[1,12],[2,12],[3,12],[4,12],[5,12],[11,12],[12,12],[13,12],[14,12],[15,12],[16,12],[8,2],[8,10]]),
      ...place("web", [[4,3],[4,4],[4,8],[4,9],[7,5],[7,7],[9,5],[9,7],[12,3],[12,4],[12,8],[12,9]]),
      ...place("egg_sac", [[6,2],[6,10],[10,2],[10,10],[8,6]]),
      ...place("normal", [[13,4],[13,5],[13,7],[13,8]], 2),
    ],
    legend: { cave_wall: "Cathedral rock · impassable", web: "Brood web · movement cost 2", egg_sac: "Raid egg cluster · blocks movement and sight", normal: "Queen's hunting dais ▲2" },
  },
  raid_white_maw_caldera: {
    id: "raid_white_maw_caldera", name: "White Maw Caldera", boardSizeId: "raid_field",
    terrainPlacements: [
      ...place("mountain", [[0,0],[1,0],[2,0],[14,0],[15,0],[16,0],[0,12],[1,12],[2,12],[14,12],[15,12],[16,12],[8,0],[8,12],[5,3],[5,9],[11,3],[11,9]]),
      ...place("snow", [[3,2],[3,3],[3,9],[3,10],[6,5],[6,6],[6,7],[10,5],[10,6],[10,7],[13,2],[13,3],[13,9],[13,10]]),
      ...place("cracked_ice", [[7,4],[8,4],[9,4],[7,8],[8,8],[9,8],[8,5],[8,7]]),
      ...place("normal", [[12,5],[12,6],[12,7]], 2),
    ],
    legend: { mountain: "Glacier wall · impassable", snow: "Waist-deep snow · movement cost 2", cracked_ice: "Fracturing ice · movement cost 2", normal: "Wind-cut shelf ▲2" },
    combatModifiers: { heroInitiativeModifier: -1 },
  },
  raid_drowned_chartroom: {
    id: "raid_drowned_chartroom", name: "The Impossible Chartroom", boardSizeId: "raid_arena",
    terrainPlacements: [
      ...place("cave_wall", [[0,0],[1,0],[2,0],[3,0],[15,0],[16,0],[17,0],[18,0],[0,14],[1,14],[2,14],[3,14],[15,14],[16,14],[17,14],[18,14],[9,0],[9,14]]),
      ...place("shallow_water", [[5,3],[5,4],[5,5],[5,9],[5,10],[5,11],[9,5],[9,6],[9,8],[9,9],[13,3],[13,4],[13,5],[13,9],[13,10],[13,11]]),
      ...place("obstacle", [[7,4],[7,10],[11,4],[11,10],[9,7]]),
      ...place("normal", [[15,5],[15,6],[15,7],[15,8],[15,9]], 2),
    ],
    legend: { cave_wall: "Sunken archive wall · impassable", shallow_water: "Living chartwater · movement cost 2", obstacle: "Anchored map obelisk · blocks sight", normal: "Chartmaker's tribunal ▲2" },
  },
};
