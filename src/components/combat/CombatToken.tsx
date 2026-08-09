import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function CombatToken({ label, side, selected = false, attackable = false }: { label: string; side: "heroes" | "enemies"; selected?: boolean; attackable?: boolean }) {
  return <View accessibilityLabel={`${side === "heroes" ? "Hero" : "Enemy"} ${label}`} style={[styles.token, side === "heroes" ? styles.hero : styles.enemy, selected && styles.selected, attackable && styles.attackable]}><Text style={styles.label}>{label.slice(0, 1).toUpperCase()}</Text></View>;
}
const styles = StyleSheet.create({ token: { width: 27, height: 27, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 }, hero: { backgroundColor: "#315b89", borderColor: "#86bdf4" }, enemy: { backgroundColor: "#7d3030", borderColor: "#f08a83" }, selected: { borderColor: "#f5cc68", borderWidth: 3 }, attackable: { borderStyle: "dashed", borderColor: "#fff" }, label: { color: "#fff", fontWeight: "900", fontSize: 12 } });
