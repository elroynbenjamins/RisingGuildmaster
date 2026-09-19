import type { ImageSourcePropType } from "react-native";
import type { AtlasRect } from "../../components/icons/AtlasSprite";
import type { DungeonNodeType, DungeonThemeId } from "../../game/dungeons/dungeonTypes";
import { REGION_EMBLEM_RECTS, WORLD_MAP_ICON_ATLAS } from "../world/mapIconAtlas";

export const ROGUELITE_ICON_ATLAS: ImageSourcePropType = require("../../../assets/dungeons/roguelite/roguelite-icon-atlas.png");
export const ROGUELITE_ICON_ATLAS_SIZE = { width: 724, height: 543 } as const;

export type RogueliteThemeVisual = { source: ImageSourcePropType; atlasWidth: number; atlasHeight: number; rect: AtlasRect };

const localTheme = (rect: AtlasRect): RogueliteThemeVisual => ({ source: ROGUELITE_ICON_ATLAS, atlasWidth: 724, atlasHeight: 543, rect });
const worldTheme = (rect: AtlasRect): RogueliteThemeVisual => ({ source: WORLD_MAP_ICON_ATLAS, atlasWidth: 724, atlasHeight: 543, rect });

export const ROGUELITE_THEME_VISUALS: Record<DungeonThemeId, RogueliteThemeVisual> = {
  undead: localTheme({ x: 14, y: 18, width: 125, height: 175 }),
  wasteland: localTheme({ x: 139, y: 17, width: 127, height: 176 }),
  desert: localTheme({ x: 139, y: 17, width: 127, height: 176 }),
  forest: localTheme({ x: 266, y: 18, width: 127, height: 181 }),
  jungle: localTheme({ x: 266, y: 18, width: 127, height: 181 }),
  arctic: worldTheme(REGION_EMBLEM_RECTS.frostmarch!),
};

export type DungeonUtilityVisual = "entrance" | "camp" | "wardstone";
export const ROGUELITE_UTILITY_RECTS: Record<DungeonUtilityVisual, AtlasRect> = {
  entrance: { x: 396, y: 77, width: 105, height: 116 },
  camp: { x: 503, y: 64, width: 111, height: 131 },
  wardstone: { x: 616, y: 50, width: 101, height: 148 },
};

export const ROGUELITE_NODE_RECTS: Record<DungeonNodeType, AtlasRect> = {
  combat: { x: 5, y: 214, width: 69, height: 79 },
  elite: { x: 75, y: 202, width: 69, height: 93 },
  boss: { x: 148, y: 202, width: 75, height: 95 },
  merchant: { x: 222, y: 212, width: 63, height: 83 },
  rest: { x: 287, y: 213, width: 65, height: 82 },
  event: { x: 354, y: 220, width: 64, height: 75 },
  treasure: { x: 421, y: 224, width: 69, height: 70 },
};

export const ROGUELITE_EXTRA_NODE_RECTS = {
  shrine: { x: 493, y: 198, width: 66, height: 100 },
  trap: { x: 561, y: 237, width: 81, height: 65 },
  exit: { x: 645, y: 201, width: 70, height: 96 },
  key: { x: 37, y: 310, width: 67, height: 69 },
  locked_gate: { x: 110, y: 299, width: 76, height: 88 },
  revive: { x: 195, y: 299, width: 82, height: 86 },
  scout: { x: 282, y: 302, width: 81, height: 79 },
  gamble: { x: 370, y: 303, width: 93, height: 84 },
  reward: { x: 469, y: 306, width: 86, height: 81 },
  unavailable: { x: 588, y: 312, width: 69, height: 73 },
} as const satisfies Record<string, AtlasRect>;

export type RoguelitePathVisual = "straight" | "dotted" | "corner" | "vertical" | "t" | "cross" | "arrow" | "branch" | "double";
export const ROGUELITE_PATH_RECTS: Record<RoguelitePathVisual, AtlasRect> = {
  straight: { x: 16, y: 414, width: 74, height: 26 },
  dotted: { x: 95, y: 390, width: 88, height: 65 },
  corner: { x: 183, y: 388, width: 95, height: 68 },
  vertical: { x: 278, y: 388, width: 68, height: 68 },
  t: { x: 345, y: 388, width: 85, height: 68 },
  cross: { x: 430, y: 388, width: 83, height: 73 },
  arrow: { x: 513, y: 390, width: 75, height: 65 },
  branch: { x: 585, y: 388, width: 65, height: 73 },
  double: { x: 630, y: 388, width: 94, height: 68 },
};

export type RogueliteNodeState = "normal" | "available" | "current" | "selected" | "completed" | "unavailable" | "locked" | "boss";
export const ROGUELITE_STATE_RECTS: Record<RogueliteNodeState, AtlasRect> = {
  normal: { x: 22, y: 462, width: 67, height: 67 },
  available: { x: 22, y: 462, width: 67, height: 67 },
  current: { x: 106, y: 458, width: 75, height: 71 },
  selected: { x: 194, y: 452, width: 82, height: 84 },
  completed: { x: 288, y: 458, width: 100, height: 77 },
  unavailable: { x: 408, y: 462, width: 75, height: 69 },
  locked: { x: 507, y: 461, width: 78, height: 71 },
  boss: { x: 615, y: 453, width: 83, height: 82 },
};
