import type { BattlefieldDefinition } from "./battlefields";
import type { TerrainPlacement, TerrainType } from "../../game/combat/grid/gridTypes";

const place = (terrainType: TerrainType, positions: [number, number][]): TerrainPlacement[] => positions.map(([x, y]) => ({ position: { x, y }, terrainType }));

/** Rain-slick roofs and alleys converge on the Bell of Measures. Trap tiles cost two movement. */
export const STONEGATE_ASSASSIN_BATTLEFIELDS: Record<string, BattlefieldDefinition> = {
  stonegate_midnight_chase: {
    id: "stonegate_midnight_chase",
    name: "Stonegate Midnight Chase",
    boardSizeId: "warfront",
    terrainPlacements: [
      ...place("cave_wall", [[4, 0], [5, 0], [6, 0], [8, 0], [9, 0], [10, 0], [4, 10], [5, 10], [6, 10], [8, 10], [9, 10], [10, 10]]),
      ...place("obstacle", [[5, 3], [5, 7], [9, 3], [9, 7], [12, 5]]),
      ...place("barricade", [[7, 2], [7, 8], [11, 4], [11, 6]]),
      ...place("shallow_water", [[2, 2], [2, 3], [2, 7], [2, 8], [6, 4], [6, 5], [6, 6], [10, 2], [10, 8]]),
      ...place("trap", [[3, 5], [6, 3], [6, 7], [8, 4], [8, 6], [10, 5], [13, 3], [13, 7]]),
    ],
    legend: { cave_wall: "Stonegate roofline - impassable and blocks sight", obstacle: "Chimney or bell housing - impassable", barricade: "Collapsed awning - impassable cover", shallow_water: "Rain-flooded gutter - movement cost 2", trap: "Gloam Knife tripwire and caltrops - movement cost 2" },
  },
};
