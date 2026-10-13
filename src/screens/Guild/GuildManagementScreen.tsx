import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BackButton } from "../../components/ui";
import { compactResourceAmount } from "../../ui/compactResourceAmount";
import { GuildCrest } from "../../components/guild/GuildCrest";
import { NotificationDot } from "../../components/navigation/NotificationDot";
import { GameIcon } from "../../components/icons/GameIcon";
import type { GameIconId } from "../../data/ui/gameIcons";
import { useActionNotifications } from "../../state/useActionNotifications";
import { useGuild } from "../../state/GuildContext";
import { useTheme } from "../../theme/theme";
import { GuidedTip } from "../../components/onboarding/GuidedTip";
import { markGuidedScreenTipSeen, shouldShowGuidedScreenTip } from "../../game/onboarding/screenTutorialService";
import { getGuildHallPriority, type GuildHallDestination } from "../../game/guild/guildManagementPriorityService";

type EntryId = "gems" | "guildmaster" | "roster" | "temple" | "operations" | "legacy" | "achievements" | "content" | "finances" | "manual" | "heroCodex" | "skillCodex" | "loreJournal" | "settings";
type Entry = { id: EntryId; name: string; detail: string; iconId: GameIconId };
const PRIORITY_ICONS: Record<GuildHallDestination, GameIconId> = {
  guildmaster: "guild", roster: "heroes", finances: "calendar",
  temple: "temple", achievements: "victory", gems: "gold",
};
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
  const { width: viewportWidth } = useWindowDimensions();
  const narrow = viewportWidth <= 350;
  const [archivesExpanded, setArchivesExpanded] = useState(false);
  const showGuide = shouldShowGuidedScreenTip(guild, "guild_management");
  const priority = useMemo(
    () => getGuildHallPriority(guild, notices),
    [guild, notices.guildmaster, notices.achievements, notices.daily],
  );
  const readyHeroes = guild.heroes.filter((hero) => hero.currentHP > 0 && hero.isAvailable).length;
  const templeNeedsAttention = guild.heroes.some((hero) =>
    hero.currentHP <= 0 || hero.conditions.some((condition) => condition.conditionId !== "inspired"));
  const actions: Record<EntryId, () => void> = {
    gems: props.openGemsSupport, guildmaster: props.openGuildmasterSkills, roster: props.openHeroes, temple: props.openTemple,
    operations: props.openOperations, legacy: props.openLegacy, achievements: props.openAchievements, content: props.openContentUnlocks,
    finances: props.openFinances, manual: props.openMonsterManual, heroCodex: props.openHeroCodex,
    skillCodex: props.openSkillCodex, loreJournal: props.openLoreJournal, settings: props.openSettings,
  };
  const notified = (id: EntryId) => (id === "gems" && notices.daily) ||
    (id === "guildmaster" && notices.guildmaster) ||
    (id === "roster" && notices.heroes) ||
    (id === "temple" && templeNeedsAttention) ||
    (id === "achievements" && notices.achievements);
  const priorityColor = priority?.tone === "urgent" ? c.danger : priority?.tone === "warning" ? c.gold : priority?.tone === "ready" ? c.green : c.blue;
  const accent = (id: EntryId) => id === "temple" ? c.green : id === "operations" ? c.danger : id === "gems" || id === "content" ? c.blue : c.gold;
  const sectionHeading = (label: string) => <View style={styles.sectionHeading}>
    <Text style={[styles.sectionTitle, { color: c.gold }]}>{label}</Text>
    <View style={[styles.sectionRule, { backgroundColor: c.border }]} />
  </View>;

  const serviceRows = (entries: readonly Entry[]) => entries.map((entry, index) =>
    <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Open ${entry.name}`} onPress={actions[entry.id]}
      style={({ pressed }) => [styles.listRow, { borderBottomColor: c.border }, index === entries.length - 1 && styles.lastRow, pressed && { backgroundColor: c.panel2 }]}>
      <View style={[styles.rowAccent, { backgroundColor: accent(entry.id) }]} />
      <GameIcon id={entry.iconId} size={25} framed={false} />
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={[styles.rowName, { color: c.text }]}>{entry.name}</Text>
        <Text numberOfLines={1} style={[styles.rowDetail, { color: c.muted }]}>{entry.detail}</Text>
      </View>
      {notified(entry.id) ? <NotificationDot label={`${entry.name}: action available`} /> : null}
      <Text style={[styles.chevron, { color: c.gold }]}>›</Text>
    </Pressable>);

  return <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.content}>
    <View style={styles.topBar}>
      <BackButton onPress={props.onBack} />
      <Pressable accessibilityRole="button" accessibilityLabel="Open settings and accessibility" onPress={props.openSettings}
        style={({ pressed }) => [styles.settingsButton, { backgroundColor: c.panel2, borderColor: pressed ? c.gold : c.border }]}>
        <GameIcon id="management" size={22} framed={false} />
      </Pressable>
    </View>
    <View style={styles.header}>
      <GuildCrest crestId={guild.guildCrestId} size={40} />
      <View style={styles.headerCopy}>
        <Text numberOfLines={1} style={[styles.eyebrow, { color: c.gold }]}>MANAGEMENT · {guild.guildName.toUpperCase()}</Text>
        <Text style={[styles.title, { color: c.text }]}>Guild Hall</Text>
      </View>
    </View>

    {showGuide && <GuidedTip step="SCREEN GUIDE · MANAGEMENT" title="Your Guild Hall" message="Review the next urgent task, then open a service. Expand Archives for your reference books; settings is in the top corner." onDismiss={() => updateGuild((current) => markGuidedScreenTipSeen(current, "guild_management"))} />}

    <View style={[styles.ledger, { backgroundColor: c.panel2, borderColor: c.border }]}>
      <View accessible accessibilityLabel={`Guild day ${guild.currentDay}`} style={styles.ledgerCell}>
        <Text style={[styles.ledgerLabel, { color: c.muted }]}>GUILD DAY</Text>
        <Text style={[styles.ledgerValue, { color: c.text }]}>{guild.currentDay}</Text>
      </View>
      <View style={[styles.ledgerDivider, { backgroundColor: c.border }]} />
      <View accessible accessibilityLabel={`${readyHeroes} of ${guild.heroes.length} heroes available`} style={styles.ledgerCell}>
        <Text style={[styles.ledgerLabel, { color: c.muted }]}>FIELD READY</Text>
        <Text style={[styles.ledgerValue, { color: readyHeroes === 0 && guild.heroes.length > 0 ? c.danger : c.text }]}>{readyHeroes}/{guild.heroes.length}</Text>
      </View>
      <View style={[styles.ledgerDivider, { backgroundColor: c.border }]} />
      <View accessible accessibilityLabel={`Treasury: ${guild.gold} gold`} style={styles.ledgerCell}>
        <Text style={[styles.ledgerLabel, { color: c.muted }]}>TREASURY</Text>
        <Text numberOfLines={1} style={[styles.ledgerValue, { color: c.gold }]}>{compactResourceAmount(guild.gold)} G</Text>
      </View>
    </View>

    {priority ? <Pressable accessibilityRole="button"
      accessibilityLabel={`${priority.title}. Open ${priority.destination === "roster" ? "Roster & Payroll" : priority.destination === "guildmaster" ? "Guildmaster Skills" : priority.destination === "gems" ? "Gems & Support" : priority.destination === "finances" ? "Calendar & Finances" : priority.destination === "temple" ? "Temple of Renewal" : "Achievements"}`}
      onPress={actions[priority.destination]}
      style={({ pressed }) => [styles.priority, { backgroundColor: pressed ? c.panel2 : c.panel, borderColor: priorityColor }]}>
      <View style={[styles.priorityStripe, { backgroundColor: priorityColor }]} />
      <View style={styles.priorityIcon}><GameIcon id={PRIORITY_ICONS[priority.destination]} size={31} framed={false} /></View>
      <View style={styles.priorityBody}>
        <View style={styles.priorityTop}>
          <Text style={[styles.priorityKicker, { color: priorityColor }]}>NEXT GUILD ACTION</Text>
          <Text style={[styles.priorityState, { color: priorityColor }]}>{priority.tone === "urgent" ? "URGENT" : priority.tone === "warning" ? "ATTENTION" : priority.tone === "ready" ? "READY" : "REVIEW"}</Text>
        </View>
        <Text numberOfLines={2} style={[styles.priorityTitle, { color: c.text }]}>{priority.title}</Text>
        <Text numberOfLines={2} style={[styles.priorityDescription, { color: c.muted }]}>{priority.description}</Text>
      </View>
      <Text style={[styles.priorityArrow, { color: priorityColor }]}>›</Text>
    </Pressable> : <View accessible accessibilityLabel="Guild management: all clear" style={[styles.allClear, { backgroundColor: c.panel, borderColor: c.border }]}>
      <GameIcon id="victory" size={24} framed={false} />
      <View style={styles.allClearCopy}>
        <Text style={[styles.allClearTitle, { color: c.green }]}>GUILD IN ORDER</Text>
        <Text style={[styles.allClearDetail, { color: c.muted }]}>No outstanding guild administration tasks.</Text>
      </View>
    </View>}

    {sectionHeading("GUILD ADMINISTRATION")}
    <View style={styles.primaryGrid}>{PRIMARY.map((entry) =>
      <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Open ${entry.name}`} onPress={actions[entry.id]}
        style={({ pressed }) => [styles.primaryCard, narrow && styles.primaryCardNarrow, { backgroundColor: pressed ? c.panel2 : c.panel, borderColor: pressed ? c.gold : c.border, borderTopColor: accent(entry.id) }]}>
        <View style={styles.primaryTop}>
          <GameIcon id={entry.iconId} size={narrow ? 26 : 29} framed={false} />
          {notified(entry.id) ? <NotificationDot label={`${entry.name}: action available`} /> : null}
        </View>
        <Text numberOfLines={2} style={[styles.primaryName, narrow && styles.primaryNameNarrow, { color: c.text }]}>{entry.name}</Text>
        <Text numberOfLines={1} style={[styles.primaryDetail, { color: c.muted }]}>{entry.detail}</Text>
      </Pressable>
    )}</View>

    {sectionHeading("OTHER GUILD SERVICES")}
    <View style={[styles.list, { backgroundColor: c.panel, borderColor: c.border }]}>{serviceRows(SERVICES)}</View>

    <Pressable accessibilityRole="button" accessibilityState={{ expanded: archivesExpanded }}
      accessibilityLabel={archivesExpanded ? "Collapse Archives and Codex" : "Expand Archives and Codex"}
      onPress={() => setArchivesExpanded((current) => !current)}
      style={({ pressed }) => [styles.archivesToggle, { backgroundColor: c.panel, borderColor: archivesExpanded ? c.gold : c.border }, pressed && { backgroundColor: c.panel2 }]}>
      <GameIcon id="journal" size={26} framed={false} />
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
  content: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 42 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 44, marginBottom: 4 },
  header: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 10 },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: .6 },
  title: { fontSize: 23, fontWeight: "900", lineHeight: 28 },
  settingsButton: { alignItems: "center", borderRadius: 9, borderWidth: 1, justifyContent: "center", height: 42, width: 44 },
  ledger: { alignItems: "center", borderRadius: 9, borderWidth: 1, flexDirection: "row", marginBottom: 9, minHeight: 45, overflow: "hidden" },
  ledgerCell: { alignItems: "center", flex: 1, gap: 2, justifyContent: "center", minWidth: 0, paddingHorizontal: 4, paddingVertical: 6 },
  ledgerDivider: { height: 22, width: 1 },
  ledgerLabel: { fontSize: 8, fontWeight: "900", letterSpacing: .5 },
  ledgerValue: { fontSize: 13, fontWeight: "900" },
  priority: { borderRadius: 10, borderWidth: 1, flexDirection: "row", marginBottom: 11, overflow: "hidden", minHeight: 89 },
  priorityStripe: { width: 3 },
  priorityIcon: { alignItems: "center", justifyContent: "center", paddingLeft: 8, width: 42 },
  priorityBody: { flex: 1, gap: 3, paddingHorizontal: 7, paddingVertical: 9, minWidth: 0 },
  priorityTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 3 },
  priorityKicker: { fontSize: 8, fontWeight: "900", letterSpacing: .55 },
  priorityState: { fontSize: 8, fontWeight: "900" },
  priorityTitle: { fontSize: 13, fontWeight: "900", lineHeight: 17 },
  priorityDescription: { fontSize: 10, lineHeight: 14 },
  priorityArrow: { alignSelf: "center", fontSize: 24, marginRight: 8 },
  allClear: { alignItems: "center", borderRadius: 9, borderWidth: 1, flexDirection: "row", gap: 9, marginBottom: 11, paddingHorizontal: 10, paddingVertical: 9 },
  allClearCopy: { flex: 1, gap: 2 },
  allClearTitle: { fontSize: 10, fontWeight: "900", letterSpacing: .5 },
  allClearDetail: { fontSize: 10 },
  sectionHeading: { alignItems: "center", flexDirection: "row", gap: 9, marginBottom: 7, marginTop: 4 },
  sectionTitle: { fontSize: 10, fontWeight: "900", letterSpacing: .9 },
  sectionRule: { flex: 1, height: StyleSheet.hairlineWidth },
  primaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 },
  primaryCard: { borderRadius: 9, borderWidth: 1, borderTopWidth: 2, flexBasis: "47%", flexGrow: 1, gap: 4, justifyContent: "center", minHeight: 94, minWidth: 0, padding: 9 },
  primaryCardNarrow: { minHeight: 89, padding: 8 },
  primaryTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
  primaryName: { fontSize: 13, fontWeight: "900", lineHeight: 16 },
  primaryNameNarrow: { fontSize: 12, lineHeight: 15 },
  primaryDetail: { fontSize: 10, lineHeight: 13 },
  list: { borderRadius: 9, borderWidth: 1, marginBottom: 11, overflow: "hidden" },
  listRow: { alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 8, minHeight: 50, paddingHorizontal: 9, paddingVertical: 5 },
  lastRow: { borderBottomWidth: 0 },
  rowAccent: { borderRadius: 2, height: 23, width: 3 },
  rowCopy: { flex: 1, gap: 2, minWidth: 0 },
  rowName: { fontSize: 12, fontWeight: "800" },
  rowDetail: { fontSize: 10 },
  chevron: { fontSize: 21, fontWeight: "700", paddingHorizontal: 2 },
  archivesToggle: { alignItems: "center", borderRadius: 9, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 55, paddingHorizontal: 11, paddingVertical: 8 },
  archivesCopy: { flex: 1, gap: 2 },
  archivesName: { fontSize: 13, fontWeight: "900" },
  archivesCount: { fontSize: 10 },
  archivesChevron: { fontSize: 23, fontWeight: "900" },
  archivesList: { marginTop: 7 },
});
