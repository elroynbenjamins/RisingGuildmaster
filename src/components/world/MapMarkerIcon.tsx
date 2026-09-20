import React from "react";
import { View } from "react-native";
import type { RegionLocationType } from "../../game/world/worldTypes";
import { AtlasSprite } from "../icons/AtlasSprite";
import {
  LOCATION_ICON_RECTS,
  REGION_EMBLEM_RECTS,
  WORLD_MAP_ICON_ATLAS,
  WORLD_MAP_ICON_ATLAS_SIZE,
  WORLD_SERVICE_ICON_RECTS,
  WORLD_STATUS_ICON_RECTS,
  type WorldMapStatusIcon,
} from "../../data/world/mapIconAtlas";

type RegionStatus = "open" | "current" | "complete" | "boss" | "locked";

const THREAT_COLORS = ["transparent", "#c5a54d", "#e29a55", "#e06b50", "#d84545"] as const;

export function WorldStatusIcon({ id, size = 18 }: { id: WorldMapStatusIcon; size?: number }) {
  return <AtlasSprite source={WORLD_MAP_ICON_ATLAS} atlasWidth={WORLD_MAP_ICON_ATLAS_SIZE.width} atlasHeight={WORLD_MAP_ICON_ATLAS_SIZE.height} rect={WORLD_STATUS_ICON_RECTS[id]} size={size} />;
}

export function WorldServiceIcon({ serviceId, size = 18 }: { serviceId: string; size?: number }) {
  const id = serviceId === "temple" || serviceId === "healer"
    ? "temple"
    : ["market", "mine_exchange", "equipment_shop", "blacksmith", "enchanter", "inn"].includes(serviceId)
      ? "port"
      : "settlement";
  return <AtlasSprite source={WORLD_MAP_ICON_ATLAS} atlasWidth={WORLD_MAP_ICON_ATLAS_SIZE.width} atlasHeight={WORLD_MAP_ICON_ATLAS_SIZE.height} rect={WORLD_SERVICE_ICON_RECTS[id]} size={size} />;
}

export function RegionEmblem({ regionId, status = "open", size = 30, campaign = false, threat = 0 }: { regionId: string; status?: RegionStatus; size?: number; campaign?: boolean; threat?: number }) {
  const rect = REGION_EMBLEM_RECTS[regionId] ?? REGION_EMBLEM_RECTS.greenveil!;
  const statusId: WorldMapStatusIcon | null = status === "current" ? "current" : status === "complete" ? "complete" : status === "boss" ? "boss" : status === "locked" ? "locked" : null;
  const badgeSize = Math.max(11, Math.round(size * .42));
  const threatLevel = Math.max(0, Math.min(4, Math.floor(threat)));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", opacity: status === "locked" ? .55 : 1, borderColor: THREAT_COLORS[threatLevel], borderRadius: Math.max(5, size * .18), borderWidth: threatLevel ? Math.max(1, Math.round(size * .06)) : 0 }}>
      <AtlasSprite source={WORLD_MAP_ICON_ATLAS} atlasWidth={WORLD_MAP_ICON_ATLAS_SIZE.width} atlasHeight={WORLD_MAP_ICON_ATLAS_SIZE.height} rect={rect} size={size} />
      {campaign ? <View style={{ position: "absolute", right: -badgeSize * .35, top: -badgeSize * .35 }}><WorldStatusIcon id="campaign" size={badgeSize} /></View> : null}
      {statusId ? <View style={{ position: "absolute", right: -badgeSize * .25, bottom: -badgeSize * .25 }}><WorldStatusIcon id={statusId} size={badgeSize} /></View> : null}
    </View>
  );
}

export function LocationMarkerIcon({ type, size = 20, completed = false, campaign = false }: { type: RegionLocationType; size?: number; completed?: boolean; campaign?: boolean }) {
  const rect = LOCATION_ICON_RECTS[type] ?? LOCATION_ICON_RECTS.landmark;
  const badgeSize = Math.max(9, Math.round(size * .38));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <AtlasSprite source={WORLD_MAP_ICON_ATLAS} atlasWidth={WORLD_MAP_ICON_ATLAS_SIZE.width} atlasHeight={WORLD_MAP_ICON_ATLAS_SIZE.height} rect={rect} size={size} />
      {completed ? <View style={{ position: "absolute", right: -badgeSize * .35, top: -badgeSize * .35 }}><WorldStatusIcon id="complete" size={badgeSize} /></View> : campaign ? <View style={{ position: "absolute", right: -badgeSize * .35, top: -badgeSize * .35 }}><WorldStatusIcon id="campaign" size={badgeSize} /></View> : null}
    </View>
  );
}
