import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { GAME_ICON_COORDINATES, type GameIconId } from "../../data/ui/gameIcons";
import { colors } from "../ui";

const ATLAS = require("../../../assets/ui/game-icons-atlas-v1.png");
export function GameIcon({ id, size = 42, framed = true }: { id: GameIconId; size?: number; framed?: boolean }) {
  const coordinate = GAME_ICON_COORDINATES[id];
  return <View accessibilityLabel={`${id.replace(/_/g, " ")} icon`} style={[styles.crop, { width: size, height: size, borderRadius: framed ? Math.max(4, size * .13) : 0 }, framed && styles.frame]}><Image fadeDuration={0} resizeMode="stretch" source={ATLAS} style={{ position: "absolute", width: size * 6, height: size * 6, left: -coordinate.column * size, top: -coordinate.row * size }} /></View>;
}
const styles = StyleSheet.create({ crop: { backgroundColor: "#09111b", overflow: "hidden" }, frame: { borderColor: colors.gold, borderWidth: 1 } });
