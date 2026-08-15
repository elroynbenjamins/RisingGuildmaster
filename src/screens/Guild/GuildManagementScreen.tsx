import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton, Panel, colors } from "../../components/ui";

const ENTRIES = [
  { id: "guildmaster", name: "Guildmaster Skills", ready: true }, { id: "roster", name: "Roster & Payroll", ready: true },
  { id: "recruitment", name: "Recruitment", ready: true }, { id: "training", name: "Training", ready: true },
  { id: "temple", name: "Temple of Renewal", ready: true }, { id: "quests", name: "Quest Board", ready: true },
  { id: "operations", name: "Crisis Operations", ready: true },
  { id: "upgrades", name: "Guild Upgrades", ready: false }, { id: "finances", name: "Calendar & Finances", ready: true },
  { id: "achievements", name: "Achievements", ready: false }, { id: "manual", name: "Monster Manual", ready: true },
  { id: "heroCodex", name: "Races & Classes Codex", ready: true }, { id: "skillCodex", name: "Skills & Abilities Codex", ready: true },
  { id: "loreJournal", name: "Lore & Journal", ready: true }, { id: "settings", name: "Settings", ready: false },
];

interface GuildManagementScreenProps {
  onBack(): void;
  openGuildmasterSkills(): void;
  openHeroes(): void;
  openTemple(): void;
  openMonsterManual(): void;
  openHeroCodex(): void;
  openSkillCodex(): void;
  openLoreJournal(): void;
  openFinances(): void;
  openOperations(): void;
}

export function GuildManagementScreen({ onBack, openGuildmasterSkills, openHeroes, openTemple, openMonsterManual, openHeroCodex, openSkillCodex, openLoreJournal, openFinances, openOperations }: GuildManagementScreenProps) {
  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.title}>Guild Management</Text><Text style={styles.intro}>Develop your Guildmaster first, then expand into more specialized guild services.</Text>{ENTRIES.map((entry) => {
    const open = entry.id === "guildmaster" ? openGuildmasterSkills : entry.id === "roster" ? openHeroes : entry.id === "temple" ? openTemple : entry.id === "operations" ? openOperations : entry.id === "manual" ? openMonsterManual : entry.id === "heroCodex" ? openHeroCodex : entry.id === "skillCodex" ? openSkillCodex : entry.id === "loreJournal" ? openLoreJournal : entry.id === "finances" ? openFinances : undefined;
    return <Pressable key={entry.id} onPress={open}><Panel style={styles.row}><View><Text style={styles.name}>{entry.name}</Text><Text style={entry.ready ? styles.ready : styles.soon}>{entry.ready ? open ? "Open service" : "Available from main navigation" : "Coming Soon"}</Text></View><Text style={styles.arrow}>{open ? "›" : ""}</Text></Panel></Pressable>;
  })}</ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 20 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 12 }, intro: { color: colors.muted, marginVertical: 12 }, row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }, name: { color: colors.text, fontSize: 18, fontWeight: "800" }, ready: { color: colors.green, marginTop: 4 }, soon: { color: colors.muted, marginTop: 4 }, arrow: { color: colors.gold, fontSize: 30 } });
