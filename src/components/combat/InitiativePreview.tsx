import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { InitiativeRoll } from "../../game/combat/combatTypes";
import { ActionButton, Panel, colors } from "../ui";
import { useTheme } from "../../theme/theme";

export function InitiativePreview({ rolls, labels, labelColors, sides, onBegin }: { rolls: readonly InitiativeRoll[]; labels: Record<string, string>; labelColors: Record<string, string>; sides: Record<string, "heroes" | "enemies">; onBegin(): void }) {
  const {colors:themeColors}=useTheme();
  return <View style={styles.wrap}>
    <Panel style={[styles.intro,{borderColor:themeColors.gold}]}><Text style={[styles.eyebrow,{color:themeColors.gold}]}>INITIATIVE ROLL</Text><Text style={[styles.title,{color:themeColors.text}]}>Who acts first?</Text><Text style={[styles.explanation,{color:themeColors.muted}]}>Each combatant rolls D20 + Initiative. Heroes use their Dexterity modifier. The order remains fixed for this encounter.</Text></Panel>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>{rolls.map((roll, index) => { const hero = sides[roll.combatantId] === "heroes"; return <View key={roll.combatantId} style={[styles.row, hero ? styles.heroRow : styles.enemyRow]}>
      <View style={[styles.position, hero ? styles.heroBadge : styles.enemyBadge]}><Text style={styles.positionText}>{index + 1}</Text></View>
      <View style={styles.identity}><Text numberOfLines={1} style={[styles.name, labelColors[roll.combatantId] ? { color: labelColors[roll.combatantId] } : undefined]}>{labels[roll.combatantId] ?? roll.combatantId}</Text><Text style={[styles.side, hero ? styles.heroText : styles.enemyText]}>{hero ? "GUILD HERO" : "ENEMY"}{index === 0 ? " · ACTS FIRST" : ""}</Text></View>
      <View style={styles.math}><Text style={[styles.formula,{color:themeColors.muted}]}>D20 {roll.d20} {roll.modifier >= 0 ? "+" : "−"} {Math.abs(roll.modifier)}</Text><Text style={[styles.total,{color:themeColors.gold}]}>{roll.total}</Text></View>
    </View>; })}</ScrollView>
    <ActionButton label="Begin Combat" onPress={onBegin} />
  </View>;
}

const styles = StyleSheet.create({ wrap: { gap: 12, marginTop: 16 }, intro: { borderColor: colors.gold, alignItems: "center" }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.8 }, title: { color: colors.text, fontSize: 24, fontWeight: "900", marginTop: 3 }, explanation: { color: colors.muted, lineHeight: 19, textAlign: "center", marginTop: 7 }, list: { gap: 7, paddingBottom: 2, paddingRight: 12 }, row: { minHeight: 112, width: 126, borderWidth: 1, borderRadius: 11, alignItems: "flex-start", padding: 9, gap: 6 }, heroRow: { backgroundColor: "#192b3b", borderColor: "#416b8e" }, enemyRow: { backgroundColor: "#372224", borderColor: "#744549" }, position: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" }, heroBadge: { backgroundColor: "#315b89" }, enemyBadge: { backgroundColor: "#7d3030" }, positionText: { color: "#fff", fontSize: 13, fontWeight: "900" }, identity: { minWidth: 0, width: "100%" }, name: { color: colors.text, fontSize: 12, fontWeight: "900" }, side: { fontSize: 7, fontWeight: "900", letterSpacing: .7, marginTop: 2 }, heroText: { color: "#86bdf4" }, enemyText: { color: "#f08a83" }, math: { alignItems: "flex-start", marginTop: "auto" }, formula: { color: colors.muted, fontSize: 9 }, total: { color: colors.gold, fontSize: 20, fontWeight: "900", marginTop: 1 } });
