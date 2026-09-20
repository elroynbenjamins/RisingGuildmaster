import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COMBAT_CONDITIONS } from "../../data/conditions/combatConditions";
import type { CombatUnit } from "../../game/combat/combatTypes";
import { getCombatHealthState } from "../../game/combat/combatFeedbackService";
import { useTheme } from "../../theme/theme";
import { Panel } from "../ui";
import { formatGameId } from "../../ui/textFormat";

export function CombatInspectionPanel({ name, unit }: { name: string; unit: CombatUnit }) {
  const { colors } = useTheme();
  const physicalProtection = unit.stats.armorClass + unit.stats.physicalDefense / 10;
  const magicProtection = unit.stats.magicDefenseScore + unit.stats.magicDefense / 10;
  const advice = Math.abs(physicalProtection - magicProtection) < 1 ? "No clear defensive weakness" : physicalProtection < magicProtection ? "WEAKNESS · Physical pressure" : "WEAKNESS · Magic pressure";
  const healthState = getCombatHealthState(unit.currentHP, unit.maxHP);
  const hpRatio = Math.max(0, Math.min(1, unit.currentHP / Math.max(1, unit.maxHP)));
  const hpColor = healthState === "critical" ? colors.danger : healthState === "wounded" ? colors.gold : colors.green;
  return <Panel style={[styles.panel, { borderColor: healthState === "critical" ? colors.danger : colors.border }]}>
    <View style={styles.heading}><View style={{ flex: 1 }}><Text style={[styles.name, { color: colors.text }]}>{name}</Text><Text style={[styles.side, { color: unit.side === "enemies" ? colors.danger : colors.blue }]}>{unit.side === "enemies" ? "HOSTILE" : "ALLY"}</Text></View>{healthState === "critical" ? <Text style={[styles.danger, { color: colors.danger }]}>! CRITICAL</Text> : null}</View>
    <View style={[styles.hpTrack, { backgroundColor: colors.background }]}><View style={[styles.hpFill, { backgroundColor: hpColor, width: `${hpRatio * 100}%` }]} /></View>
    <Text style={[styles.hp, { color: hpColor }]}>HP {Math.round(unit.currentHP)} / {Math.round(unit.maxHP)}</Text>
    <View style={styles.rows}><Text style={styles.physical}>PHYSICAL · ATK {Math.round(unit.stats.physicalDamage)} · DEF {Math.round(unit.stats.physicalDefense)} · AC {Math.round(unit.stats.armorClass)}</Text><Text style={styles.magic}>MAGIC · ATK {Math.round(unit.stats.magicDamage)} · DEF {Math.round(unit.stats.magicDefense)} · MDS {Math.round(unit.stats.magicDefenseScore)}</Text></View>
    <Text style={[styles.advice, { color: colors.gold }]}>{advice}</Text>
    {unit.activeConditions.length > 0 && <Text style={styles.conditions}>{unit.activeConditions.map((entry) => `${COMBAT_CONDITIONS[entry.conditionId]?.name ?? formatGameId(entry.conditionId)} ${entry.remainingTurns}t`).join(" · ")}</Text>}
  </Panel>;
}
const styles = StyleSheet.create({ panel: { gap: 6, marginBottom: 8 }, heading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 }, name: { fontSize: 16, fontWeight: "900" }, side: { fontSize: 8, fontWeight: "900", letterSpacing: .8, marginTop: 2 }, danger: { fontSize: 9, fontWeight: "900", letterSpacing: .7 }, hpTrack: { height: 6, overflow: "hidden" }, hpFill: { height: "100%" }, hp: { fontWeight: "900" }, rows: { gap: 4 }, physical: { backgroundColor: "#492a28", borderRadius: 2, color: "#ff9a78", fontSize: 10, fontWeight: "900", padding: 5 }, magic: { backgroundColor: "#33294e", borderRadius: 2, color: "#c4a4ff", fontSize: 10, fontWeight: "900", padding: 5 }, advice: { fontSize: 11, fontWeight: "900" }, conditions: { color: "#efb060", fontSize: 10, fontWeight: "800" } });
