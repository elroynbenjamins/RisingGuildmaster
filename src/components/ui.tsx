import React from "react";
import { selectionStyle } from "../ui/selectionStyle";
import { Pressable, StyleSheet, Text, View, type ViewProps } from "react-native";
import { CLASSES } from "../data/classes/classes";
import { RACES } from "../data/races/races";
import { GAME_CONFIG } from "../config/gameConfig";
import { calculateHero } from "../game/heroes/heroCalculator";
import type { Hero } from "../game/heroes/types";
import { getRaceNameColor } from "../ui/raceColors";
import { HeroPortrait } from "./heroes/HeroPortrait";
import { useTheme } from "../theme/theme";
import { NotificationDot } from "./navigation/NotificationDot";
import { GameIcon } from "./icons/GameIcon";
import type { GameIconId } from "../data/ui/gameIcons";

export const colors = { background: "#101416", panel: "#1a2123", panel2: "#232d2f", gold: "#d8ad5c", text: "#f3eee3", muted: "#a8b1ad", green: "#79b887", danger: "#dd7a73", border: "#354044", blue: "#70a4c5" };

export function Panel(props: ViewProps) {
  const { colors: c } = useTheme();
  return <View {...props} style={[styles.panel, { backgroundColor: c.panel, borderColor: c.panel }, props.style]} />;
}

export function SectionTitle({ children }: React.PropsWithChildren) {
  const { colors: c } = useTheme();
  return <View style={styles.sectionHeading}><View style={[styles.sectionAccent,{backgroundColor:c.gold}]}/><Text style={[styles.sectionTitle, { color: c.gold }]}>{children}</Text><View style={[styles.sectionRule,{backgroundColor:c.border}]}/></View>;
}

export function ActionButton({ label, onPress, disabled = false, iconId, guardMs = 0 }: { label: string; onPress(): void; disabled?: boolean; iconId?: GameIconId; guardMs?: number }) {
  const { colors: c } = useTheme();
  const lastPress = React.useRef(0);
  const press = () => { const now = Date.now(); if (guardMs > 0 && now - lastPress.current < guardMs) return; lastPress.current = now; onPress(); };
  return <Pressable accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled }} aria-disabled={disabled} onPress={press} style={({ pressed }) => [styles.button, { backgroundColor: disabled ? c.panel2 : c.gold, borderColor: disabled ? c.border : c.gold }, pressed && !disabled && styles.buttonDim, pressed && styles.buttonPressed]}><View style={styles.buttonContent}>{iconId ? <GameIcon id={iconId} size={19} framed={false}/> : null}<Text style={[styles.buttonText, { color: disabled ? c.muted : c.buttonText }]}>{label}</Text></View></Pressable>;
}

export function SecondaryButton({ label, onPress, disabled = false, iconId, guardMs = 0 }: { label: string; onPress(): void; disabled?: boolean; iconId?: GameIconId; guardMs?: number }) {
  const { colors: c } = useTheme();
  const lastPress = React.useRef(0);
  const press = () => { const now = Date.now(); if (guardMs > 0 && now - lastPress.current < guardMs) return; lastPress.current = now; onPress(); };
  return <Pressable accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled }} aria-disabled={disabled} onPress={press} style={({ pressed }) => [styles.secondaryButton, { borderColor: disabled ? c.border : c.gold, backgroundColor: disabled ? c.panel : c.panel2 }, pressed && !disabled && styles.buttonDim, pressed && styles.buttonPressed]}><View style={styles.buttonContent}>{iconId ? <GameIcon id={iconId} size={18} framed={false}/> : null}<Text style={[styles.secondaryText, { color: disabled ? c.muted : c.text }]}>{label}</Text></View></Pressable>;
}

export function BackButton({ onPress }: { onPress(): void }) {
  const { colors: c } = useTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} hitSlop={12} style={({ pressed }) => [styles.backButton, { backgroundColor: "transparent" }, pressed && styles.buttonDim]}><Text style={[styles.back, { color: c.gold }]}>‹ BACK</Text></Pressable>;
}

export function EmptyState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?(): void }) {
  const { colors: c } = useTheme();
  return <Panel style={[styles.empty,{borderLeftColor:c.gold}]}><Text style={[styles.emptyTitle, { color: c.text }]}>{title}</Text><Text style={[styles.muted, { color: c.muted }]}>{message}</Text>{actionLabel && onAction ? <ActionButton label={actionLabel} onPress={onAction} /> : null}</Panel>;
}

export function SegmentedTabs<T extends string>({ values, value, onChange, notificationValues = [] }: { values: readonly T[]; value: T; onChange(value: any): void; notificationValues?: readonly T[] }) {
  const { colors: c } = useTheme();
  return <View style={[styles.tabs, { borderColor: c.border }]}>{values.map((item) => <Pressable key={item} onPress={() => onChange(item)} accessibilityRole="tab" accessibilityState={{ selected: item === value }} aria-selected={item === value} style={({pressed}) => [styles.tab, { borderColor: "transparent" }, selectionStyle(c, item === value), pressed && styles.tabPressed]}><Text style={[styles.tabText, { color: c.muted }, item === value && { color: c.gold }]}>{item}</Text>{notificationValues.includes(item) ? <View style={{ position: "absolute", top: 0, right: 1 }}><NotificationDot label={`${item}: choice available`} /></View> : null}</Pressable>)}</View>;
}

export function StatusChip({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "gold" | "good" | "danger" | "blue" }) {
  const { colors: c } = useTheme();
  const toneColor = tone === "gold" ? c.gold : tone === "good" ? c.green : tone === "danger" ? c.danger : tone === "blue" ? c.blue : c.muted;
  const tint = tone === "good" ? `${c.green}20` : tone === "danger" ? `${c.danger}20` : tone === "gold" ? `${c.gold}20` : tone === "blue" ? `${c.blue}20` : c.panel2;
  return <View style={[styles.chip, { borderColor: toneColor, backgroundColor: tint }]}><Text style={[styles.chipText, { color: toneColor }]}>{label}</Text></View>;
}

export function MiniMeter({ value, max, color, backgroundColor, height = 5 }: { value: number; max: number; color: string; backgroundColor?: string; height?: number }) {
  const { colors: c } = useTheme();
  const pct = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
  return <View style={[styles.meterTrack, { height, backgroundColor: backgroundColor ?? c.panel2, borderColor: c.border }]}><View style={[styles.meterFill, { width: `${pct}%`, backgroundColor: color }]} /></View>;
}

export function Portrait({ hero, size = 84 }: { hero: Hero; size?: number }) {
  return <HeroPortrait raceId={hero.raceId} classId={hero.classId} gender={hero.gender} variant={hero.portraitVariant ?? 0} label={hero.name} size={size} />;
}

export function HeroCard({ hero, onPress, subtitle, notification = false, loyaltyScore }: { hero: Hero; onPress(): void; subtitle?: string; notification?: boolean; loyaltyScore?: number }) {
  const { colors: c } = useTheme();
  const calculated = calculateHero(hero);
  const hpMax = Math.max(1, calculated.stats.maxHP);
  const status = hero.currentHP <= 0 ? "FALLEN" : hero.conditions.length ? "CONDITION" : hero.isAvailable ? "READY" : "BUSY";
  const statusTone = hero.currentHP <= 0 ? "danger" : hero.conditions.length ? "gold" : hero.isAvailable ? "good" : "neutral";
  return <Pressable accessibilityRole="button" accessibilityLabel={`Inspect ${hero.name}`} onPress={onPress} style={({ pressed }) => [styles.heroCard, { backgroundColor: c.panel, borderColor: pressed ? c.gold : c.border }, pressed && styles.heroCardPressed]}>
    <Portrait hero={hero} size={72} />
    <View style={styles.heroCardText}>
      <View style={styles.heroHeading}><Text style={[styles.heroName, { color: getRaceNameColor(hero.raceId) }]}>{hero.name}</Text><StatusChip label={status} tone={statusTone} /></View>
      <Text numberOfLines={1} style={[styles.muted, { color: c.muted }]}>{subtitle ?? `${RACES[hero.raceId].name} • ${CLASSES[hero.classId].name}`}</Text>
      <View style={styles.heroMetaRow}><Text style={[styles.smallStrong, { color: c.text }]}>LV {hero.level}</Text><Text style={[styles.small, { color: c.muted }]}>HP {Math.round(hero.currentHP)}/{Math.round(hpMax)}</Text><Text style={[styles.small, { color: c.muted }]}>RDY {Math.round(hero.adventureStamina)}</Text>{loyaltyScore !== undefined ? <Text style={[styles.small, { color: c.gold }]}>LOY {Math.round(loyaltyScore)}</Text> : null}</View>
      <View style={styles.heroMeters}><MiniMeter value={hero.currentHP} max={hpMax} color={hero.currentHP <= hpMax * .3 ? c.danger : c.green} /><MiniMeter value={hero.adventureStamina} max={GAME_CONFIG.maxAdventureStamina} color={hero.adventureStamina < 40 ? c.danger : c.blue} /></View>
    </View>
    {notification ? <View style={styles.heroNotice}><NotificationDot label="Hero skill choice available" /></View> : null}
    <Text style={[styles.chevron, { color: c.gold }]}>›</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 15 },
  sectionHeading: { alignItems: "center", flexDirection: "row", gap: 7, marginBottom: 10, marginTop: 18 },
  sectionAccent:{borderRadius:2,height:12,width:3},
  sectionTitle: {color: colors.gold, flexShrink: 1, fontWeight: "900", letterSpacing: .8, fontSize: 12},
  sectionRule:{flex:1,height:1,opacity:.75},
  button: { paddingHorizontal: 14, paddingVertical: 12, alignItems: "center", minHeight: 44, justifyContent: "center", borderWidth: 0, borderRadius: 10, },
  secondaryButton: { paddingHorizontal: 13, paddingVertical: 10, alignItems: "center", minHeight: 44, justifyContent: "center", borderWidth: 1, borderRadius: 10, },
  secondaryText: {color: colors.gold, flexShrink:1, fontSize: 13, fontWeight: "600", textAlign: "center", letterSpacing: 0},
  buttonDim: { opacity: 0.74 },
  buttonPressed: { transform: [{ translateY: 1 }] },
  buttonContent:{alignItems:"center",flexDirection:"row",gap:5,justifyContent:"center",maxWidth:"100%",minWidth:0},
  buttonText: {color: "#17130c", flexShrink:1, fontSize: 14, letterSpacing: .3, fontWeight: "700", textAlign: "center"},
  backButton: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: 10, borderWidth: 0, borderRadius: 10, },
  back: { color: colors.gold, fontSize: 12, fontWeight: "900", letterSpacing: .8 },
  empty: { alignItems: "stretch", borderLeftWidth: 3, gap: 12 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  muted: { color: colors.muted, fontSize: 12 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, marginBottom: 16, gap: 3 },
  tab: {flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 8, borderBottomWidth: 2, minHeight: 44, minWidth: 0},
  tabText: {color: colors.muted, flexShrink:1, textAlign: "center", fontWeight: "600", fontSize: 11, letterSpacing: 0},
  tabPressed:{opacity:.72,transform:[{translateY:1}]},
  chip: {alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 4, borderWidth: 1, borderRadius: 12, maxWidth: "100%", flexShrink: 1},
  chipText: { fontWeight: "600", fontSize: 10, letterSpacing: 0},
  meterTrack: { overflow: "hidden", borderWidth: 0, borderRadius: 3, },
  meterFill: { height: "100%" },
  heroCard: { backgroundColor: colors.panel, borderColor: colors.border, padding: 11, flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 10, minHeight: 98, borderWidth: 0, borderRadius: 10, },
  heroCardPressed: { transform: [{ translateY: 1 }] },
  heroCardText: { flex: 1, gap: 4 },
  heroHeading: { alignItems: "flex-start", flexDirection: "column", gap: 4},
  heroName: { color: colors.text, fontSize: 18, fontWeight: "900", flexShrink: 1 },
  heroMetaRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroMeters: { gap: 3 },
  small: { color: colors.text, fontSize: 9 },
  smallStrong: { color: colors.text, fontSize: 10, fontWeight: "900" },
  heroNotice: { position: "absolute", right: 6, top: 6 },
  chevron: { color: colors.gold, fontSize: 28, fontWeight: "800" },
});
