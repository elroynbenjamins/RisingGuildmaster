import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CLASSES } from "../../data/classes/classes";
import type { HeroCombatant } from "../../game/combat/combatEngine";
import { colors } from "../ui";
import { getRaceNameColor } from "../../ui/raceColors";

function ratio(value: number, maximum: number) {
  return maximum > 0 ? Math.max(0, Math.min(1, value / maximum)) : 0;
}

function ResourceBar({ label, value, maximum, color }: { label: string; value: number; maximum: number; color: string }) {
  return <View style={styles.resourceRow}>
    <Text style={styles.resourceLabel}>{label}</Text>
    <View style={styles.track}><View style={[styles.fill, { backgroundColor: color, width: `${ratio(value, maximum) * 100}%` }]} /></View>
    <Text style={styles.resourceValue}>{Math.round(value)}/{Math.round(maximum)}</Text>
  </View>;
}

export function PartyStatusPanel({ heroes, activeHeroId }: { heroes: readonly HeroCombatant[]; activeHeroId: string | null }) {
  return <View accessibilityLabel="Party health and resources" style={styles.list}>
    {heroes.map(({ hero, instance }) => {
      const active = hero.id === activeHeroId;
      return <View key={hero.id} style={[styles.member, active && styles.active, !instance.isAlive && styles.defeated]}>
        <View style={styles.heading}>
          <Text numberOfLines={1} style={[styles.name, { color: getRaceNameColor(hero.raceId) }]}>{hero.name} · {CLASSES[hero.classId].name}</Text>
          <Text style={[styles.state, active && styles.activeText]}>{!instance.isAlive ? "DEFEATED" : active ? "CURRENT TURN" : "WAITING"}</Text>
        </View>
        <ResourceBar label="HP" value={instance.currentHP} maximum={instance.maxHP} color={colors.green} />
        {instance.maxMana > 0 && <ResourceBar label="MP" value={instance.currentMana} maximum={instance.maxMana} color={colors.blue} />}
        {instance.maxStamina > 0 && <ResourceBar label="SP" value={instance.currentStamina} maximum={instance.maxStamina} color={colors.gold} />}
      </View>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  list: { gap: 7, marginBottom: 10 },
  member: { backgroundColor: "#1d2637", borderColor: "#3f4a60", borderWidth: 1, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  active: { borderColor: colors.gold, borderWidth: 2 },
  defeated: { opacity: .55 },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 },
  name: { color: colors.text, fontWeight: "800", flex: 1 },
  state: { color: colors.muted, fontSize: 9, fontWeight: "900" },
  activeText: { color: colors.gold },
  resourceRow: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 17 },
  resourceLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", width: 18 },
  track: { flex: 1, height: 7, backgroundColor: "#3d3038", borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  resourceValue: { color: colors.text, fontSize: 10, fontVariant: ["tabular-nums"], textAlign: "right", minWidth: 57 },
});
