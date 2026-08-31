import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CLASSES } from "../../data/classes/classes";
import type { HeroCombatant } from "../../game/combat/combatEngine";
import { colors } from "../ui";
import { getRaceNameColor } from "../../ui/raceColors";
import { COMBAT_CONDITIONS } from "../../data/conditions/combatConditions";
import { useTheme } from "../../theme/theme";
import { CompanionPortrait } from "../companions/CompanionPortrait";
import { getCompanionDefinition } from "../../data/companions/companions";

function ratio(value: number, maximum: number) {
  return maximum > 0 ? Math.max(0, Math.min(1, value / maximum)) : 0;
}

function ResourceBar({ label, value, maximum, color }: { label: string; value: number; maximum: number; color: string }) {
  const {colors}=useTheme();
  return <View style={styles.resourceRow}>
    <Text style={[styles.resourceLabel,{color:colors.muted}]}>{label}</Text>
    <View style={[styles.track,{backgroundColor:colors.panel}]}><View style={[styles.fill, { backgroundColor: color, width: `${ratio(value, maximum) * 100}%` }]} /></View>
    <Text style={[styles.resourceValue,{color:colors.text}]}>{Math.round(value)}/{Math.round(maximum)}</Text>
  </View>;
}

export function PartyStatusPanel({ heroes, activeHeroId, compact = false }: { heroes: readonly HeroCombatant[]; activeHeroId: string | null; compact?: boolean }) {
  const {colors:themeColors}=useTheme();
  return <View accessibilityLabel="Party health and resources" style={styles.list}>
    {heroes.map(({ hero, instance }) => {
      const active = hero.id === activeHeroId;
      return <View key={hero.id} style={[styles.member,{backgroundColor:themeColors.panel2,borderColor:themeColors.border}, compact && styles.compactMember, active && {borderColor:themeColors.gold,borderWidth:2}, !instance.isAlive && styles.defeated]}>
        <View style={styles.heading}>
          <Text numberOfLines={1} style={[styles.name, { color: getRaceNameColor(hero.raceId) }]}>{hero.name} · {CLASSES[hero.classId].name}</Text>
          <Text style={[styles.state,{color:themeColors.muted}, active && {color:themeColors.gold}]}>{!instance.isAlive ? "DEFEATED" : active ? "CURRENT TURN" : "WAITING"}</Text>
        </View>
        <ResourceBar label="HP" value={instance.currentHP} maximum={instance.maxHP} color={themeColors.green} />
        {instance.maxMana > 0 && <ResourceBar label="MP" value={instance.currentMana} maximum={instance.maxMana} color={themeColors.blue} />}
        {!compact && instance.maxStamina > 0 && <ResourceBar label="SP" value={instance.currentStamina} maximum={instance.maxStamina} color={themeColors.gold} />}
        {instance.activeCompanion && (() => { const companion = getCompanionDefinition(instance.activeCompanion.id); return <View accessibilityLabel={`${companion?.name ?? "Summoned companion"}, ${instance.activeCompanion.currentHP} of ${instance.activeCompanion.maxHP} health, ${instance.activeCompanion.remainingTurns} turns remaining`} style={[styles.companion,{backgroundColor:themeColors.panel,borderColor:themeColors.blue}]}><CompanionPortrait companionId={instance.activeCompanion.id} size={38}/><View style={styles.companionCopy}><View style={styles.companionHeading}><Text numberOfLines={1} style={[styles.companionName,{color:themeColors.blue}]}>{companion?.name.toUpperCase() ?? instance.activeCompanion.id.replace(/_/g, " ").toUpperCase()}</Text><Text style={[styles.companionTurns,{backgroundColor:themeColors.panel2,color:themeColors.gold}]}>{instance.activeCompanion.remainingTurns}T</Text></View><Text style={[styles.companionRole,{color:themeColors.muted}]}>{companion?.role ?? "Summoned ally"} · Acts with hero</Text><ResourceBar label="HP" value={instance.activeCompanion.currentHP} maximum={instance.activeCompanion.maxHP} color={themeColors.blue}/><Text style={[styles.companionStats,{color:themeColors.text}]}>{instance.activeCompanion.damageType === "physical" ? "Physical" : "Magic"} pressure {instance.activeCompanion.damagePerTurn} · AC {instance.activeCompanion.armorClass}</Text></View></View>; })()}
        {instance.activeConditions.length > 0 && <Text style={styles.conditions}>{instance.activeConditions.map((condition) => `${COMBAT_CONDITIONS[condition.conditionId]?.name ?? condition.conditionId} ${condition.remainingTurns}t`).join(" • ")}</Text>}
      </View>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  list: { gap: 7, marginBottom: 10 },
  member: { backgroundColor: "#1d2637", borderColor: "#3f4a60", borderWidth: 1, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  compactMember: { paddingHorizontal: 8, paddingVertical: 5 },
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
  conditions: { color: "#f0b76d", fontSize: 10, fontWeight: "800", marginTop: 4 },
  companion: { alignItems: "center", backgroundColor: "#162f39", borderColor: colors.blue, borderRadius: 5, borderWidth: 1, flexDirection: "row", gap: 7, marginTop: 5, paddingHorizontal: 5, paddingVertical: 5 },
  companionCopy: { flex: 1, gap: 2 },
  companionHeading: { alignItems: "center", flexDirection: "row", gap: 5 },
  companionName: { color: colors.blue, fontSize: 9, fontWeight: "900" },
  companionRole: { fontSize: 8, fontWeight: "700" },
  companionTurns: { borderRadius: 4, fontSize: 8, fontWeight: "900", marginLeft: "auto", overflow: "hidden", paddingHorizontal: 5, paddingVertical: 2 },
  companionStats: { color: colors.text, fontSize: 9 },
});
