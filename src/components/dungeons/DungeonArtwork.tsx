import React from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import type { DungeonNodeType } from "../../game/dungeons/dungeonTypes";
import { useTheme } from "../../theme/theme";
import { GameIcon } from "../icons/GameIcon";
import type { GameIconId } from "../../data/ui/gameIcons";

export type DungeonArtworkVariant = "entrance" | "ossuary" | "boss" | "merchant" | "treasure" | "icons";
const PANELS: Record<DungeonArtworkVariant, { column: number; row: number }> = {
  entrance: { column: 0, row: 0 }, ossuary: { column: 1, row: 0 }, boss: { column: 2, row: 0 },
  merchant: { column: 0, row: 1 }, treasure: { column: 1, row: 1 }, icons: { column: 2, row: 1 },
};
const ATLAS = require("../../../assets/dungeons/wardstone-depths-atlas.png");

/** Displays one panel from the approved 3×2 pixel-art atlas without duplicating bitmap files. */
export function DungeonArtwork({ variant, compact = false }: { variant: DungeonArtworkVariant; compact?: boolean }) {
  const {colors}=useTheme();
  const { width } = useWindowDimensions(); const panelWidth = Math.max(240, width - 36); const panelHeight = compact ? Math.round(panelWidth * .44) : Math.round(panelWidth * .62); const panel = PANELS[variant];
  return <View accessibilityRole="image" accessibilityLabel={`${variant} dungeon artwork`} style={[styles.viewport,{backgroundColor:colors.background,borderColor:colors.gold,width:panelWidth,height:panelHeight}]}>
    <Image source={ATLAS} resizeMode="stretch" fadeDuration={0} style={{ position: "absolute", width: panelWidth * 3, height: panelWidth * 2, left: -panel.column * panelWidth, top: -panel.row * panelWidth }}/>
    <View pointerEvents="none" style={styles.shade}/>
  </View>;
}

/** Reuses the square icon atlas so route nodes cannot bleed into adjacent art. */
export function DungeonNodeArtworkIcon({ type, size = 34 }: { type: DungeonNodeType | "locked"; size?: number }) {
  const icons: Record<DungeonNodeType | "locked", GameIconId> = {event:"journal",combat:"weapon",elite:"boss",treasure:"loot",rest:"temple",merchant:"gold",boss:"boss",locked:"locked"};
  return <GameIcon id={icons[type]} size={size}/>;
}

const styles = StyleSheet.create({ viewport: { alignSelf: "center", overflow: "hidden", borderRadius: 12, borderWidth: 1, borderColor: "#8c6a36", backgroundColor: "#0c1112", marginVertical: 12 }, shade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderWidth: 2, borderColor: "rgba(216,173,92,.22)" }, iconViewport: { overflow: "hidden", backgroundColor: "#0b1011" } });
