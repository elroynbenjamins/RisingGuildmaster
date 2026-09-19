import React from "react";
import { View } from "react-native";
import { AtlasSprite } from "../icons/AtlasSprite";
import {
  ROGUELITE_ICON_ATLAS,
  ROGUELITE_ICON_ATLAS_SIZE,
  ROGUELITE_NODE_RECTS,
  ROGUELITE_PATH_RECTS,
  ROGUELITE_STATE_RECTS,
  ROGUELITE_THEME_VISUALS,
  ROGUELITE_UTILITY_RECTS,
  type DungeonUtilityVisual,
  type RogueliteNodeState,
  type RoguelitePathVisual,
} from "../../data/dungeons/dungeonIconAtlas";
import type { DungeonNodeType, DungeonThemeId } from "../../game/dungeons/dungeonTypes";

export function DungeonThemeIcon({ themeId, size = 52 }: { themeId: DungeonThemeId; size?: number }) {
  const visual = ROGUELITE_THEME_VISUALS[themeId];
  return <AtlasSprite source={visual.source} atlasWidth={visual.atlasWidth} atlasHeight={visual.atlasHeight} rect={visual.rect} size={size} />;
}

export function DungeonUtilityIcon({ kind, size = 92 }: { kind: DungeonUtilityVisual; size?: number }) {
  return <AtlasSprite source={ROGUELITE_ICON_ATLAS} atlasWidth={ROGUELITE_ICON_ATLAS_SIZE.width} atlasHeight={ROGUELITE_ICON_ATLAS_SIZE.height} rect={ROGUELITE_UTILITY_RECTS[kind]} size={size} />;
}

export function DungeonPathIcon({ kind, size = 34 }: { kind: RoguelitePathVisual; size?: number }) {
  return <AtlasSprite source={ROGUELITE_ICON_ATLAS} atlasWidth={ROGUELITE_ICON_ATLAS_SIZE.width} atlasHeight={ROGUELITE_ICON_ATLAS_SIZE.height} rect={ROGUELITE_PATH_RECTS[kind]} size={size} />;
}

export function DungeonNodeIcon({ type, size = 34, state }: { type: DungeonNodeType; size?: number; state?: RogueliteNodeState }) {
  if (!state) return <AtlasSprite source={ROGUELITE_ICON_ATLAS} atlasWidth={ROGUELITE_ICON_ATLAS_SIZE.width} atlasHeight={ROGUELITE_ICON_ATLAS_SIZE.height} rect={ROGUELITE_NODE_RECTS[type]} size={size} />;
  return <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
    <AtlasSprite source={ROGUELITE_ICON_ATLAS} atlasWidth={ROGUELITE_ICON_ATLAS_SIZE.width} atlasHeight={ROGUELITE_ICON_ATLAS_SIZE.height} rect={ROGUELITE_STATE_RECTS[state]} size={size} />
    <View style={{ position: "absolute" }}>
      <AtlasSprite source={ROGUELITE_ICON_ATLAS} atlasWidth={ROGUELITE_ICON_ATLAS_SIZE.width} atlasHeight={ROGUELITE_ICON_ATLAS_SIZE.height} rect={ROGUELITE_NODE_RECTS[type]} size={Math.round(size * .62)} />
    </View>
  </View>;
}
