import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RELATIONSHIP_BAND_LABELS, relationshipBand } from "../../game/relationships/relationshipService";
import { useGuild } from "../../state/GuildContext";
import { Panel, SectionTitle, colors } from "../ui";

export function HeroRelationshipsPanel({ heroId }: { heroId: string }) {
  const { guild } = useGuild();
  const entries = guild.relationships.filter((item) => item.heroIdA === heroId || item.heroIdB === heroId).map((item) => ({ ...item, partner: guild.heroes.find((hero) => hero.id === (item.heroIdA === heroId ? item.heroIdB : item.heroIdA)) })).filter((item) => item.partner).sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  return <><SectionTitle>RELATIONSHIPS</SectionTitle><Panel>{entries.length ? entries.map((item) => { const band = relationshipBand(item.score); return <View key={`${item.heroIdA}-${item.heroIdB}`} style={styles.entry}><View style={styles.row}><Text style={styles.name}>{item.partner!.name}</Text><Text style={[styles.score, { color: item.score < -20 ? colors.danger : item.score > 20 ? colors.green : colors.gold }]}>{RELATIONSHIP_BAND_LABELS[band]} · {item.score}</Text></View><Text style={styles.effect}>{band === "friend" || band === "close_friend" ? "Adjacent in combat: +1 attack roll." : band === "rival" ? "Together in combat: +5% physical damage; healing each other is 10% weaker." : "No combat consequence at this relationship level."}</Text></View>; }) : <Text style={styles.empty}>Complete quests together to form friendships, rivalries, and shared history.</Text>}</Panel></>;
}

const styles = StyleSheet.create({ entry: { marginBottom: 12 }, row: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, name: { color: colors.text, fontWeight: "900" }, score: { fontWeight: "900" }, effect: { color: colors.muted, lineHeight: 18, marginTop: 4 }, empty: { color: colors.muted, lineHeight: 20 } });
