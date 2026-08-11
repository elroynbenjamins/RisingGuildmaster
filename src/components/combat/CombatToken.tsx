import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EnemyPortrait } from "../enemies/EnemyPortrait";

export function CombatToken({ label, side, enemyDefinitionId, selected = false, attackable = false, size = 27 }: { label: string; side: "heroes" | "enemies"; enemyDefinitionId?: string; selected?: boolean; attackable?: boolean; size?: number }) {
  const shortLabel = label.split(/\s+/).map((word) => word[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return <View accessibilityLabel={`${side === "heroes" ? "Hero" : "Enemy"} ${label}`} style={[styles.token, { width: size, height: size, borderRadius: size / 2 }, side === "heroes" ? styles.hero : styles.enemy, selected && styles.selected, attackable && styles.attackable]}>{side === "enemies" && enemyDefinitionId ? <EnemyPortrait enemyId={enemyDefinitionId} size={size - 4} /> : <Text style={[styles.label, { fontSize: Math.max(8, Math.floor(size * .44)) }]}>{shortLabel}</Text>}</View>;
}
const styles = StyleSheet.create({ token: { alignItems: "center", justifyContent: "center", borderWidth: 2 }, hero: { backgroundColor: "#315b89", borderColor: "#86bdf4" }, enemy: { backgroundColor: "#7d3030", borderColor: "#f08a83" }, selected: { borderColor: "#f5cc68", borderWidth: 3 }, attackable: { borderStyle: "dashed", borderColor: "#fff" }, label: { color: "#fff", fontWeight: "900" } });
