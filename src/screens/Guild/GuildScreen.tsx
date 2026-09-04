import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { GameIcon } from "../../components/icons/GameIcon";
import { ActionButton, EmptyState, Panel, Portrait, SectionTitle, colors } from "../../components/ui";
import type { GameIconId } from "../../data/ui/gameIcons";
import { GAME_CONFIG } from "../../config/gameConfig";
import { advanceGuildTime, dailyTavernIncome, previewNextGuildDay } from "../../game/economy/guildCalendarService";
import { getGuildPriority, type GuildPriorityDestination } from "../../game/guild/guildPriorityService";
import { guildmasterXpToNextLevel } from "../../game/guildmaster/guildmasterProgression";
import { useGuild } from "../../state/GuildContext";
import { getGuildNotifications } from "../../ui/guildStatus";
import { getRaceNameColor } from "../../ui/raceColors";
import { useTheme } from "../../theme/theme";

import { NotificationDot } from "../../components/navigation/NotificationDot";
import { useActionNotifications } from "../../state/useActionNotifications";
type Destination = "guildmasterSkills" | GuildPriorityDestination | "heroes";
const QUICK_ACTIONS: { label: string; target: Destination; iconId: GameIconId }[] = [{ label: "Recruit", target: "recruitment", iconId: "recruitment" }, { label: "Train", target: "training", iconId: "training" }, { label: "Temple", target: "temple", iconId: "temple" }, { label: "Manage", target: "management", iconId: "management" }];

export function GuildScreen({ navigate }: { navigate(destination: Destination): void }) {
  const { showDialog } = useGameDialog();
  const { colors: themeColors } = useTheme();
  const { guild, updateGuild } = useGuild();
  const recent = guild.recentPartyHeroIds.map((id) => guild.heroes.find((hero) => hero.id === id)).filter((hero): hero is NonNullable<typeof hero> => Boolean(hero));
  const notifications = getGuildNotifications(guild);
  const notices = useActionNotifications();
  const xpRequired = guildmasterXpToNextLevel(guild.guildmaster.level);
  const priority = getGuildPriority(guild);
  const nextDay = previewNextGuildDay(guild);
  const tavernIncome = dailyTavernIncome(guild);
  const endDay = () => showDialog({ title: "End Guild Day?", message: `Advance to Day ${nextDay.targetDay}?\n\nHeroes recover ${GAME_CONFIG.adventureStaminaRecoveryPerDay} readiness and the tavern earns ${tavernIncome} gold.`, eyebrow: "ADVANCE CALENDAR", actions: [{ label: "Cancel", tone: "secondary" }, { label: "End Day", tone: "primary", onPress: () => { const result = advanceGuildTime(guild); updateGuild(result.guild); const resolution = result.days[0]; showDialog({ title: `Day ${resolution?.day ?? result.guild.currentDay}`, message: resolution?.events.map((event) => event.text).join("\n") || "A quiet day passes in Guildhaven.", tone: "success" }); } }] });

  return <ScrollView style={{ backgroundColor: themeColors.background }} contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>GUILD HALL</Text><View style={styles.titleRow}><Text style={styles.title}>Command Center</Text><Text style={styles.day}>DAY {guild.currentDay}</Text></View>
    <Pressable onPress={() => navigate("guildmasterSkills")}><Panel style={styles.guildmaster}><View style={styles.levelBadge}><Text style={styles.levelLabel}>GUILDMASTER</Text><Text style={styles.level}>LV {guild.guildmaster.level}</Text></View><View style={styles.flex}><Text style={styles.progress}>{guild.guildmaster.xp} / {xpRequired} XP | {guild.guildmaster.skillPoints} skill point{guild.guildmaster.skillPoints === 1 ? "" : "s"}</Text><View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, guild.guildmaster.xp / xpRequired * 100)}%` }]} /></View><Text style={styles.manageHint}>Tap to develop leadership skills</Text></View>{notices.guildmaster ? <NotificationDot label="Guildmaster skill available"/> : null}</Panel></Pressable>
    <View style={styles.quick}>{QUICK_ACTIONS.map((action) => <Pressable key={action.target} onPress={() => navigate(action.target)} style={styles.quickButton}><GameIcon id={action.iconId} size={34} framed={false} /><Text style={styles.quickLabel}>{action.label}</Text>{action.target === "management" && notices.manage ? <NotificationDot/> : null}</Pressable>)}</View>
    <SectionTitle>GUILDMASTER'S PRIORITY</SectionTitle><Panel style={[styles.priority, priority.tone === "urgent" && styles.priorityUrgent]}><GameIcon id={priority.iconId} size={58} /><View style={styles.priorityCopy}><Text style={styles.priorityTitle}>{priority.title}</Text><Text style={styles.priorityText}>{priority.description}</Text><ActionButton label={priority.actionLabel} onPress={() => navigate(priority.destination)} /></View></Panel>
    <SectionTitle>CALENDAR</SectionTitle><Panel style={styles.calendar}><View style={styles.calendarCopy}><Text style={styles.calendarTitle}>Advance to Day {nextDay.targetDay}</Text><Text style={styles.calendarText}>Daily tavern income: {tavernIncome} gold</Text><Text style={styles.calendarText}>Readiness recovery: +{GAME_CONFIG.adventureStaminaRecoveryPerDay}</Text>{nextDay.payrollDue > 0 && <Text style={styles.warning}>Payroll due: {nextDay.payrollDue} gold</Text>}</View><View style={styles.endDay}><ActionButton label="End Day" onPress={endDay} /></View></Panel>
    <SectionTitle>RECENT PARTY</SectionTitle>{recent.length ? <Panel style={styles.party}>{recent.map((hero) => <View key={hero.id} style={styles.member}><Portrait hero={hero} size={55} /><Text numberOfLines={1} style={[styles.memberName, { color: getRaceNameColor(hero.raceId) }]}>{hero.name}</Text></View>)}</Panel> : <EmptyState title="No recent party" message="Assemble a party from a quest and your latest adventurers will appear here." actionLabel="View heroes" onAction={() => navigate("heroes")} />}
    <SectionTitle>NOTIFICATIONS</SectionTitle><Panel>{notifications.map((item) => <View key={item.id} style={styles.notice}><View style={[styles.dot, item.tone === "warning" && styles.warningDot]} /><Text style={styles.noticeText}>{item.text}</Text></View>)}</Panel>
  </ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 35 }, eyebrow: { color: colors.gold, fontWeight: "900", letterSpacing: 2 }, titleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginBottom: 11, marginTop: 4 }, day: { color: colors.gold, fontWeight: "900" }, guildmaster: { alignItems: "center", borderColor: colors.gold, flexDirection: "row", gap: 10, marginBottom: 12 }, levelBadge: { minWidth: 82 }, levelLabel: { color: colors.gold, fontSize: 8, fontWeight: "900" }, level: { color: colors.text, fontSize: 19, fontWeight: "900", marginTop: 2 }, flex: { flex: 1 }, progress: { color: colors.text, fontSize: 10, fontWeight: "800" }, track: { backgroundColor: colors.panel2, borderRadius: 4, height: 6, marginTop: 5, overflow: "hidden" }, fill: { backgroundColor: colors.green, height: "100%" }, manageHint: { color: colors.muted, fontSize: 8, marginTop: 4 }, quick: { flexDirection: "row", gap: 8 }, quickButton: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 78 }, quickLabel: { color: colors.text, fontSize: 10, fontWeight: "700", marginTop: 4 }, priority: { alignItems: "flex-start", borderColor: colors.gold, flexDirection: "row", gap: 12 }, priorityUrgent: { borderColor: colors.danger }, priorityCopy: { flex: 1 }, priorityTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, priorityText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginBottom: 9, marginTop: 4 }, calendar: { alignItems: "center", borderColor: colors.gold, flexDirection: "row", gap: 10 }, calendarCopy: { flex: 1 }, calendarTitle: { color: colors.text, fontSize: 16, fontWeight: "900" }, calendarText: { color: colors.muted, fontSize: 11, marginTop: 4 }, warning: { color: colors.danger, fontSize: 11, fontWeight: "900", marginTop: 4 }, endDay: { width: 105 }, party: { flexDirection: "row", justifyContent: "space-around" }, member: { alignItems: "center", width: "24%" }, memberName: { fontSize: 11, marginTop: 5 }, notice: { alignItems: "center", flexDirection: "row", gap: 9, paddingVertical: 7 }, dot: { backgroundColor: colors.green, borderRadius: 4, height: 7, width: 7 }, warningDot: { backgroundColor: colors.danger }, noticeText: { color: colors.text, flex: 1 } });
