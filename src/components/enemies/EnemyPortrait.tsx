import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { ENEMY_PORTRAITS, type EnemyPortraitAtlasId } from "../../data/enemies/enemyPortraits";

const ATLASES: Record<EnemyPortraitAtlasId, number> = {
  goblins: require("../../../assets/enemies/goblins.png"), undead: require("../../../assets/enemies/undead.png"), beastsA: require("../../../assets/enemies/beasts-a.png"), beastsB: require("../../../assets/enemies/beasts-b.png"), bandits: require("../../../assets/enemies/bandits.png"), orcs: require("../../../assets/enemies/orcs.png"), constructs: require("../../../assets/enemies/constructs.png"),
};

export function EnemyPortrait({ enemyId, size = 48, hidden = false }: { enemyId: string; size?: number; hidden?: boolean }) {
  const crop = ENEMY_PORTRAITS[enemyId];
  if (hidden || !crop) return <View style={[styles.frame, styles.unknown, { width: size, height: size }]}><Text style={[styles.question, { fontSize: size * .42 }]}>?</Text></View>;
  return <View accessibilityLabel={`${enemyId.replace(/_/g, " ")} portrait`} style={[styles.frame, { width: size, height: size }]}><Image source={ATLASES[crop.atlasId]} resizeMode="stretch" style={{ position: "absolute", width: size * 3, height: size * 2, left: -crop.column * size, top: -crop.row * size }} /></View>;
}

const styles = StyleSheet.create({ frame: { overflow: "hidden", borderWidth: 2, borderColor: "#b98a48", borderRadius: 6, backgroundColor: "#17130f" }, unknown: { alignItems: "center", justifyContent: "center", borderColor: "#69717d", backgroundColor: "#252b2d", borderStyle: "dashed" }, question: { color: "#aab1bb", fontWeight: "900" } });
