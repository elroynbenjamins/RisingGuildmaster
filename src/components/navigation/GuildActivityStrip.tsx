import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { GuildState } from "../../game/guild/types";
import { getGuildActivities, type GuildActivityDestination, type GuildActivityTone } from "../../ui/guildActivityPresentation";
import { GameIcon } from "../icons/GameIcon";
import { useTheme } from "../../theme/theme";

function toneColor(tone: GuildActivityTone, colors: ReturnType<typeof useTheme>["colors"]): string {
  return tone === "ready" ? colors.green : tone === "warning" ? colors.gold : colors.blue;
}

export function GuildActivityStrip({ guild, onOpen }: { guild: GuildState; onOpen(destination: GuildActivityDestination): void }) {
  const { colors } = useTheme();
  const items = getGuildActivities(guild);
  if (!items.length) return null;
  return <View style={[styles.shell, { backgroundColor: colors.background, borderColor: colors.border }]}>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => {
        const accent = toneColor(item.tone, colors);
        return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.label}. ${item.detail}`} onPress={() => onOpen(item.destination)} style={({ pressed }: { pressed: boolean }) => [styles.card, { backgroundColor: colors.panel, borderColor: accent }, pressed && styles.pressed]}>
          <View style={[styles.rail, { backgroundColor: accent }]} />
          <GameIcon id={item.iconId} size={20} framed={false} />
          <View style={{ flex: 1 }}><Text style={[styles.label, { color: colors.text }]}>{item.label}</Text><Text style={[styles.detail, { color: accent }]}>{item.detail}</Text></View><Text style={{ color: accent, fontSize: 18 }}>›</Text>
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  shell: { borderBottomWidth: 0, paddingBottom: 5, paddingTop: 4 },
  row: { gap: 5, paddingHorizontal: 8 },
  card: {alignItems: "center", flexDirection: "row", gap: 6, paddingHorizontal: 8, paddingVertical: 4, position: "relative", borderWidth: 0, borderRadius: 10, minHeight: 44, minWidth: 150},
  rail: { bottom: 0, left: 0, position: "absolute", top: 0, width: 3 },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0},
  detail: {marginTop: 1, fontSize: 10, fontWeight: "500", letterSpacing: 0},
  pressed: { opacity: .68, transform: [{ translateY: 1 }] },
});
