import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { RegionLocationType } from "../../game/world/worldTypes";

type RegionStatus = "open" | "current" | "complete" | "boss" | "locked";

const REGION_ACCENTS: Record<string, string> = {
  greenveil: "#6fbf73",
  iron_hills: "#c08a5b",
  frostmarch: "#8ed8ee",
  ashlands: "#e07a55",
  shadowfen: "#8b79bb",
};

function PixelCanvas({ size, children }: { size: number; children: React.ReactNode }) {
  return <View style={[styles.canvasWrap, { width: size, height: size }]}><View style={[styles.canvas, { transform: [{ scale: size / 28 }] }]}>{children}</View></View>;
}

function RegionGlyph({ regionId, accent }: { regionId: string; accent: string }) {
  if (regionId === "greenveil") return <><View style={[styles.leaf, { backgroundColor: accent }]} /><View style={[styles.leafStem, { backgroundColor: accent }]} /></>;
  if (regionId === "iron_hills") return <><View style={[styles.mountainLarge, { borderBottomColor: accent }]} /><View style={[styles.mountainSmall, { borderBottomColor: accent }]} /></>;
  if (regionId === "frostmarch") return <><View style={[styles.snowBar, { backgroundColor: accent }]} /><View style={[styles.snowBar, { backgroundColor: accent, transform: [{ rotate: "60deg" }] }]} /><View style={[styles.snowBar, { backgroundColor: accent, transform: [{ rotate: "-60deg" }] }]} /></>;
  if (regionId === "ashlands") return <><View style={[styles.emberOuter, { borderColor: accent }]} /><View style={[styles.emberInner, { backgroundColor: accent }]} /></>;
  return <><View style={[styles.fenWater, { backgroundColor: accent, top: 7 }]} /><View style={[styles.fenWater, { backgroundColor: accent, top: 12, left: 5 }]} /><View style={[styles.fenWater, { backgroundColor: accent, top: 17, left: 8 }]} /><View style={[styles.reed, { backgroundColor: accent }]} /></>;
}

export function RegionEmblem({ regionId, status = "open", size = 28, campaign = false }: { regionId: string; status?: RegionStatus; size?: number; campaign?: boolean }) {
  const accent = status === "locked" ? "#6c7380" : REGION_ACCENTS[regionId] ?? "#d4ad62";
  return <View style={[styles.regionFrame, { width: size, height: size, borderColor: accent, opacity: status === "locked" ? .55 : 1 }]}>
    <PixelCanvas size={size - 4}><RegionGlyph regionId={regionId} accent={accent} /></PixelCanvas>
    {campaign ? <View style={[styles.campaignPip, { borderColor: accent }]} /> : null}
    {status === "boss" ? <Text style={styles.statusBadge}>!</Text> : status === "complete" ? <Text style={styles.completeBadge}>✓</Text> : status === "current" ? <View style={[styles.currentPip, { backgroundColor: accent }]} /> : null}
  </View>;
}

function LocationGlyph({ type, accent }: { type: RegionLocationType; accent: string }) {
  if (type === "city") return <><View style={[styles.cityWall, { backgroundColor: accent }]} /><View style={[styles.cityTowerLeft, { backgroundColor: accent }]} /><View style={[styles.cityTowerRight, { backgroundColor: accent }]} /><View style={styles.cityGate} /></>;
  if (type === "town") return <><View style={[styles.houseBody, { backgroundColor: accent }]} /><View style={[styles.houseRoof, { borderBottomColor: accent }]} /><View style={styles.houseDoor} /></>;
  if (type === "village") return <><View style={[styles.villageHouseA, { backgroundColor: accent }]} /><View style={[styles.villageHouseB, { backgroundColor: accent }]} /><View style={[styles.villageRoofA, { borderBottomColor: accent }]} /><View style={[styles.villageRoofB, { borderBottomColor: accent }]} /></>;
  if (type === "homeland") return <><View style={[styles.flagPole, { backgroundColor: accent }]} /><View style={[styles.flag, { backgroundColor: accent }]} /></>;
  if (type === "stronghold") return <><View style={[styles.fortWall, { backgroundColor: accent }]} /><View style={[styles.fortTowerLeft, { backgroundColor: accent }]} /><View style={[styles.fortTowerMid, { backgroundColor: accent }]} /><View style={[styles.fortTowerRight, { backgroundColor: accent }]} /><View style={styles.fortGate} /></>;
  if (type === "landmark") return <><View style={[styles.obelisk, { backgroundColor: accent }]} /><View style={[styles.obeliskTop, { borderBottomColor: accent }]} /><View style={[styles.obeliskBase, { backgroundColor: accent }]} /></>;
  if (type === "ruin") return <><View style={[styles.ruinColumnLeft, { backgroundColor: accent }]} /><View style={[styles.ruinColumnRight, { backgroundColor: accent }]} /><View style={[styles.ruinBeam, { backgroundColor: accent }]} /></>;
  return <><View style={[styles.caveOuter, { borderColor: accent }]} /><View style={styles.caveInner} /></>;
}

export function LocationMarkerIcon({ type, size = 18, completed = false, campaign = false }: { type: RegionLocationType; size?: number; completed?: boolean; campaign?: boolean }) {
  const accent = completed ? "#7bdc92" : campaign ? "#f0c46e" : "#d6b36d";
  return <View style={{ width: size, height: size }}>
    <PixelCanvas size={size}><LocationGlyph type={type} accent={accent} /></PixelCanvas>
    {completed ? <Text style={[styles.locationBadge, { fontSize: Math.max(7, size * .42) }]}>✓</Text> : campaign ? <View style={styles.locationCampaignPip} /> : null}
  </View>;
}

const styles = StyleSheet.create({
  canvasWrap: { alignItems: "center", justifyContent: "center", overflow: "visible" },
  canvas: { height: 24, position: "relative", width: 24 },
  regionFrame: { alignItems: "center", backgroundColor: "rgba(9,14,20,.86)", borderRadius: 6, borderWidth: 2, justifyContent: "center", position: "relative" },
  campaignPip: { backgroundColor: "#f3d78f", borderRadius: 4, borderWidth: 1, height: 7, position: "absolute", right: -4, top: -4, width: 7 },
  currentPip: { borderRadius: 4, bottom: 2, height: 5, position: "absolute", width: 5 },
  statusBadge: { backgroundColor: "#5b2020", borderRadius: 5, color: "#ffd0c8", fontSize: 9, fontWeight: "900", paddingHorizontal: 3, position: "absolute", right: -4, top: -5 },
  completeBadge: { backgroundColor: "#173d2b", borderRadius: 5, color: "#a9efbd", fontSize: 8, fontWeight: "900", paddingHorizontal: 2, position: "absolute", right: -4, top: -5 },

  leaf: { borderBottomLeftRadius: 6, borderTopRightRadius: 6, height: 13, left: 7, position: "absolute", top: 4, transform: [{ rotate: "-36deg" }], width: 10 },
  leafStem: { height: 9, left: 12, position: "absolute", top: 13, transform: [{ rotate: "24deg" }], width: 2 },
  mountainLarge: { borderBottomWidth: 13, borderLeftColor: "transparent", borderLeftWidth: 8, borderRightColor: "transparent", borderRightWidth: 8, bottom: 3, height: 0, left: 3, position: "absolute", width: 0 },
  mountainSmall: { borderBottomWidth: 9, borderLeftColor: "transparent", borderLeftWidth: 6, borderRightColor: "transparent", borderRightWidth: 6, bottom: 3, height: 0, position: "absolute", right: 1, width: 0 },
  snowBar: { height: 2, left: 3, position: "absolute", top: 11, width: 18 },
  emberOuter: { borderRadius: 2, borderWidth: 2, height: 13, left: 6, position: "absolute", top: 5, transform: [{ rotate: "45deg" }], width: 13 },
  emberInner: { height: 7, left: 9, position: "absolute", top: 8, transform: [{ rotate: "45deg" }], width: 7 },
  fenWater: { height: 2, left: 3, position: "absolute", width: 16 },
  reed: { height: 14, left: 17, position: "absolute", top: 3, transform: [{ rotate: "8deg" }], width: 2 },

  cityWall: { bottom: 4, height: 9, left: 4, position: "absolute", width: 16 },
  cityTowerLeft: { bottom: 4, height: 14, left: 3, position: "absolute", width: 5 },
  cityTowerRight: { bottom: 4, height: 14, position: "absolute", right: 3, width: 5 },
  cityGate: { backgroundColor: "#0b1118", bottom: 4, height: 6, left: 10, position: "absolute", width: 4 },
  houseBody: { bottom: 4, height: 9, left: 5, position: "absolute", width: 14 },
  houseRoof: { borderBottomWidth: 7, borderLeftColor: "transparent", borderLeftWidth: 8, borderRightColor: "transparent", borderRightWidth: 8, height: 0, left: 4, position: "absolute", top: 4, width: 0 },
  houseDoor: { backgroundColor: "#0b1118", bottom: 4, height: 5, left: 11, position: "absolute", width: 3 },
  villageHouseA: { bottom: 4, height: 7, left: 3, position: "absolute", width: 8 },
  villageHouseB: { bottom: 4, height: 9, position: "absolute", right: 2, width: 9 },
  villageRoofA: { borderBottomWidth: 5, borderLeftColor: "transparent", borderLeftWidth: 5, borderRightColor: "transparent", borderRightWidth: 5, height: 0, left: 2, position: "absolute", top: 7, width: 0 },
  villageRoofB: { borderBottomWidth: 6, borderLeftColor: "transparent", borderLeftWidth: 6, borderRightColor: "transparent", borderRightWidth: 6, height: 0, position: "absolute", right: 1, top: 4, width: 0 },
  flagPole: { height: 18, left: 6, position: "absolute", top: 3, width: 2 },
  flag: { height: 8, left: 8, position: "absolute", top: 4, width: 11 },
  fortWall: { bottom: 4, height: 8, left: 3, position: "absolute", width: 18 },
  fortTowerLeft: { bottom: 4, height: 15, left: 2, position: "absolute", width: 5 },
  fortTowerMid: { bottom: 4, height: 13, left: 10, position: "absolute", width: 5 },
  fortTowerRight: { bottom: 4, height: 15, position: "absolute", right: 2, width: 5 },
  fortGate: { backgroundColor: "#0b1118", bottom: 4, height: 5, left: 10, position: "absolute", width: 4 },
  obelisk: { height: 15, left: 10, position: "absolute", top: 5, width: 4 },
  obeliskTop: { borderBottomWidth: 5, borderLeftColor: "transparent", borderLeftWidth: 3, borderRightColor: "transparent", borderRightWidth: 3, height: 0, left: 9, position: "absolute", top: 1, width: 0 },
  obeliskBase: { bottom: 2, height: 3, left: 6, position: "absolute", width: 12 },
  ruinColumnLeft: { bottom: 4, height: 13, left: 4, position: "absolute", width: 4 },
  ruinColumnRight: { bottom: 4, height: 10, position: "absolute", right: 4, width: 4 },
  ruinBeam: { height: 3, left: 3, position: "absolute", top: 6, transform: [{ rotate: "-8deg" }], width: 14 },
  caveOuter: { borderTopLeftRadius: 9, borderTopRightRadius: 9, borderWidth: 3, bottom: 3, height: 17, left: 3, position: "absolute", width: 18 },
  caveInner: { backgroundColor: "#0a0d11", borderTopLeftRadius: 5, borderTopRightRadius: 5, bottom: 3, height: 10, left: 8, position: "absolute", width: 8 },
  locationBadge: { backgroundColor: "#123521", borderRadius: 4, color: "#b9f3c7", fontWeight: "900", position: "absolute", right: -4, top: -5 },
  locationCampaignPip: { backgroundColor: "#f0c46e", borderColor: "#5a451d", borderRadius: 3, borderWidth: 1, height: 6, position: "absolute", right: -3, top: -3, width: 6 },
});
