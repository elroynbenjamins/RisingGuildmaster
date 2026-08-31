import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import type { D20RollMode } from "../../game/combat/dice/d20RollMode";
import { useTheme } from "../../theme/theme";
export interface DiceRollDisplayProps { diceType: 20; roll: number; rolls?: number[]; rollMode?: D20RollMode; modifier: number; attackBonus?: number; skillModifier?: number; total: number; targetValue: number; result: "critical" | "hit" | "miss" | "critical_miss" }
export function DiceRollDisplay({ diceType, roll, rolls, rollMode = "normal", modifier, attackBonus, skillModifier, total, targetValue, result }: DiceRollDisplayProps) {
  const {colors}=useTheme();
  const reveal = useRef(new Animated.Value(0)).current;
  useEffect(() => { reveal.setValue(0); Animated.timing(reveal, { toValue: 1, duration: 650, useNativeDriver: true }).start(); }, [reveal, roll, total, result]);
  const good = result === "hit" || result === "critical";
  return <Animated.View accessibilityLiveRegion="polite" style={[styles.card,{backgroundColor:colors.panel2,borderColor:colors.gold,opacity:reveal}]}>{rollMode !== "normal" && rolls?.length === 2 && <Text style={[styles.mode,{color:colors.blue}]}>{rollMode.toUpperCase()} · Rolled {rolls.join(" and ")} · Kept {roll}</Text>}<Text style={[styles.roll,{color:colors.gold}]}>D{diceType}: {roll} {modifier >= 0 ? "+" : ""}{modifier} = {total}</Text>{attackBonus !== undefined && <Text style={[styles.target,{color:colors.muted}]}>Attack bonus {attackBonus >= 0 ? "+" : ""}{attackBonus} • Skill {skillModifier && skillModifier >= 0 ? "+" : ""}{skillModifier ?? 0}</Text>}<Text style={[styles.target,{color:colors.muted}]}>vs defense {targetValue}</Text><Text style={[styles.result,{color:good?colors.green:colors.danger}]}>{result === "critical" ? "CRITICAL HIT" : result === "critical_miss" ? "NATURAL 1 • MISS" : result.toUpperCase()}</Text></Animated.View>;
}
const styles = StyleSheet.create({ card: { padding: 10, borderWidth: 1, borderColor: "#746436", backgroundColor: "#2c281c", borderRadius: 10, marginVertical: 8 }, mode: { color: "#72b7f2", fontSize: 11, fontWeight: "900", marginBottom: 4, textAlign: "center" }, roll: { color: "#ffe18a", fontWeight: "900", textAlign: "center" }, target: { color: "#b9b1a1", textAlign: "center", marginTop: 2 }, result: { textAlign: "center", fontWeight: "900", marginTop: 4 }, good: { color: "#77d99a" }, bad: { color: "#ff817a" } });
