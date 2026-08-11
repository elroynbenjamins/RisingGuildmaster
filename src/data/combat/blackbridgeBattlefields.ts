import type { BattlefieldDefinition } from "./battlefields";
import type { TerrainPlacement, TerrainType } from "../../game/combat/grid/gridTypes";

const place = (terrainType: TerrainType, positions: [number, number][]): TerrainPlacement[] => positions.map(([x, y]) => ({ position: { x, y }, terrainType }));

export const BLACKBRIDGE_BATTLEFIELDS: Record<string, BattlefieldDefinition> = {
  blackbridge_ruins: { id: "blackbridge_ruins", name: "Ruins of Blackbridge", boardSizeId: "grand_battlefield", terrainPlacements: [...place("shallow_water", [[5, 0], [5, 1], [5, 2], [5, 6], [5, 7], [5, 8]]), ...place("obstacle", [[5, 3], [5, 5], [7, 1], [7, 7]]), ...place("forest", [[2, 0], [2, 8], [8, 0], [8, 8]])], legend: { shallow_water: "Blackriver shallows - movement cost 2", obstacle: "Collapsed bridge masonry - impassable", forest: "Riverbank thicket - cost 2 and blocks sight" } },
  laurel_storehouse: { id: "laurel_storehouse", name: "Hidden Laurel Storehouse", boardSizeId: "grand_battlefield", terrainPlacements: [...place("mountain", [[4, 0], [5, 0], [6, 0], [7, 0], [4, 8], [5, 8], [6, 8], [7, 8]]), ...place("barricade", [[5, 2], [5, 6], [7, 2], [7, 6]]), ...place("obstacle", [[7, 4]])], legend: { mountain: "Quarry wall - impassable", barricade: "Laurel shield wall - cover", obstacle: "Sealed heartstone crate - impassable" } },
  blackbridge_undercroft: { id: "blackbridge_undercroft", name: "Blackbridge Heartstone Undercroft", boardSizeId: "warfront", terrainPlacements: [...place("cave_wall", [[4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10]]), ...place("shallow_water", [[6, 3], [6, 4], [6, 5], [6, 6], [6, 7]]), ...place("obstacle", [[10, 3], [10, 7], [12, 4]])], legend: { cave_wall: "Undercroft wall - impassable", shallow_water: "Flooded foundation - movement cost 2", obstacle: "Fractured Wardstone brace - impassable" }, combatModifiers: { heroInitiativeModifier: -1 } },
};
