import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { HeroHistoryEvent } from "../../game/heroes/types";
import { colors } from "../ui";
import { HeroRelationshipsPanel } from "./HeroRelationshipsPanel";

const TYPE_LABELS: Record<HeroHistoryEvent["type"], string> = {
  recruitment: "GUILD", quest: "QUEST", training: "TRAINING", level_up: "LEVEL UP",
  injury: "INJURY", revival: "TEMPLE", relationship: "BOND", crafting: "CRAFTING", campaign: "STORY",
};
const OUTCOME_COLORS: Record<HeroHistoryEvent["outcome"], string> = { positive: colors.green, negative: colors.danger, neutral: colors.gold };

export function HeroHistoryTimeline({ events }: { events: readonly HeroHistoryEvent[] }) {
  if (!events.length) return <Text style={styles.empty}>No deeds have been recorded yet.</Text>;
  const ordered = [...events].sort((a, b) => b.day - a.day || b.id.localeCompare(a.id));
  const heroId = events[0]?.id.split(":")[0];
  return <>{heroId && <HeroRelationshipsPanel heroId={heroId} />}<View style={styles.timeline}>{ordered.map((event, index) => { const accent = OUTCOME_COLORS[event.outcome]; return <View key={event.id} style={styles.event}>
    {index < ordered.length - 1 && <View style={styles.line} />}<View style={[styles.marker, { backgroundColor: accent }]} />
    <View style={styles.card}><View style={styles.header}><Text style={styles.day}>DAY {event.day}</Text><Text style={[styles.type, { color: accent }]}>{TYPE_LABELS[event.type]}</Text></View><Text style={styles.title}>{event.title}</Text><Text style={styles.description}>{event.description}</Text></View>
  </View>; })}</View></>;
}

const styles = StyleSheet.create({
  timeline: { marginTop: 6 }, event: { minHeight: 86, paddingLeft: 24, paddingBottom: 12, position: "relative" },
  line: { position: "absolute", left: 6, top: 13, bottom: -13, width: 2, backgroundColor: colors.border },
  marker: { position: "absolute", left: 1, top: 7, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.panel },
  card: { backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 11 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  day: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, type: { fontSize: 10, fontWeight: "900", letterSpacing: .8 },
  title: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 5 }, description: { color: colors.muted, lineHeight: 18, marginTop: 4 },
  empty: { color: colors.muted, lineHeight: 20, paddingVertical: 10 },
});
