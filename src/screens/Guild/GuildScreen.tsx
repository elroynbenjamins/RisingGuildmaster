import React, { useEffect, useRef } from "react";
import { compactResourceAmount } from "../../ui/compactResourceAmount";
import { LocationArtwork } from "../../components/art/LocationArtwork";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { GameIcon } from "../../components/icons/GameIcon";
import { ActionButton, EmptyState, Panel, Portrait, SecondaryButton, SectionTitle, colors } from "../../components/ui";
import type { GameIconId } from "../../data/ui/gameIcons";
import { REGIONS } from "../../data/world/regions";
import { SETTLEMENTS } from "../../data/world/settlements";
import { GAME_CONFIG } from "../../config/gameConfig";
import { advanceGuildTime, dailyTavernIncome, findNextGuildPlannerEvent, previewNextGuildDay } from "../../game/economy/guildCalendarService";
import { getGuildCommandOrders, type GuildCommandDestination, type GuildCommandOrder } from "../../game/guild/guildCommandCenterService";
import { getGuildPriority, type GuildPriorityDestination } from "../../game/guild/guildPriorityService";
import { guildmasterXpToNextLevel } from "../../game/guildmaster/guildmasterProgression";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";
import { useTheme } from "../../theme/theme";
import { NotificationDot } from "../../components/navigation/NotificationDot";
import { useActionNotifications } from "../../state/useActionNotifications";
import { acknowledgeTimeAdvanceGuidance, CALENDAR_BASICS_GUIDANCE_FLAG, getTimeAdvanceGuidance, payrollWarningLine } from "../../game/onboarding/timeAndPayrollGuidanceService";

type Destination = "guildmasterSkills" | GuildPriorityDestination | GuildCommandDestination | "heroes" | "management";
const QUICK_ACTIONS: { label: string; target: Destination; iconId: GameIconId; sublabel: string }[] = [
  { label: "Recruit", target: "recruitment", iconId: "recruitment", sublabel: "Tavern Board" },
  { label: "Train", target: "training", iconId: "training", sublabel: "Training Hall" },
  { label: "Temple", target: "temple", iconId: "temple", sublabel: "Recovery" },
  { label: "Manage", target: "management", iconId: "management", sublabel: "Guild Services" },
];

const ORDER_TONE = {
  urgent: { border: colors.danger, label: "#ffaaa4" },
  warning: { border: colors.gold, label: colors.gold },
  ready: { border: colors.green, label: "#a8dfb4" },
  opportunity: { border: colors.blue, label: "#9cc9e5" },
} as const;

function CommandOrderCard({ item, onPress }: { item: GuildCommandOrder; onPress(): void }) {
  const tone = ORDER_TONE[item.tone];
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.badge}: ${item.title}. ${item.actionLabel}`} onPress={onPress} style={({ pressed }) => [styles.orderPressable, pressed && styles.pressed]}>
    <View style={[styles.orderCard, { borderColor: tone.border }]}>
      <View style={[styles.orderRail, { backgroundColor: tone.border }]} />
      <View style={styles.orderIcon}><GameIcon id={item.iconId} size={36} framed={false} /></View>
      <View style={styles.orderCopy}>
        <View style={styles.orderHeading}><Text style={[styles.orderBadge, { color: tone.label }]}>{item.badge}</Text><Text style={styles.orderArrow}>›</Text></View>
        <Text style={styles.orderTitle}>{item.title}</Text>
        <Text style={styles.orderText}>{item.description}</Text>
        <Text style={[styles.orderAction, { color: tone.label }]}>{item.actionLabel} ›</Text>
      </View>
    </View>
  </Pressable>;
}

function ResourceCell({ label, value, accent, fullValue }: { label: string; value: string; accent?: boolean; fullValue?: string }) {
  return <View accessible accessibilityLabel={`${label}: ${fullValue ?? value}`} style={styles.resourceCell}><Text style={styles.resourceLabel}>{label}</Text><Text numberOfLines={1} style={[styles.resourceValue, accent && styles.resourceAccent]}>{value}</Text></View>;
}

export function GuildScreen({ navigate }: { navigate(destination: Destination): void }) {
  const { showDialog } = useGameDialog();
  const { colors: themeColors } = useTheme();
  const { guild, updateGuild } = useGuild();
  const recent = guild.recentPartyHeroIds.map((id) => guild.heroes.find((hero) => hero.id === id)).filter((hero): hero is NonNullable<typeof hero> => Boolean(hero));
  const notices = useActionNotifications();
  const xpRequired = guildmasterXpToNextLevel(guild.guildmaster.level);
  const priority = getGuildPriority(guild);
  const allOrders = getGuildCommandOrders(guild);
  const duplicatedOrderIds = new Set<string>();
  if (priority.id === "revive_fallen") duplicatedOrderIds.add("fallen_heroes");
  if (priority.id === "prepare_campaign") duplicatedOrderIds.add("campaign_level_gap");
  if (priority.id === "regional_crisis") duplicatedOrderIds.add("regional_threat");
  const orders = allOrders.filter((item) => !duplicatedOrderIds.has(item.id)).slice(0, 5);
  const nextDay = previewNextGuildDay(guild);
  const nextMilestone = findNextGuildPlannerEvent(guild, 30);
  const tavernIncome = dailyTavernIncome(guild);
  const living = guild.heroes.filter((hero) => hero.currentHP > 0);
  const ready = living.filter((hero) => hero.isAvailable);
  const warTablePrimerSeen = guild.world.worldFlags.war_table_v2_tutorial_seen === true;
  const guidedOpening = guild.tutorial.completed && guild.tutorial.freeRefreshUsed && guild.world.completedQuestIds.includes("guildhaven_cellar_slimes");
  const calendarPrimerSeen = guild.world.worldFlags[CALENDAR_BASICS_GUIDANCE_FLAG] === true;
  const guideWarTable = guidedOpening && !warTablePrimerSeen;
  const guideEndDay = guidedOpening && warTablePrimerSeen && !calendarPrimerSeen;
  const onboardingPulse = useRef(new Animated.Value(1)).current;
  const acknowledgeWarTablePrimer = () => updateGuild((current) => current.world.worldFlags.war_table_v2_tutorial_seen === true ? current : ({ ...current, world: { ...current.world, worldFlags: { ...current.world.worldFlags, war_table_v2_tutorial_seen: true } } }));
  useEffect(() => {
    if (!guideWarTable && !guideEndDay) { onboardingPulse.setValue(1); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(onboardingPulse, { toValue: .45, duration: 650, useNativeDriver: true }),
      Animated.timing(onboardingPulse, { toValue: 1, duration: 650, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [guideEndDay, guideWarTable, onboardingPulse]);
  const location = guild.world.currentSettlementId
    ? SETTLEMENTS[guild.world.currentSettlementId]?.name
    : REGIONS[guild.world.currentRegionId]?.name;

  const endDay = () => {
    const guidance = getTimeAdvanceGuidance(guild, 1);
    const payrollLine = payrollWarningLine(guidance);
    const dayPreview = guidance.showCalendarPrimer
      ? `Day ${guild.currentDay} → ${nextDay.targetDay}\nHeroes: +${Math.round(GAME_CONFIG.dailyHeroHealthRecoveryRatio * 100)}% max HP · +${GAME_CONFIG.adventureStaminaRecoveryPerDay} readiness\nTavern: +${tavernIncome} gold\nProjects, training, candidates and contracts advance.`
      : `Advance to Day ${nextDay.targetDay}. Living heroes recover ${Math.round(GAME_CONFIG.dailyHeroHealthRecoveryRatio * 100)}% maximum health and ${GAME_CONFIG.adventureStaminaRecoveryPerDay} readiness; the tavern earns ${tavernIncome} gold.`;
    const payrollPrimer = guidance.showPayrollPrimer ? "\n\nPayroll is charged automatically when a contract pay day is crossed." : "";
    showDialog({
      title: payrollLine ? "Advance Time & Process Payroll?" : "End Guild Day?",
      message: `${dayPreview}${payrollPrimer}${payrollLine ? `\n\n${payrollLine}\nTreasury now: ${guild.gold} gold` : ""}`,
      eyebrow: payrollLine ? "PAYROLL WARNING" : guidance.showCalendarPrimer ? "END DAY" : "ADVANCE CALENDAR",
      tone: guidance.projectedShortfall > 0 ? "danger" : "default",
      actions: [
        { label: "Cancel", tone: "secondary" },
        { label: "End Day", tone: "primary", onPress: () => {
          const acknowledged = acknowledgeTimeAdvanceGuidance(guild, guidance);
          const result = advanceGuildTime(acknowledged);
          updateGuild(result.guild);
          const resolution = result.days[0];
          showDialog({ title: `Day ${resolution?.day ?? result.guild.currentDay}`, message: resolution?.events.map((event) => event.text).join("\n") || "A quiet day passes in Guildhaven.", tone: "success" });
        } },
      ],
    });
  };

  return <ScrollView style={{ backgroundColor: themeColors.background }} contentContainerStyle={styles.content}>
    <LocationArtwork location="guild" />
    <View style={styles.banner}>

      <View style={styles.titleRow}>
        <View style={{ flex: 1, minWidth: 0 }}><Text style={styles.eyebrow}>GUILD HALL · WAR TABLE</Text><Text style={styles.title}>Command Center</Text></View>
        <View style={styles.dayPlate}><Text style={styles.daySmall}>GUILD DAY</Text><Text style={styles.day}>{guild.currentDay}</Text></View>
      </View>
      <Text style={styles.guildName}>{guild.guildName} · {location ?? "Unknown location"}</Text>
      <View style={styles.resources}>
        <ResourceCell label="TREASURY" value={`${compactResourceAmount(guild.gold)} G`} fullValue={`${guild.gold.toLocaleString("en-US")} gold`} accent />
        <ResourceCell label="REPUTATION" value={compactResourceAmount(guild.reputation)} fullValue={guild.reputation.toLocaleString("en-US")} />
        <ResourceCell label="FIELD READY" value={`${ready.length}/${Math.max(1, guild.heroes.length)}`} />
      </View>
    </View>

    <Pressable onPress={() => navigate("guildmasterSkills")} style={({ pressed }) => pressed && styles.pressed}>
      <Panel style={styles.guildmaster}>
        <View style={styles.levelBadge}><Text style={styles.levelLabel}>GUILDMASTER</Text><Text style={styles.level}>LV {guild.guildmaster.level}</Text></View>
        <View style={styles.flex}><Text style={styles.progress}>{guild.guildmaster.xp} / {xpRequired} XP · {guild.guildmaster.skillPoints} skill point{guild.guildmaster.skillPoints === 1 ? "" : "s"}</Text><View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, guild.guildmaster.xp / xpRequired * 100)}%` }]} /></View><Text style={styles.manageHint}>LEADERSHIP TREE ›</Text></View>
        {notices.guildmaster ? <NotificationDot label="Guildmaster skill available"/> : null}
      </Panel>
    </Pressable>

    <SectionTitle>CURRENT ORDER</SectionTitle>
    <Panel style={[styles.priority, priority.tone === "urgent" && styles.priorityUrgent]}>
      <View style={styles.priorityIcon}><GameIcon id={priority.iconId} size={58} /></View>
      <View style={styles.priorityCopy}>
        <Text style={[styles.priorityKicker, priority.tone === "urgent" && styles.priorityKickerUrgent]}>{priority.tone === "urgent" ? "IMMEDIATE ACTION" : priority.tone === "progress" ? "CAMPAIGN ORDER" : "GUILD OPPORTUNITY"}</Text>
        <Text style={styles.priorityTitle}>{priority.title}</Text>
        <Text style={styles.priorityText}>{priority.description}</Text>
        <Animated.View style={{ opacity: guideWarTable ? onboardingPulse : 1 }}><ActionButton label={priority.actionLabel} onPress={() => { if (!warTablePrimerSeen) acknowledgeWarTablePrimer(); navigate(priority.destination); }} /></Animated.View>
      </View>
    </Panel>

    <SectionTitle>GUILD ORDERS · {orders.length}</SectionTitle>
    {orders.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ordersStrip}>{orders.map((item) => <CommandOrderCard key={item.id} item={item} onPress={() => navigate(item.destination)} />)}</ScrollView> : <Panel style={styles.allClear}><Text style={styles.allClearLabel}>ALL CLEAR</Text><Text style={styles.allClearTitle}>No urgent orders on the board.</Text><Text style={styles.allClearText}>The guild is stable. Continue the campaign, explore the world, train heroes, or advance the calendar when ready.</Text></Panel>}

    <SectionTitle>GUILD FACILITIES</SectionTitle>
    <View style={styles.quick}>{QUICK_ACTIONS.map((action) => <Pressable key={action.target} accessibilityRole="button" accessibilityLabel={`${action.label}: ${action.sublabel}`} onPress={() => navigate(action.target)} style={({ pressed }) => [styles.quickButton, pressed && styles.quickPressed]}>
      <View style={styles.quickIcon}><GameIcon id={action.iconId} size={34} framed={false} /></View>
      <Text style={styles.quickLabel}>{action.label.toUpperCase()}</Text><Text style={styles.quickSub}>{action.sublabel}</Text>
      {action.target === "management" && notices.manage ? <NotificationDot/> : null}
    </Pressable>)}</View>

    <SectionTitle>CALENDAR WATCH</SectionTitle>
    <Panel style={styles.calendar}>
      <View style={styles.calendarHeader}><View><Text style={styles.calendarKicker}>NEXT MILESTONE</Text><Text style={styles.calendarTitle}>{nextMilestone ? `Day ${nextMilestone.day} · +${nextMilestone.daysAway} day${nextMilestone.daysAway === 1 ? "" : "s"}` : "No scheduled milestone in 30 days"}</Text></View><Text style={styles.calendarDay}>D{nextDay.targetDay}</Text></View>
      <Text style={styles.calendarText}>{nextMilestone?.events[0]?.text ?? `Routine recovery and ${tavernIncome} gold tavern income continue each day.`}</Text>
      <View style={styles.calendarRules}><Text style={styles.calendarRule}>+{Math.round(GAME_CONFIG.dailyHeroHealthRecoveryRatio * 100)}% MAX HP</Text><Text style={styles.calendarRule}>+{GAME_CONFIG.adventureStaminaRecoveryPerDay} READINESS</Text><Text style={styles.calendarRule}>+{tavernIncome} GOLD</Text></View>
      {nextDay.payrollDue > 0 && <Text style={styles.warning}>PAYROLL TOMORROW · {nextDay.payrollDue} GOLD</Text>}
      <View style={styles.calendarButtons}><Animated.View style={[styles.calendarButton, { opacity: guideEndDay ? onboardingPulse : 1 }]}><ActionButton label="End Day" onPress={endDay} /></Animated.View><View style={styles.calendarButton}><SecondaryButton label="Open 7-Day Planner" onPress={() => navigate("finances")} /></View></View>
    </Panel>

    <SectionTitle>RECENT PARTY</SectionTitle>
    {recent.length ? <Panel style={styles.party}>{recent.map((hero) => <Pressable key={hero.id} onPress={() => navigate("heroes")} style={({ pressed }) => [styles.member, pressed && styles.memberPressed]}><Portrait hero={hero} size={55} /><Text numberOfLines={1} style={[styles.memberName, { color: getRaceNameColor(hero.raceId) }]}>{hero.name}</Text><Text style={styles.memberLevel}>LV {hero.level}</Text></Pressable>)}</Panel> : <EmptyState title="No recent party" message="Assemble a party from a quest and your latest adventurers will appear here." actionLabel="View heroes" onAction={() => navigate("heroes")} />}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 42 },
  banner: { backgroundColor: "#171d1f", borderColor: "#77643a", marginBottom: 12, padding: 13, position: "relative", borderWidth: 0, borderRadius: 12, },
  eyebrow: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: .7 },
  titleRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginTop: 2 },
  guildName: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 2 },
  dayPlate: { alignItems: "center", backgroundColor: "transparent", borderColor: colors.gold, minWidth: 58, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 0, borderRadius: 12, },
  daySmall: { color: colors.gold, fontSize: 7, fontWeight: "900", letterSpacing: .7 },
  day: { color: colors.text, fontSize: 20, fontWeight: "900", lineHeight: 22 },
  resources: { borderTopColor: "#3c4546", borderTopWidth: 1, flexDirection: "row", marginTop: 11, paddingTop: 9 },
  resourceCell: { borderRightColor: "#3c4546", borderRightWidth: 0, flex: 1, minWidth: 0, paddingHorizontal: 3 },
  resourceLabel: { color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: .6 },
  resourceValue: { color: colors.text, fontSize: 11, fontWeight: "900", marginTop: 2 },
  resourceAccent: { color: colors.gold },
  guildmaster: { borderWidth: 0, alignItems: "center", borderColor: "#685c3f", flexDirection: "row", gap: 10, padding: 11 },
  levelBadge: { minWidth: 82 }, levelLabel: { color: colors.gold, fontSize: 8, fontWeight: "900" }, level: { color: colors.text, fontSize: 19, fontWeight: "900", marginTop: 2 },
  flex: { flex: 1 }, progress: { color: colors.text, fontSize: 10, fontWeight: "700" }, track: { backgroundColor: colors.panel2, borderColor: colors.border, height: 6, marginTop: 5, overflow: "hidden", borderWidth: 0, borderRadius: 3, }, fill: { backgroundColor: colors.green, height: "100%" }, manageHint: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: .6, marginTop: 5 },
  priority: { alignItems: "flex-start", borderColor: colors.gold, flexDirection: "row", gap: 12 }, priorityUrgent: { borderColor: colors.danger }, priorityIcon: { alignItems: "center", justifyContent: "center", minWidth: 62 }, priorityCopy: { flex: 1 }, priorityKicker: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 1.2 }, priorityKickerUrgent: { color: colors.danger }, priorityTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 3 }, priorityText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginBottom: 10, marginTop: 5 },
  ordersStrip: { gap: 8, paddingBottom: 2, paddingRight: 18 },
  orderPressable: { minHeight: 112, width: 276 }, pressed: { opacity: .76, transform: [{ translateY: 1 }] },
  orderCard: { alignItems: "stretch", backgroundColor: colors.panel, flexDirection: "row", minHeight: 112, overflow: "hidden", borderWidth: 0, borderRadius: 12, },
  orderRail: { width: 4 }, orderIcon: { alignItems: "center", backgroundColor: "transparent", justifyContent: "center", width: 58 }, orderCopy: { flex: 1, paddingHorizontal: 10, paddingVertical: 8 }, orderHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, orderBadge: { fontSize: 8, fontWeight: "900", letterSpacing: .6 }, orderArrow: { color: colors.muted, fontSize: 18, fontWeight: "900", lineHeight: 18 }, orderTitle: { color: colors.text, fontSize: 14, fontWeight: "900", marginTop: 1 }, orderText: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 3 }, orderAction: { fontSize: 8, fontWeight: "800", letterSpacing: .5, marginTop: 5 },
  allClear: { borderColor: colors.green, gap: 4 }, allClearLabel: { color: colors.green, fontSize: 8, fontWeight: "900", letterSpacing: 1.2 }, allClearTitle: { color: colors.text, fontSize: 16, fontWeight: "900" }, allClearText: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  quick: { flexDirection: "row", gap: 6 }, quickButton: { alignItems: "center", backgroundColor: "transparent", borderColor: colors.border, flex: 1, justifyContent: "center", minHeight: 98, paddingHorizontal: 4, position: "relative", borderWidth: 0, borderRadius: 12, }, quickPressed: { backgroundColor: colors.panel2, borderColor: colors.gold, transform: [{ translateY: 1 }] }, quickIcon: { alignItems: "center", height: 40, justifyContent: "center" }, quickLabel: { color: colors.text, fontSize: 9, fontWeight: "800", letterSpacing: .5, marginTop: 3 }, quickSub: { color: colors.muted, fontSize: 7, marginTop: 2, textAlign: "center" },
  calendar: { borderWidth: 0, borderColor: "#59656a", gap: 8 }, calendarHeader: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", gap: 8 }, calendarKicker: { color: colors.blue, fontSize: 8, fontWeight: "900", letterSpacing: .6 }, calendarTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 2 }, calendarDay: { color: colors.gold, fontSize: 18, fontWeight: "900" }, calendarText: { color: colors.muted, fontSize: 11, lineHeight: 16 }, calendarRules: { flexDirection: "row", flexWrap: "wrap", gap: 5 }, calendarRule: { backgroundColor: colors.panel2, borderColor: colors.border, color: colors.text, fontSize: 7, fontWeight: "800", letterSpacing: .5, paddingHorizontal: 6, paddingVertical: 4, borderWidth: 0, borderRadius: 12, }, warning: { color: colors.danger, fontSize: 9, fontWeight: "900", letterSpacing: .4 }, calendarButtons: { flexDirection: "row", gap: 7, marginTop: 2 }, calendarButton: { flex: 1 },
  party: { flexDirection: "row", gap: 8, padding: 10 }, member: { alignItems: "center", borderColor: "transparent", borderWidth: 1, flex: 1, minWidth: 0, paddingVertical: 4 }, memberPressed: { borderColor: colors.gold, backgroundColor: colors.panel2 }, memberName: { color: colors.text, fontSize: 9, fontWeight: "900", marginTop: 4, maxWidth: 75 }, memberLevel: { color: colors.muted, fontSize: 8, fontWeight: "800", marginTop: 1 },
});
