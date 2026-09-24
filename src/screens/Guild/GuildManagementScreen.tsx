import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton, Panel, SegmentedTabs, colors } from "../../components/ui";

import { NotificationDot } from "../../components/navigation/NotificationDot";
import { useActionNotifications } from "../../state/useActionNotifications";
type EntryId = "gems" | "guildmaster" | "roster" | "temple" | "operations" | "legacy" | "achievements" | "content" | "finances" | "manual" | "heroCodex" | "skillCodex" | "loreJournal" | "settings";
type Entry = { id: EntryId; name: string; detail: string };

const GROUPS: { title: string; entries: Entry[] }[] = [
  { title: "COMMAND", entries: [
    { id: "guildmaster", name: "Guildmaster Skills", detail: "Unlock services and strengthen guild leadership." },
    { id: "roster", name: "Roster & Payroll", detail: "Review heroes, salaries, stamina, and availability." },
    { id: "finances", name: "Calendar & Finances", detail: "Advance time and review the guild economy." },
    { id: "legacy", name: "Renown & Trophy Hall", detail: "Track guild rank, milestones, and victories." },
    { id: "achievements", name: "Achievements", detail: "Track long-term milestones and claim small gem rewards." },
  ] },
  { title: "GUILD SERVICES", entries: [
    { id: "gems", name: "Gems & Support", detail: "Daily gems, gem shop, gold exchange, and Remove Ads." },
    { id: "temple", name: "Temple of Renewal", detail: "Heal injuries and restore fallen heroes." },
    { id: "operations", name: "Crisis Operations", detail: "Manage urgent threats and special deployments." },
    { id: "content", name: "Races & Classes Unlocks", detail: "Review earned and premium guild options." },
  ] },
  { title: "ARCHIVES", entries: [
    { id: "manual", name: "Monster Manual", detail: "Study encountered creatures and their weaknesses." },
    { id: "heroCodex", name: "Races & Classes Codex", detail: "Browse the peoples and disciplines of Eldoria." },
    { id: "skillCodex", name: "Skills & Abilities Codex", detail: "Inspect known combat techniques." },
    { id: "loreJournal", name: "Lore & Journal", detail: "Revisit discoveries, history, and story records." },
    { id: "settings", name: "Settings & Accessibility", detail: "Adjust combat presentation and confirmations." },
  ] },
];

interface GuildManagementScreenProps {
  onBack(): void; openGemsSupport(): void; openGuildmasterSkills(): void; openHeroes(): void; openTemple(): void; openMonsterManual(): void;
  openHeroCodex(): void; openSkillCodex(): void; openLoreJournal(): void; openFinances(): void; openOperations(): void;
  openLegacy(): void; openAchievements(): void; openContentUnlocks(): void; openSettings(): void;
}

export function GuildManagementScreen(props: GuildManagementScreenProps) {
  const notices = useActionNotifications();
  const [section, setSection] = useState<"Command" | "Services" | "Archives">("Command");
  const group = GROUPS[section === "Command" ? 0 : section === "Services" ? 1 : 2]!;
  const actions: Record<EntryId, () => void> = {
    gems: props.openGemsSupport, guildmaster: props.openGuildmasterSkills, roster: props.openHeroes, temple: props.openTemple,
    operations: props.openOperations, legacy: props.openLegacy, achievements: props.openAchievements, content: props.openContentUnlocks,
    finances: props.openFinances, manual: props.openMonsterManual, heroCodex: props.openHeroCodex,
    skillCodex: props.openSkillCodex, loreJournal: props.openLoreJournal, settings: props.openSettings,
  };
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={props.onBack} />
    <Text style={styles.title}>Guild Management</Text>
    <Text style={styles.intro}>Command the guild, maintain its services, and consult its growing archives.</Text>
    <Panel style={styles.shortcut}><Text style={styles.shortcutTitle}>EVERYDAY ACTIONS</Text><Text style={styles.shortcutText}>Recruitment, Training Hall, Quests, World, Heroes, and Inventory remain one tap away in the main navigation.</Text></Panel>
    <SegmentedTabs values={["Command", "Services", "Archives"] as const} value={section} onChange={setSection}/>
    <View style={styles.group}>
      <Text style={styles.section}>{group.title}</Text>
      {group.entries.map((entry) => <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Open ${entry.name}`} onPress={actions[entry.id]}>
        <Panel style={[styles.row, entry.id==="temple"?styles.serviceGreen:entry.id==="operations"?styles.serviceRed:entry.id==="gems"||entry.id==="content"?styles.serviceBlue:entry.id==="guildmaster"||entry.id==="legacy"||entry.id==="achievements"?styles.serviceGold:undefined]}><View style={styles.copy}><Text style={styles.name}>{entry.name}</Text><Text style={styles.detail}>{entry.detail}</Text></View>{(entry.id === "gems" && notices.daily || entry.id === "guildmaster" && notices.guildmaster || entry.id === "roster" && notices.heroes || entry.id === "achievements" && notices.achievements) ? <NotificationDot/> : null}<Text style={styles.arrow}>›</Text></Panel>
      </Pressable>)}
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 44 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 12 }, intro: { color: colors.muted, lineHeight: 20, marginVertical: 12 },
  shortcut: { marginBottom: 18 }, shortcutTitle: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }, shortcutText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  group: { marginBottom: 10 }, section: { color: colors.gold, fontSize: 13, fontWeight: "900", letterSpacing: 1.5, marginBottom: 8 }, row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 9, minHeight: 76 },
  serviceGold:{borderLeftColor:colors.gold,borderLeftWidth:3},serviceGreen:{borderLeftColor:colors.green,borderLeftWidth:3},serviceBlue:{borderLeftColor:colors.blue,borderLeftWidth:3},serviceRed:{borderLeftColor:colors.danger,borderLeftWidth:3},copy: { flex: 1, paddingRight: 12 }, name: { color: colors.text, fontSize: 17, fontWeight: "800" }, detail: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 }, arrow: { color: colors.gold, fontSize: 30 },
  futureButton: { alignItems: "center", borderColor: colors.border, borderTopWidth: 1, marginTop: 6, paddingVertical: 15 }, futureLabel: { color: colors.muted, fontSize: 12, fontWeight: "900", letterSpacing: 1.1 }, futurePanel: { marginBottom: 10 },
});
