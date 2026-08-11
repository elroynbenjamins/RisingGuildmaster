import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { InitiativeRoll } from "../../game/combat/combatTypes";
import { ActionButton, Panel, colors } from "../ui";

export function InitiativePreview({ rolls, labels, labelColors, sides, onBegin }: { rolls: readonly InitiativeRoll[]; labels: Record<string, string>; labelColors: Record<string, string>; sides: Record<string, "heroes" | "enemies">; onBegin(): void }) {
  return <View style={styles.wrap}>
    <Panel style={styles.intro}><Text style={styles.eyebrow}>INITIATIVE ROLL</Text><Text style={styles.title}>Who acts first?</Text><Text style={styles.explanation}>Each combatant rolls D20 + Initiative. Heroes use their Dexterity modifier. The order remains fixed for this encounter.</Text></Panel>
    <View style={styles.list}>{rolls.map((roll, index) => { const hero = sides[roll.combatantId] === "heroes"; return <View key={roll.combatantId} style={[styles.row, hero ? styles.heroRow : styles.enemyRow]}>
      <View style={[styles.position, hero ? styles.heroBadge : styles.enemyBadge]}><Text style={styles.positionText}>{index + 1}</Text></View>
      <View style={styles.identity}><Text numberOfLines={1} style={[styles.name, labelColors[roll.combatantId] ? { color: labelColors[roll.combatantId] } : undefined]}>{labels[roll.combatantId] ?? roll.combatantId}</Text><Text style={[styles.side, hero ? styles.heroText : styles.enemyText]}>{hero ? "GUILD HERO" : "ENEMY"}{index === 0 ? " · ACTS FIRST" : ""}</Text></View>
      <View style={styles.math}><Text style={styles.formula}>D20 {roll.d20} {roll.modifier >= 0 ? "+" : "−"} {Math.abs(roll.modifier)}</Text><Text style={styles.total}>{roll.total}</Text></View>
    </View>; })}</View>
    <ActionButton label="Begin Combat" onPress={onBegin} />
  </View>;
}

const styles = StyleSheet.create({ wrap: { gap: 12, marginTop: 16 }, intro: { borderColor: colors.gold, alignItems: "center" }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.8 }, title: { color: colors.text, fontSize: 24, fontWeight: "900", marginTop: 3 }, explanation: { color: colors.muted, lineHeight: 19, textAlign: "center", marginTop: 7 }, list: { gap: 7 }, row: { minHeight: 62, borderWidth: 1, borderRadius: 11, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, gap: 10 }, heroRow: { backgroundColor: "#192b3b", borderColor: "#416b8e" }, enemyRow: { backgroundColor: "#372224", borderColor: "#744549" }, position: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }, heroBadge: { backgroundColor: "#315b89" }, enemyBadge: { backgroundColor: "#7d3030" }, positionText: { color: "#fff", fontSize: 16, fontWeight: "900" }, identity: { flex: 1, minWidth: 0 }, name: { color: colors.text, fontSize: 16, fontWeight: "900" }, side: { fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 3 }, heroText: { color: "#86bdf4" }, enemyText: { color: "#f08a83" }, math: { alignItems: "flex-end" }, formula: { color: colors.muted, fontSize: 11 }, total: { color: colors.gold, fontSize: 22, fontWeight: "900", marginTop: 1 } });
