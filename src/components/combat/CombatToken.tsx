import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EnemyPortrait } from "../enemies/EnemyPortrait";
import { HeroPortrait } from "../heroes/HeroPortrait";
import type { Hero } from "../../game/heroes/types";
import { GameIcon } from "../icons/GameIcon";

export function CombatToken({ label, side, enemyDefinitionId, hero, selected = false, attackable = false, size = 27 }: { label: string; side: "heroes" | "enemies"; enemyDefinitionId?: string; hero?: Hero; selected?: boolean; attackable?: boolean; size?: number }) {
  const shortLabel = label.split(/\s+/).map((word) => word[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const equippedCount = hero ? Object.values(hero.equipment).filter(Boolean).length : 0;
  return <View accessibilityLabel={`${side === "heroes" ? "Hero" : "Enemy"} ${label}${equippedCount ? `, ${equippedCount} equipped items` : ""}`} style={[styles.token, { width: size, height: size, borderRadius: size / 2 }, side === "heroes" ? styles.hero : styles.enemy, selected && styles.selected, attackable && styles.attackable]}>{side === "enemies" && enemyDefinitionId ? <EnemyPortrait enemyId={enemyDefinitionId} size={size - 4} /> : hero ? <HeroPortrait raceId={hero.raceId} classId={hero.classId} gender={hero.gender} variant={hero.portraitVariant ?? 0} label={hero.name} size={size - 4} /> : <Text style={[styles.label, { fontSize: Math.max(8, Math.floor(size * .44)) }]}>{shortLabel}</Text>}{equippedCount > 0 && <View style={styles.equipped}><GameIcon id={hero?.equipment.weapon ? "weapon" : "armor"} size={Math.max(10, Math.floor(size * .34))} /></View>}</View>;
}
const styles = StyleSheet.create({ token: { alignItems: "center", justifyContent: "center", borderWidth: 2 }, hero: { backgroundColor: "#315b89", borderColor: "#86bdf4" }, enemy: { backgroundColor: "#7d3030", borderColor: "#f08a83" }, selected: { borderColor: "#f5cc68", borderWidth: 3 }, attackable: { borderStyle: "dashed", borderColor: "#fff" }, label: { color: "#fff", fontWeight: "900" }, equipped: { bottom: -4, position: "absolute", right: -4 } });
