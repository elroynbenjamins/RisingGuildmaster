import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../../components/ui";
import { GuildCrest } from "../../components/guild/GuildCrest";
import { NotificationDot } from "../../components/navigation/NotificationDot";
import { GameIcon } from "../../components/icons/GameIcon";
import type { GameIconId } from "../../data/ui/gameIcons";
import { useActionNotifications } from "../../state/useActionNotifications";
import { useGuild } from "../../state/GuildContext";
import { useTheme } from "../../theme/theme";
import { GuidedTip } from "../../components/onboarding/GuidedTip";
import { markGuidedScreenTipSeen, shouldShowGuidedScreenTip } from "../../game/onboarding/screenTutorialService";
import { getGuildHallPriority } from "../../game/guild/guildManagementPriorityService";

type EntryId = "gems" | "guildmaster" | "roster" | "temple" | "operations" | "legacy" | "achievements" | "content" | "finances" | "manual" | "heroCodex" | "skillCodex" | "loreJournal" | "settings";
type Entry = { id: EntryId; name: string; detail: string; iconId: GameIconId };
const PRIMARY: readonly Entry[] = [
  { id: "guildmaster", name: "Guildmaster Skills", detail: "Leadership upgrades", iconId: "guild" },
  { id: "roster", name: "Roster & Payroll", detail: "Heroes and salaries", iconId: "heroes" },
  { id: "finances", name: "Calendar & Finances", detail: "Days and treasury", iconId: "calendar" },
  { id: "temple", name: "Temple of Renewal", detail: "Heal and revive", iconId: "temple" },
];
const SERVICES: readonly Entry[] = [
  { id: "operations", name: "Crisis Operations", detail: "Regional threats", iconId: "management" },
  { id: "legacy", name: "Renown & Trophy Hall", detail: "Guild reputation", iconId: "victory" },
  { id: "achievements", name: "Achievements", detail: "Milestones and rewards", iconId: "victory" },
  { id: "content", name: "Races & Classes Unlocks", detail: "Unlock collection", iconId: "hero_codex" },
  { id: "gems", name: "Gems & Support", detail: "Daily rewards and store", iconId: "gold" },
];
const ARCHIVES: readonly Entry[] = [
  { id: "manual", name: "Monster Manual", detail: "Enemy weaknesses", iconId: "monster_manual" },
  { id: "heroCodex", name: "Races & Classes Codex", detail: "People and classes", iconId: "hero_codex" },
  { id: "skillCodex", name: "Skills & Abilities Codex", detail: "Combat techniques", iconId: "skill_codex" },
  { id: "loreJournal", name: "Lore & Journal", detail: "Story and discoveries", iconId: "journal" },
];

interface GuildManagementScreenProps {
  onBack(): void; openGemsSupport(): void; openGuildmasterSkills(): void; openHeroes(): void; openTemple(): void; openMonsterManual(): void;
  openHeroCodex(): void; openSkillCodex(): void; openLoreJournal(): void; openFinances(): void; openOperations(): void;
  openLegacy(): void; openAchievements(): void; openContentUnlocks(): void; openSettings(): void;
}

export function GuildManagementScreen(props: GuildManagementScreenProps) {
  const notices = useActionNotifications();
  const { guild, updateGuild } = useGuild();
  const { colors: c } = useTheme();
  const [archivesExpanded, setArchivesExpanded] = useState(false);
  const showGuide = shouldShowGuidedScreenTip(guild, "guild_management");
  const priority = getGuildHallPriority(guild, notices);
  const actions: Record<EntryId, () => void> = {
    gems: props.openGemsSupport, guildmaster: props.openGuildmasterSkills, roster: props.openHeroes, temple: props.openTemple,
    operations: props.openOperations, legacy: props.openLegacy, achievements: props.openAchievements, content: props.openContentUnlocks,
    finances: props.openFinances, manual: props.openMonsterManual, heroCodex: props.openHeroCodex,
    skillCodex: props.openSkillCodex, loreJournal: props.openLoreJournal, settings: props.openSettings,
  };
  const notified = (id: EntryId) => (id === "gems" && notices.daily) ||
    (id === "guildmaster" && notices.guildmaster) ||
    (id === "roster" && notices.heroes) ||
    (id === "achievements" && notices.achievements);
  const priorityColor = priority.tone === "urgent" ? c.danger : priority.tone === "warning" ? c.gold : priority.tone === "ready" ? c.green : c.blue;
  const accent = (id: EntryId) => id === "temple" ? c.green : id === "operations" ? c.danger : id === "gems" || id === "content" ? c.blue : c.gold;

  const serviceRows = (entries: readonly Entry[]) => entries.map((entry, index) =>
    <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Open ${entry.name}`} onPress={actions[entry.id]}
      style={({ pressed }) => [styles.listRow, { borderBottomColor: c.border }, index === entries.length - 1 && styles.lastRow, pressed && { backgroundColor: c.panel2 }]}>
      <View style={[styles.rowAccent, { backgroundColor: accent(entry.id) }]} />
      <GameIcon id={entry.iconId} size={27} framed={false} />
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={[styles.rowName, { color: c.text }]}>{entry.name}</Text>
        <Text numberOfLines={1} style={[styles.rowDetail, { color: c.muted }]}>{entry.detail}</Text>
      </View>
      {notified(entry.id) ? <NotificationDot label={`${entry.name}: action available`} /> : null}
      <Text style={[styles.chevron, { color: c.gold }]}>›</Text>
    </Pressable>);

  return <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.content}>
    <BackButton onPress={props.onBack} />
    <View style={styles.header}>
      <GuildCrest crestId={guild.guildCrestId} size={43} />
      <View style={styles.headerCopy}>
        <Text numberOfLines={1} style={[styles.eyebrow, { color: c.gold }]}>{guild.guildName.toUpperCase()} · GUILD HALL</Text>
        <Text style={[styles.title, { color: c.text }]}>Guild Management</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Open settings and accessibility" onPress={props.openSettings}
        style={({ pressed }) => [styles.settingsButton, { backgroundColor: c.panel2, borderColor: c.border }, pressed && { borderColor: c.gold, opacity: .8 }]}>
        <GameIcon id="management" size={22} framed={false} />
        <Text style={[styles.settingsLabel, { color: c.muted }]}>SETTINGS</Text>
      </Pressable>
    </View>

    {showGuide && <GuidedTip step="SCREEN GUIDE · MANAGEMENT" title="Manage your Guild Hall" message="Your next guild priority is at the top. Use the four main services below, or expand Archives for reference books. Settings is beside the title." onDismiss={() => updateGuild((current) => markGuidedScreenTipSeen(current, "guild_management"))} />}

    <Pressable accessibilityRole="button" accessibilityLabel={`${priority.title}. Open ${priority.destination === "roster" ? "Roster & Payroll" : priority.destination === "guildmaster" ? "Guildmaster Skills" : priority.destination === "gems" ? "Gems & Support" : priority.destination === "finances" ? "Calendar & Finances" : priority.destination === "temple" ? "Temple of Renewal" : "Achievements"}`} onPress={actions[priority.destination]}
      style={({ pressed }) => [styles.priority, { backgroundColor: c.panel, borderColor: priorityColor }, pressed && { backgroundColor: c.panel2 }]}>
      <View style={[styles.priorityStripe, { backgroundColor: priorityColor }]} />
      <View style={styles.priorityBody}>
        <View style={styles.priorityTop}>
          <Text style={[styles.priorityKicker, { color: priorityColor }]}>GUILD PRIORITY</Text>
          <Text style={[styles.priorityState, { color: priorityColor }]}>{priority.tone === "urgent" ? "URGENT" : priority.tone === "warning" ? "ATTENTION" : priority.tone === "ready" ? "READY" : "REVIEW"}</Text>
        </View>
        <Text numberOfLines={1} style={[styles.priorityTitle, { color: c.text }]}>{priority.title}</Text>
        <Text numberOfLines={2} style={[styles.priorityDescription, { color: c.muted }]}>{priority.description}</Text>
      </View>
      <Text style={[styles.priorityArrow, { color: priorityColor }]}>›</Text>
    </Pressable>

    <Text style={[styles.sectionTitle, { color: c.gold }]}>GUILD ADMINISTRATION</Text>
    <View style={styles.primaryGrid}>{PRIMARY.map((entry) =>
      <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Open ${entry.name}`} onPress={actions[entry.id]}
        style={({ pressed }) => [styles.primaryCard, { backgroundColor: c.panel, borderColor: pressed ? c.gold : c.border }, pressed && { backgroundColor: c.panel2 }]}>
        <View style={styles.primaryTop}>
          <GameIcon id={entry.iconId} size={31} framed={false} />
          {notified(entry.id) ? <NotificationDot label={`${entry.name}: action available`} /> : null}
        </View>
        <Text numberOfLines={2} style={[styles.primaryName, { color: c.text }]}>{entry.name}</Text>
        <Text numberOfLines={1} style={[styles.primaryDetail, { color: c.muted }]}>{entry.detail}</Text>
      </Pressable>
    )}</View>

    <Text style={[styles.sectionTitle, { color: c.gold }]}>OTHER GUILD SERVICES</Text>
    <View style={[styles.list, { backgroundColor: c.panel, borderColor: c.border }]}>{serviceRows(SERVICES)}</View>

    <Pressable accessibilityRole="button" accessibilityState={{ expanded: archivesExpanded }}
      accessibilityLabel={archivesExpanded ? "Collapse Archives and Codex" : "Expand Archives and Codex"}
      onPress={() => setArchivesExpanded((current) => !current)}
      style={({ pressed }) => [styles.archivesToggle, { backgroundColor: c.panel, borderColor: archivesExpanded ? c.gold : c.border }, pressed && { backgroundColor: c.panel2 }]}>
      <GameIcon id="journal" size={28} framed={false} />
      <View style={styles.archivesCopy}>
        <Text style={[styles.archivesName, { color: c.text }]}>Archives & Codex</Text>
        <Text style={[styles.archivesCount, { color: c.muted }]}>{ARCHIVES.length} reference collections</Text>
      </View>
      <Text style={[styles.archivesChevron, { color: c.gold }]}>{archivesExpanded ? "⌃" : "⌄"}</Text>
    </Pressable>
    {archivesExpanded ? <View style={[styles.list, styles.archivesList, { backgroundColor: c.panel, borderColor: c.border }]}>{serviceRows(ARCHIVES)}</View> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 14, paddingTop: 6, paddingBottom: 46 },
  header: { alignItems: "center", flexDirection: "row", gap: 9, marginBottom: 14, marginTop: 2 },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: .7 },
  title: { fontSize: 21, fontWeight: "900", lineHeight: 26 },
  settingsButton: { alignItems: "center", borderRadius: 9, borderWidth: 1, gap: 2, justifyContent: "center", minHeight: 48, minWidth: 57, paddingHorizontal: 6 },
  settingsLabel: { fontSize: 8, fontWeight: "900", letterSpacing: .2 },
  priority: { borderRadius: 11, borderWidth: 1, flexDirection: "row", marginBottom: 12, overflow: "hidden", minHeight: 92 },
  priorityStripe: { width: 4 },
  priorityBody: { flex: 1, gap: 3, paddingHorizontal: 11, paddingVertical: 10 },
  priorityTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  priorityKicker: { fontSize: 9, fontWeight: "900", letterSpacing: .9 },
  priorityState: { fontSize: 9, fontWeight: "800" },
  priorityTitle: { fontSize: 14, fontWeight: "900" },
  priorityDescription: { fontSize: 10, lineHeight: 14 },
  priorityArrow: { alignSelf: "center", fontSize: 27, marginRight: 10 },
  sectionTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 1.1, marginBottom: 8, marginTop: 6 },
  primaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 13 },
  primaryCard: { borderRadius: 10, borderWidth: 1, flexBasis: "47%", flexGrow: 1, gap: 4, justifyContent: "center", minHeight: 102, minWidth: 132, padding: 10 },
  primaryTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
  primaryName: { fontSize: 13, fontWeight: "900", lineHeight: 17 },
  primaryDetail: { fontSize: 10, lineHeight: 13 },
  list: { borderRadius: 10, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  listRow: { alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 9, minHeight: 55, paddingHorizontal: 9, paddingVertical: 6 },
  lastRow: { borderBottomWidth: 0 },
  rowAccent: { borderRadius: 2, height: 24, width: 3 },
  rowCopy: { flex: 1, gap: 2, minWidth: 0 },
  rowName: { fontSize: 12, fontWeight: "800" },
  rowDetail: { fontSize: 10 },
  chevron: { fontSize: 23, fontWeight: "700", paddingHorizontal: 2 },
  archivesToggle: { alignItems: "center", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 10, minHeight: 60, paddingHorizontal: 12, paddingVertical: 9 },
  archivesCopy: { flex: 1, gap: 3 },
  archivesName: { fontSize: 13, fontWeight: "900" },
  archivesCount: { fontSize: 10 },
  archivesChevron: { fontSize: 24, fontWeight: "900" },
  archivesList: { marginTop: 7 },
});
