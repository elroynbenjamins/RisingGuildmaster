import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton, Panel, SegmentedTabs, colors } from "../../components/ui";

import { NotificationDot } from "../../components/navigation/NotificationDot";
import { GameIcon } from "../../components/icons/GameIcon";
import type { GameIconId } from "../../data/ui/gameIcons";
import { useActionNotifications } from "../../state/useActionNotifications";
type EntryId = "gems" | "guildmaster" | "roster" | "temple" | "operations" | "legacy" | "achievements" | "content" | "finances" | "manual" | "heroCodex" | "skillCodex" | "loreJournal" | "settings";
type Entry = { id: EntryId; name: string; detail: string };
const ENTRY_ICONS: Record<EntryId,GameIconId> = { gems:"gold", guildmaster:"management", roster:"heroes", temple:"temple", operations:"management", legacy:"victory", achievements:"victory", content:"hero_codex", finances:"calendar", manual:"monster_manual", heroCodex:"hero_codex", skillCodex:"skill_codex", loreJournal:"journal", settings:"management" };

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
    <SegmentedTabs values={["Command", "Services", "Archives"] as const} value={section} onChange={setSection}/>
    <View style={styles.group}>
      <Text style={styles.section}>{group.title}</Text>
      <View style={styles.entryGrid}>{group.entries.map((entry) => {
        const notified = entry.id === "gems" && notices.daily || entry.id === "guildmaster" && notices.guildmaster || entry.id === "roster" && notices.heroes || entry.id === "achievements" && notices.achievements;
        return <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Open ${entry.name}`} onPress={actions[entry.id]} style={styles.entryPressable}>
          <Panel style={[styles.tile, entry.id==="temple"?styles.serviceGreen:entry.id==="operations"?styles.serviceRed:entry.id==="gems"||entry.id==="content"?styles.serviceBlue:entry.id==="guildmaster"||entry.id==="legacy"||entry.id==="achievements"?styles.serviceGold:undefined]}>
            <View style={styles.tileTop}><View style={styles.iconPlate}><GameIcon id={ENTRY_ICONS[entry.id]} size={28}/></View><View style={styles.tileSignals}>{notified ? <NotificationDot/> : null}<Text style={styles.arrow}>›</Text></View></View>
            <Text style={styles.name}>{entry.name}</Text><Text numberOfLines={2} style={styles.detail}>{entry.detail}</Text>
          </Panel>
        </Pressable>;
      })}</View>
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 44 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 12 }, intro: { color: colors.muted, lineHeight: 20, marginVertical: 12 },
  group: { marginBottom: 10 }, section: { color: colors.gold, fontSize: 13, fontWeight: "900", letterSpacing: 1.5, marginBottom: 8 },
  entryGrid:{flexDirection:"row",flexWrap:"wrap",gap:8},entryPressable:{flexBasis:"47%",flexGrow:1,minWidth:138},
  tile:{minHeight:126,justifyContent:"flex-start",padding:11},tileTop:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",marginBottom:8},tileSignals:{alignItems:"center",flexDirection:"row",gap:5},
  serviceGold:{borderTopColor:colors.gold,borderTopWidth:3},serviceGreen:{borderTopColor:colors.green,borderTopWidth:3},serviceBlue:{borderTopColor:colors.blue,borderTopWidth:3},serviceRed:{borderTopColor:colors.danger,borderTopWidth:3},iconPlate:{alignItems:"center",justifyContent:"center",width:32},name:{color:colors.text,fontSize:15,fontWeight:"800",lineHeight:19},detail:{color:colors.muted,fontSize:11,lineHeight:15,marginTop:4},arrow:{color:colors.gold,fontSize:22},
  futureButton: { alignItems: "center", borderColor: colors.border, borderTopWidth: 1, marginTop: 6, paddingVertical: 15 }, futureLabel: { color: colors.muted, fontSize: 12, fontWeight: "900", letterSpacing: 1.1 }, futurePanel: { marginBottom: 10 },
});
