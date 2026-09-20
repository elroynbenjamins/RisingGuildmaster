import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Hero } from "../../game/heroes/types";
import { getCombatHealthState } from "../../game/combat/combatFeedbackService";
import { useTheme } from "../../theme/theme";
import { EnemyPortrait } from "../enemies/EnemyPortrait";
import { GameIcon } from "../icons/GameIcon";
import { HeroPortrait } from "../heroes/HeroPortrait";

export function CombatToken({ label, side, enemyDefinitionId, hero, selected = false, attackable = false, size = 27, currentHP, maxHP }: { label: string; side: "heroes" | "enemies"; enemyDefinitionId?: string; hero?: Hero; selected?: boolean; attackable?: boolean; size?: number; currentHP: number; maxHP: number }) {
  const { colors } = useTheme();
  const shortLabel = label.split(/\s+/).map((word) => word[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const equippedCount = hero ? Object.values(hero.equipment).filter(Boolean).length : 0;
  const healthState = getCombatHealthState(currentHP, maxHP);
  const healthRatio = Math.max(0, Math.min(1, currentHP / Math.max(1, maxHP)));
  const healthColor = healthState === "critical" ? colors.danger : healthState === "wounded" ? colors.gold : colors.green;
  return <View accessibilityLabel={`${side === "heroes" ? "Hero" : "Enemy"} ${label}, ${Math.round(currentHP)} of ${Math.round(maxHP)} health${healthState === "critical" ? ", critical health" : ""}${equippedCount ? `, ${equippedCount} equipped items` : ""}`} style={[styles.token, { width: size, height: size }, side === "heroes" ? styles.hero : styles.enemy, selected && { borderColor: colors.gold, borderWidth: 3 }, attackable && styles.attackable, healthState === "critical" && styles.critical]}>
    {side === "enemies" && enemyDefinitionId ? <EnemyPortrait enemyId={enemyDefinitionId} size={size - 4} /> : hero ? <HeroPortrait raceId={hero.raceId} classId={hero.classId} gender={hero.gender} variant={hero.portraitVariant ?? 0} label={hero.name} size={size - 4} /> : <Text style={[styles.label, { color: colors.text, fontSize: Math.max(8, Math.floor(size * .44)) }]}>{shortLabel}</Text>}
    <View pointerEvents="none" style={[styles.hpTrack, { width: size + 2 }]}><View style={[styles.hpFill, { backgroundColor: healthColor, width: `${healthRatio * 100}%` }]} /></View>
    {healthState === "critical" ? <View pointerEvents="none" style={[styles.dangerFlag, { backgroundColor: colors.danger }]}><Text style={styles.dangerText}>!</Text></View> : null}
    {equippedCount > 0 && <View style={styles.equipped}><GameIcon id={hero?.equipment.weapon ? "weapon" : "armor"} size={Math.max(10, Math.floor(size * .34))} /></View>}
  </View>;
}

const styles = StyleSheet.create({
  token: { alignItems: "center", justifyContent: "center", borderWidth: 2, borderRadius: 2 },
  hero: { backgroundColor: "#315b89", borderColor: "#86bdf4" },
  enemy: { backgroundColor: "#7d3030", borderColor: "#f08a83" },
  attackable: { borderStyle: "dashed", borderColor: "#fff" },
  critical: { backgroundColor: "#51262a" },
  label: { fontWeight: "900" },
  hpTrack: { backgroundColor: "#0a0d10", borderColor: "rgba(255,255,255,.28)", borderWidth: 1, bottom: -5, height: 4, left: -3, overflow: "hidden", position: "absolute" },
  hpFill: { height: "100%" },
  dangerFlag: { alignItems: "center", borderColor: "#ffe3df", borderWidth: 1, height: 11, justifyContent: "center", left: -5, position: "absolute", top: -5, width: 11 },
  dangerText: { color: "#fff", fontSize: 8, fontWeight: "900", lineHeight: 9 },
  equipped: { bottom: -4, position: "absolute", right: -4 },
});
