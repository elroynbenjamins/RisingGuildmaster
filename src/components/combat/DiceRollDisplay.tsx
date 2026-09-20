import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import type { D20RollMode } from "../../game/combat/dice/d20RollMode";
import { useTheme } from "../../theme/theme";
export interface DiceRollDisplayProps { diceType: 20; roll: number; rolls?: number[]; rollMode?: D20RollMode; modifier: number; attackBonus?: number; skillModifier?: number; total: number; targetValue: number; result: "critical" | "hit" | "miss" | "critical_miss" }
export function DiceRollDisplay({ diceType, roll, rolls, rollMode = "normal", modifier, attackBonus, skillModifier, total, targetValue, result }: DiceRollDisplayProps) {
  const { colors } = useTheme();
  const reveal = useRef(new Animated.Value(0)).current;
  useEffect(() => { reveal.setValue(0); Animated.timing(reveal, { toValue: 1, duration: result === "critical" || result === "critical_miss" ? 760 : 520, useNativeDriver: true }).start(); }, [reveal, roll, total, result]);
  const good = result === "hit" || result === "critical";
  const resultLabel = result === "critical" ? "★ CRITICAL HIT" : result === "critical_miss" ? "NATURAL 1 · MISS" : result.toUpperCase();
  return <Animated.View accessibilityLiveRegion="polite" style={[styles.card, { backgroundColor: colors.panel2, borderColor: result === "critical" ? colors.gold : good ? colors.green : colors.danger, opacity: reveal, transform: [{ scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [.97, 1] }) }] }] }>
    <View style={styles.heading}><Text style={[styles.eyebrow, { color: colors.muted }]}>ATTACK ROLL</Text><Text style={[styles.result, { color: good ? colors.green : colors.danger }]}>{resultLabel}</Text></View>
    {rollMode !== "normal" && rolls?.length === 2 && <Text style={[styles.mode, { color: colors.blue }]}>{rollMode.toUpperCase()} · Rolled {rolls.join(" / ")} · Kept {roll}</Text>}
    <View style={styles.rollRow}><Text style={[styles.die, { color: colors.gold }]}>D{diceType}</Text><Text style={[styles.roll, { color: colors.text }]}>{roll}</Text><Text style={[styles.math, { color: colors.muted }]}>{modifier >= 0 ? "+" : ""}{modifier}</Text><Text style={[styles.equals, { color: colors.muted }]}>=</Text><Text style={[styles.total, { color: good ? colors.green : colors.danger }]}>{total}</Text></View>
    <Text style={[styles.target, { color: colors.muted }]}>vs DEFENSE {targetValue}{attackBonus !== undefined ? ` · Attack ${attackBonus >= 0 ? "+" : ""}${attackBonus} · Skill ${(skillModifier ?? 0) >= 0 ? "+" : ""}${skillModifier ?? 0}` : ""}</Text>
  </Animated.View>;
}
const styles = StyleSheet.create({
  card: { padding: 10, borderWidth: 2, borderRadius: 2, marginVertical: 8 },
  heading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  eyebrow: { fontSize: 8, fontWeight: "900", letterSpacing: .8 },
  result: { fontSize: 10, fontWeight: "900", letterSpacing: .5 },
  mode: { fontSize: 9, fontWeight: "900", marginTop: 5, textAlign: "center" },
  rollRow: { alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 7 },
  die: { fontSize: 10, fontWeight: "900" },
  roll: { fontSize: 22, fontWeight: "900", lineHeight: 24 },
  math: { fontSize: 13, fontWeight: "900" },
  equals: { fontSize: 11, fontWeight: "900" },
  total: { fontSize: 18, fontWeight: "900" },
  target: { textAlign: "center", marginTop: 5, fontSize: 9, fontWeight: "700" },
});
