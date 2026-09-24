import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/theme";
import { formatGameId } from "../../ui/textFormat";

export function TurnOrder({ ids, cursor, labels, labelColors, aliveIds, sides = {}, healthRatios = {} }: { ids: string[]; cursor: number; labels: Record<string, string>; labelColors: Record<string, string>; aliveIds: Set<string>; sides?: Readonly<Record<string, "heroes" | "enemies">>; healthRatios?: Readonly<Record<string, number>> }) {
  const { colors } = useTheme();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>{ids.map((id, index) => {
    const active = index === cursor;
    const alive = aliveIds.has(id);
    const side = sides[id];
    const ratio = Math.max(0, Math.min(1, healthRatios[id] ?? (alive ? 1 : 0)));
    const hpColor = ratio <= .3 ? colors.danger : ratio <= .6 ? colors.gold : colors.green;
    return <View key={`${id}-${index}`} style={[styles.unit, { backgroundColor: colors.panel, borderColor: active ? colors.gold : colors.border }, active && { backgroundColor: colors.panel2 }, !alive && styles.dead]}>
      <View style={[styles.sideRail, { backgroundColor: side === "enemies" ? colors.danger : colors.blue }]} />
      <View style={styles.orderLine}><Text style={[styles.number, { color: active ? colors.gold : colors.muted }]}>{active ? "▶" : String(index + 1).padStart(2, "0")}</Text><Text style={[styles.side, { color: side === "enemies" ? colors.danger : colors.blue }]}>{side === "enemies" ? "FOE" : "ALLY"}</Text></View>
      <Text numberOfLines={1} style={[styles.label, { color: labelColors[id] ?? colors.text }]}>{labels[id] ?? formatGameId(id)}</Text>
      <View style={[styles.hpTrack, { backgroundColor: colors.background }]}><View style={[styles.hpFill, { backgroundColor: hpColor, width: `${ratio * 100}%` }]} /></View>
      {!alive ? <Text style={[styles.down, { color: colors.danger }]}>DOWN</Text> : null}
    </View>;
  })}</ScrollView>;
}
const styles = StyleSheet.create({
  row: { gap: 5, paddingVertical: 8 },
  unit: { width: 91, paddingHorizontal: 8, paddingVertical: 7, borderWidth: 2, borderRadius: 9, overflow: "hidden" },
  sideRail: { bottom: 0, left: 0, position: "absolute", top: 0, width: 3 },
  dead: { opacity: .42 },
  orderLine: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  number: { fontSize: 9, fontWeight: "900" },
  side: { fontSize: 7, fontWeight: "900", letterSpacing: .7 },
  label: { fontSize: 10, fontWeight: "800", marginTop: 3 },
  hpTrack: { height: 3, marginTop: 5, overflow: "hidden" },
  hpFill: { height: "100%" },
  down: { fontSize: 7, fontWeight: "900", marginTop: 3 },
});
