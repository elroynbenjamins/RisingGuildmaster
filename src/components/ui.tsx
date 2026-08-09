import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewProps } from "react-native";
import { CLASSES } from "../data/classes/classes";
import { RACES } from "../data/races/races";
import type { Hero } from "../game/heroes/types";

export const colors = { background: "#101416", panel: "#1a2123", panel2: "#232d2f", gold: "#d8ad5c", text: "#f3eee3", muted: "#a8b1ad", green: "#79b887", danger: "#dd7a73", border: "#354044" };

export function Panel(props: ViewProps) { return <View {...props} style={[styles.panel, props.style]} />; }
export function SectionTitle({ children }: React.PropsWithChildren) { return <Text style={styles.sectionTitle}>{children}</Text>; }
export function ActionButton({ label, onPress, disabled = false }: { label: string; onPress(): void; disabled?: boolean }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, (pressed || disabled) && styles.buttonDim]}><Text style={styles.buttonText}>{label}</Text></Pressable>; }
export function BackButton({ onPress }: { onPress(): void }) { return <Pressable accessibilityRole="button" onPress={onPress} hitSlop={12}><Text style={styles.back}>‹ Back</Text></Pressable>; }
export function Portrait({ hero, size = 84 }: { hero: Hero; size?: number }) {
  const initials = hero.name.slice(0, 1).toUpperCase();
  return <View accessibilityLabel={`${hero.name} portrait`} style={[styles.portrait, { width: size, height: size, borderRadius: size / 2 }]}><Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text><Text style={styles.portraitClass}>{CLASSES[hero.classId].name.slice(0, 3).toUpperCase()}</Text></View>;
}
export function HeroCard({ hero, onPress, subtitle }: { hero: Hero; onPress(): void; subtitle?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Inspect ${hero.name}`} onPress={onPress} style={({ pressed }) => [styles.heroCard, pressed && styles.buttonDim]}><Portrait hero={hero} /><View style={styles.heroCardText}><Text style={styles.heroName}>{hero.name}</Text><Text style={styles.muted}>{subtitle ?? `${RACES[hero.raceId].name} • ${CLASSES[hero.classId].name}`}</Text><Text style={styles.small}>Level {hero.level}</Text></View><Text style={styles.chevron}>›</Text></Pressable>;
}

const styles = StyleSheet.create({ panel: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 16 }, sectionTitle: { color: colors.gold, fontSize: 13, letterSpacing: 1.4, fontWeight: "800", marginBottom: 10, marginTop: 8 }, button: { backgroundColor: colors.gold, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 10, alignItems: "center" }, buttonDim: { opacity: 0.55 }, buttonText: { color: "#17130c", fontSize: 15, fontWeight: "800" }, back: { color: colors.gold, fontSize: 17, fontWeight: "700", paddingVertical: 6 }, portrait: { backgroundColor: "#34484a", borderColor: colors.gold, borderWidth: 2, alignItems: "center", justifyContent: "center" }, initials: { color: colors.text, fontWeight: "800" }, portraitClass: { color: colors.gold, fontSize: 9, fontWeight: "800" }, heroCard: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 }, heroCardText: { flex: 1, gap: 4 }, heroName: { color: colors.text, fontSize: 20, fontWeight: "800" }, muted: { color: colors.muted, fontSize: 14 }, small: { color: colors.text, fontSize: 13 }, chevron: { color: colors.gold, fontSize: 34 } });
