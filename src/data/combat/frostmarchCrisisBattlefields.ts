import type { BattlefieldDefinition } from "./battlefields";
import type { TerrainPlacement, TerrainType } from "../../game/combat/grid/gridTypes";

const placements = (terrainType: TerrainType, positions: [number, number][]): TerrainPlacement[] =>
  positions.map(([x, y]) => ({ position: { x, y }, terrainType }));

export const FROSTMARCH_CRISIS_BATTLEFIELDS: Record<string, BattlefieldDefinition> = {
  fallen_aurora_road: {
    id: "fallen_aurora_road",
    name: "Road Beneath the Fallen Aurora",
    boardSizeId: "warfront",
    terrainPlacements: [
      ...placements("mountain", [[4, 0], [5, 0], [9, 0], [10, 0], [4, 10], [5, 10], [9, 10], [10, 10]]),
      ...placements("snow", [[2, 2], [2, 3], [2, 7], [2, 8], [5, 3], [5, 7], [9, 2], [9, 8], [12, 3], [12, 7]]),
      ...placements("cracked_ice", [[6, 4], [6, 5], [6, 6], [7, 3], [7, 7], [8, 4], [8, 5], [8, 6]]),
      ...placements("obstacle", [[7, 1], [7, 9]]),
    ],
    legend: {
      mountain: "Icebound ridge · impassable and blocks sight",
      snow: "Aurora-frost · movement cost 2",
      cracked_ice: "Glasswind ice · movement cost 2",
      obstacle: "Extinguished signal pylon · impassable",
    },
    combatModifiers: { heroInitiativeModifier: -1, heroMovementRangeModifier: -1 },
  },
  northwatch_signal_crown: {
    id: "northwatch_signal_crown",
    name: "Northwatch Signal Crown",
    boardSizeId: "warfront",
    terrainPlacements: [
      ...placements("mountain", [[5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10]]),
      ...placements("snow", [[3, 2], [3, 8], [5, 4], [5, 5], [5, 6], [9, 4], [9, 5], [9, 6], [11, 2], [11, 8]]),
      ...placements("cracked_ice", [[6, 3], [6, 7], [7, 2], [7, 8], [8, 3], [8, 7]]),
      ...placements("barricade", [[6, 5], [8, 5]]),
      ...placements("obstacle", [[7, 4], [7, 5], [7, 6]]),
    ],
    legend: {
      mountain: "Northwatch wall · impassable",
      snow: "Living aurora drift · movement cost 2",
      cracked_ice: "Resonant ice · movement cost 2",
      barricade: "Lit signal brazier · cover",
      obstacle: "Wardstone relay · silence the summons",
    },
    combatModifiers: { heroInitiativeModifier: -1 },
  },
};
