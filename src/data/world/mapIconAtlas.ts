import type { ImageSourcePropType } from "react-native";
import type { RegionLocationType } from "../../game/world/worldTypes";
import type { AtlasRect } from "../../components/icons/AtlasSprite";

export const WORLD_MAP_ICON_ATLAS: ImageSourcePropType = require("../../../assets/world/icons/world-map-icon-atlas.png");
export const WORLD_MAP_ICON_ATLAS_SIZE = { width: 724, height: 543 } as const;

export const REGION_EMBLEM_RECTS: Record<string, AtlasRect> = {
  greenveil: { x: 15, y: 10, width: 137, height: 149 },
  iron_hills: { x: 155, y: 5, width: 133, height: 159 },
  frostmarch: { x: 294, y: 8, width: 133, height: 157 },
  ashlands: { x: 434, y: 8, width: 131, height: 156 },
  shadowfen: { x: 571, y: 12, width: 136, height: 150 },
};

export type WorldMapStatusIcon = "current" | "campaign" | "complete" | "locked" | "boss" | "guild";
export const WORLD_STATUS_ICON_RECTS: Record<WorldMapStatusIcon, AtlasRect> = {
  current: { x: 30, y: 160, width: 71, height: 113 },
  campaign: { x: 145, y: 160, width: 72, height: 113 },
  complete: { x: 263, y: 160, width: 76, height: 113 },
  locked: { x: 384, y: 163, width: 74, height: 102 },
  boss: { x: 500, y: 159, width: 73, height: 115 },
  guild: { x: 620, y: 160, width: 73, height: 114 },
};

export const LOCATION_ICON_RECTS: Record<RegionLocationType, AtlasRect> = {
  city: { x: 8, y: 278, width: 114, height: 118 },
  town: { x: 125, y: 280, width: 118, height: 116 },
  village: { x: 248, y: 288, width: 115, height: 108 },
  homeland: { x: 365, y: 274, width: 107, height: 120 },
  stronghold: { x: 476, y: 277, width: 121, height: 119 },
  ruin: { x: 601, y: 284, width: 115, height: 111 },
  landmark: { x: 9, y: 401, width: 121, height: 130 },
  dungeon: { x: 137, y: 404, width: 132, height: 129 },
};

export const WORLD_SERVICE_ICON_RECTS = {
  temple: { x: 274, y: 401, width: 132, height: 130 },
  port: { x: 414, y: 403, width: 150, height: 131 },
  settlement: { x: 572, y: 403, width: 142, height: 129 },
} as const satisfies Record<string, AtlasRect>;
