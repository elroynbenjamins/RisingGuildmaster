import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, HeroCard, colors } from "../components/ui";
import type { Hero } from "../game/heroes/types";
import { useGuild } from "../state/GuildContext";
export function RecruitmentScreen({ onBack, inspect }: { onBack(): void; inspect(hero: Hero): void }) {
  const { candidates, refreshCandidates, guild } = useGuild();
  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><View style={styles.header}><View><Text style={styles.title}>Recruitment</Text><Text style={styles.sub}>Available gold: {guild.gold.toLocaleString()}</Text></View><ActionButton label="Refresh" onPress={refreshCandidates} /></View><Text style={styles.intro}>Three adventurers have answered your notice. Inspect their true capabilities before offering a contract.</Text>{candidates.map((hero) => <HeroCard key={hero.id} hero={hero} onPress={() => inspect(hero)} subtitle={`${hero.age} • ${hero.classId} • ${hero.recruitmentCost} gold`} />)}{!candidates.length && <Text style={styles.intro}>All current candidates have been recruited. Refresh the board for new arrivals.</Text>}</ScrollView>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 12 }, title: { color: colors.text, fontSize: 31, fontWeight: "900" }, sub: { color: colors.gold, marginTop: 4 }, intro: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 20 } });
