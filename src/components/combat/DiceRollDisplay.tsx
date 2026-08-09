import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
export interface DiceRollDisplayProps { diceType: 20; roll: number; modifier: number; total: number; targetValue: number; result: "critical" | "hit" | "miss" | "critical_miss" }
export function DiceRollDisplay({ diceType, roll, modifier, total, targetValue, result }: DiceRollDisplayProps) {
  const reveal = useRef(new Animated.Value(0)).current;
  useEffect(() => { reveal.setValue(0); Animated.timing(reveal, { toValue: 1, duration: 650, useNativeDriver: true }).start(); }, [reveal, roll, total, result]);
  const good = result === "hit" || result === "critical";
  return <Animated.View accessibilityLiveRegion="polite" style={[styles.card, { opacity: reveal }]}><Text style={styles.roll}>D{diceType}: {roll} {modifier >= 0 ? "+" : ""}{modifier} = {total}</Text><Text style={styles.target}>vs defense {targetValue}</Text><Text style={[styles.result, good ? styles.good : styles.bad]}>{result === "critical" ? "CRITICAL HIT" : result === "critical_miss" ? "NATURAL 1 · MISS" : result.toUpperCase()}</Text></Animated.View>;
}
const styles = StyleSheet.create({ card: { padding: 10, borderWidth: 1, borderColor: "#746436", backgroundColor: "#2c281c", borderRadius: 10, marginVertical: 8 }, roll: { color: "#ffe18a", fontWeight: "900", textAlign: "center" }, target: { color: "#b9b1a1", textAlign: "center", marginTop: 2 }, result: { textAlign: "center", fontWeight: "900", marginTop: 4 }, good: { color: "#77d99a" }, bad: { color: "#ff817a" } });
