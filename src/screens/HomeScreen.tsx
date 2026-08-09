import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, HeroCard, Panel, SectionTitle, colors } from "../components/ui";
import type { Hero } from "../game/heroes/types";
import { useGuild } from "../state/GuildContext";

export function HomeScreen({ openRecruitment, openHero, openQuests, openWorld }: { openRecruitment(): void; openHero(hero: Hero): void; openQuests(): void; openWorld(): void }) {
  const { guild } = useGuild();
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>GUILDMASTER</Text><Text style={styles.title}>{guild.guildName}</Text><Text style={styles.subtitle}>Day {guild.currentDay} • Reputation {guild.reputation}</Text>
    <Panel style={styles.treasury}><View><Text style={styles.label}>TREASURY</Text><Text style={styles.gold}>{guild.gold.toLocaleString()} gold</Text></View><View style={styles.actions}><ActionButton label="World" onPress={openWorld} /><ActionButton label="Quests" onPress={openQuests} /><ActionButton label="Recruit" onPress={openRecruitment} /></View></Panel>
    <SectionTitle>GUILD ROSTER · {guild.heroes.length}</SectionTitle>
    {guild.heroes.length ? guild.heroes.map((hero) => <HeroCard key={hero.id} hero={hero} onPress={() => openHero(hero)} />) : <Panel><Text style={styles.empty}>Your hall is quiet. Visit recruitment to meet the first adventurers seeking a banner.</Text></Panel>}
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 }, eyebrow: { color: colors.gold, fontSize: 12, fontWeight: "900", letterSpacing: 3, marginTop: 16 }, title: { color: colors.text, fontSize: 34, fontWeight: "900", marginTop: 5 }, subtitle: { color: colors.muted, marginTop: 4, marginBottom: 22 }, treasury: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, actions: { flexDirection: "row", gap: 8 }, label: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }, gold: { color: colors.text, fontSize: 21, fontWeight: "800", marginTop: 4 }, empty: { color: colors.muted, fontSize: 15, lineHeight: 23 } });
