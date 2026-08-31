import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { HeroHistoryEvent } from "../../game/heroes/types";
import { colors } from "../ui";
import { useTheme } from "../../theme/theme";

const TYPE_LABELS: Record<HeroHistoryEvent["type"], string> = {
  recruitment: "GUILD", quest: "QUEST", training: "TRAINING", level_up: "LEVEL UP",
  injury: "INJURY", revival: "TEMPLE", relationship: "BOND", crafting: "CRAFTING", campaign: "STORY",
};
export function HeroHistoryTimeline({ events }: { events: readonly HeroHistoryEvent[] }) {
  const {colors:themeColors}=useTheme();
  const outcomeColors:Record<HeroHistoryEvent["outcome"],string>={positive:themeColors.green,negative:themeColors.danger,neutral:themeColors.gold};
  const [expanded, setExpanded] = useState(false);
  if (!events.length) return <Text style={[styles.empty,{color:themeColors.muted}]}>No deeds have been recorded yet.</Text>;
  const ordered = [...events].sort((a, b) => b.day - a.day || b.id.localeCompare(a.id)); const visible = expanded ? ordered : ordered.slice(0, 8);
  return <><View style={styles.timeline}>{visible.map((event, index) => { const accent = outcomeColors[event.outcome]; return <View key={event.id} style={styles.event}>
    {index < visible.length - 1 && <View style={[styles.line,{backgroundColor:themeColors.border}]} />}<View style={[styles.marker, { backgroundColor: accent,borderColor:themeColors.panel }]} />
    <View style={[styles.card,{backgroundColor:themeColors.panel2,borderColor:themeColors.border}]}><View style={styles.header}><Text style={[styles.day,{color:themeColors.muted}]}>DAY {event.day}</Text><Text style={[styles.type, { color: accent }]}>{TYPE_LABELS[event.type]}</Text></View><Text style={[styles.title,{color:themeColors.text}]}>{event.title}</Text><Text style={[styles.description,{color:themeColors.muted}]}>{event.description}</Text></View>
  </View>; })}</View>{ordered.length>8&&<Pressable onPress={()=>setExpanded((value)=>!value)} style={[styles.more,{borderColor:themeColors.border}]}><Text style={[styles.moreText,{color:themeColors.gold}]}>{expanded?"SHOW RECENT EVENTS":`SHOW ${ordered.length-8} OLDER EVENTS`}</Text></Pressable>}</>;
}

const styles = StyleSheet.create({
  timeline: { marginTop: 6 }, event: { minHeight: 86, paddingLeft: 24, paddingBottom: 12, position: "relative" },
  line: { position: "absolute", left: 6, top: 13, bottom: -13, width: 2, backgroundColor: colors.border },
  marker: { position: "absolute", left: 1, top: 7, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.panel },
  card: { backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 11 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  day: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, type: { fontSize: 10, fontWeight: "900", letterSpacing: .8 },
  title: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 5 }, description: { color: colors.muted, lineHeight: 18, marginTop: 4 },
  empty: { color: colors.muted, lineHeight: 20, paddingVertical: 10 }, more:{alignItems:"center",borderColor:colors.border,borderRadius:8,borderWidth:1,padding:10},moreText:{color:colors.gold,fontSize:10,fontWeight:"900",letterSpacing:.8},
});
