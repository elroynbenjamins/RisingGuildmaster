import { nextTavernLevel, startTavernUpgrade, TAVERN_LEVELS } from "../../game/economy/tavernService";
import { cancelContractDeparture, markContractForDeparture, contractDepartureDay } from "../../game/recruitment/contractService";
import type { RenewalLengthWeeks } from "../../game/recruitment/recruitmentTypes";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { GameIcon } from "../../components/icons/GameIcon";
import { ActionButton, BackButton, EmptyState, Panel, SecondaryButton, SectionTitle, StatusChip, colors } from "../../components/ui";
import {
  advanceGuildTime,
  dailyTavernIncome,
  findNextGuildPlannerEvent,
  forecastGuildPlanner,
  isGuildPlannerEvent,
  paySalaryArrears,
  totalSalaryArrears,
} from "../../game/economy/guildCalendarService";
import type { GuildDayEvent, GuildDayResolution, GuildPlannerDay } from "../../game/economy/economyTypes";
import {
  getGuildPlannerDayPresentation,
  getGuildPlannerEventPresentation,
  type GuildPlannerTone,
} from "../../game/economy/guildPlannerPresentationService";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";
import { acknowledgeTimeAdvanceGuidance, getTimeAdvanceGuidance, payrollWarningLine } from "../../game/onboarding/timeAndPayrollGuidanceService";
import { GAME_CONFIG } from "../../config/gameConfig";
import { getHeroLoyalty, getHeroLoyaltyBand, getRenewalSalaryForGuild, HERO_LOYALTY_LABELS, renewHeroContract } from "../../game/heroes/heroLoyaltyService";

const toneColor = (tone: GuildPlannerTone): string => tone === "danger" ? colors.danger : tone === "warning" ? colors.gold : tone === "good" ? colors.green : colors.muted;
const toneChip = (tone: GuildPlannerTone): "neutral" | "gold" | "good" | "danger" => tone === "danger" ? "danger" : tone === "warning" ? "gold" : tone === "good" ? "good" : "neutral";

function PlannerDayTile({ day, selected, onPress }: { day: GuildPlannerDay; selected: boolean; onPress(): void }) {
  const presentation = getGuildPlannerDayPresentation(day);
  const accent = toneColor(presentation.tone);
  return <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected }}
    accessibilityLabel={`Day ${day.day}, ${presentation.statusLabel}, ${presentation.headline}`}
    onPress={onPress}
    style={({ pressed }: { pressed: boolean }) => [styles.dayTile, { borderColor: selected ? colors.gold : accent }, selected && styles.dayTileSelected, pressed && styles.pressed]}
  >
    <View style={[styles.dayToneRail, { backgroundColor: accent }]} />
    <View style={styles.dayTileHeader}>
      <Text style={styles.dayNumber}>{day.day}</Text>
      <Text style={styles.dayOffset}>{day.daysAway === 1 ? "NEXT" : `+${day.daysAway}D`}</Text>
    </View>
    <Text style={[styles.dayStatus, { color: accent }]}>{presentation.statusLabel}</Text>
    <View style={styles.dayIcons}>
      {presentation.iconIds.map((iconId) => <View key={iconId} style={[styles.dayIconFrame, { borderColor: accent }]}><GameIcon id={iconId} size={24} framed={false} /></View>)}
    </View>
    <Text numberOfLines={2} style={styles.dayHeadline}>{presentation.headline}</Text>
    <Text style={[styles.dayTreasury, day.arrearsAdded > 0 && styles.danger]}>≈ {day.projectedGold.toLocaleString()}g</Text>
  </Pressable>;
}

function PlannerEventRow({ event }: { event: GuildDayEvent }) {
  const presentation = getGuildPlannerEventPresentation(event);
  const accent = toneColor(presentation.tone);
  return <View style={[styles.detailEvent, { borderLeftColor: accent }]}>
    <View style={[styles.detailEventIcon, { borderColor: accent }]}><GameIcon id={presentation.iconId} size={30} framed={false} /></View>
    <View style={styles.flex}>
      <Text style={[styles.detailEventLabel, { color: accent }]}>{presentation.label}</Text>
      <Text style={styles.detailEventText}>{event.text}</Text>
    </View>
  </View>;
}

export function FinancesScreen({ onBack }: { onBack(): void }) {
  const { showDialog } = useGameDialog();
  const { guild, updateGuild } = useGuild();
  const planner = useMemo(() => forecastGuildPlanner(guild, 7), [guild]);
  const nextEvent = useMemo(() => findNextGuildPlannerEvent(guild, 30), [guild]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [lastAdvance, setLastAdvance] = useState<GuildDayResolution[]>([]);
  const selectedDay = planner[Math.min(selectedDayIndex, Math.max(0, planner.length - 1))];
  const selectedPresentation = selectedDay ? getGuildPlannerDayPresentation(selectedDay) : null;
  const arrears = totalSalaryArrears(guild);
  const activeContracts = guild.heroContracts.filter((contract) => contract.status !== "expired");
  const weeklyPayroll = activeContracts
    .filter((contract) => guild.heroes.some((hero) => hero.id === contract.heroId && hero.currentHP > 0))
    .reduce((sum, contract) => sum + contract.weeklySalary, 0);
  const currentHall = TAVERN_LEVELS[guild.finance.tavernLevel] ?? TAVERN_LEVELS[1]!;
  const nextHall = nextTavernLevel(guild);
  const upgradeHall = () => {try {updateGuild(startTavernUpgrade(guild));} catch(error) {showDialog({title:"Guild Hall upgrade unavailable",message:error instanceof Error?error.message:"Upgrade failed",tone:"danger"});}};
  const tavernIncome = dailyTavernIncome(guild);
  const plannerPrimerSeen = guild.world.worldFlags.guild_planner_v2_tutorial_seen === true;
  const acknowledgePlannerPrimer = () => updateGuild({ ...guild, world: { ...guild.world, worldFlags: { ...guild.world.worldFlags, guild_planner_v2_tutorial_seen: true } } });

  const advance = (days: number) => {
    const guidance = getTimeAdvanceGuidance(guild, days);
    const payrollLine = payrollWarningLine(guidance);
    const forecast = forecastGuildPlanner(guild, days);
    const specialEvents = forecast.flatMap((day) => day.events.map((event) => `Day ${day.day}: ${event.text}`));
    const shownEvents = specialEvents.slice(0, 7);
    const hiddenCount = Math.max(0, specialEvents.length - shownEvents.length);
    const projectedGold = forecast[forecast.length - 1]?.projectedGold ?? guild.gold;
    const primer = guidance.showCalendarPrimer
      ? "Time also advances after completed quests, travel, and Crisis Operations. Recovery, projects, candidates, contracts, threats, tavern income, and payroll all resolve together.\n\n"
      : "";
    const payrollPrimer = guidance.showPayrollPrimer
      ? "Weekly salaries are automatic. Any amount the treasury cannot cover becomes salary arrears.\n\n"
      : "";
    const routine = `Daily routine: +${tavernIncome} tavern gold, living heroes heal ${Math.round(GAME_CONFIG.dailyHeroHealthRecoveryRatio * 100)}% max HP, and resting heroes recover readiness stamina.`;
    const milestoneText = shownEvents.length
      ? `\n\nScheduled milestones:\n${shownEvents.join("\n")}${hiddenCount ? `\n+ ${hiddenCount} more milestone${hiddenCount === 1 ? "" : "s"}` : ""}`
      : "\n\nNo special milestones are scheduled during this advance.";
    const title = days === 1 ? (payrollLine ? "Advance Time & Process Payroll?" : "End Guild Day?") : `Advance ${days} Guild Days?`;
    const message = `${primer}${payrollPrimer}Advance from Day ${guild.currentDay} to Day ${guidance.targetDay}?\n\n${routine}${milestoneText}${payrollLine ? `\n\n${payrollLine}` : ""}\n\nProjected treasury: ${projectedGold} gold`;
    showDialog({
      title,
      message,
      eyebrow: guidance.showCalendarPrimer ? "TIME & PAYROLL TUTORIAL" : days > 1 ? "GUILD PLANNER" : payrollLine ? "PAYROLL WARNING" : "ADVANCE CALENDAR",
      tone: guidance.projectedShortfall > 0 ? "danger" : "default",
      actions: [
        { label: "Cancel", tone: "secondary" },
        {
          label: days === 1 ? "End Day" : `Advance ${days} Days`,
          tone: "primary",
          onPress: () => {
            const result = advanceGuildTime(acknowledgeTimeAdvanceGuidance(guild, guidance), days);
            updateGuild(result.guild);
            setLastAdvance(result.days);
            setSelectedDayIndex(0);
          },
        },
      ],
    });
  };

  const settle = () => {
    try { updateGuild(paySalaryArrears(guild)); }
    catch (error) { showDialog({ title: "Payroll order failed", message: error instanceof Error ? error.message : "Payment failed", tone: "danger" }); }
  };
  const renew = (heroId: string, weeks: RenewalLengthWeeks) => {
    try { updateGuild(renewHeroContract(guild, heroId, weeks)); }
    catch (error) { showDialog({ title: "Contract renewal failed", message: error instanceof Error ? error.message : "Renewal failed", tone: "danger" }); }
  };

  const lastSpecialEvents = lastAdvance.flatMap((day) => day.events.filter(isGuildPlannerEvent));
  const lastPayrollDue = lastAdvance.reduce((sum, day) => sum + day.payrollDue, 0);
  const lastPayrollPaid = lastAdvance.reduce((sum, day) => sum + day.payrollPaid, 0);
  const lastArrearsAdded = lastAdvance.reduce((sum, day) => sum + day.arrearsAdded, 0);
  const lastStartDay = lastAdvance[0]?.day;
  const lastEndDay = lastAdvance[lastAdvance.length - 1]?.day;

  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <View style={styles.heading}>
      <View><Text style={styles.eyebrow}>GUILD OPERATIONS</Text><Text style={styles.title}>Guild Calendar</Text><Text style={styles.subtitle}>Plan the week. Protect payroll. Time your expeditions.</Text></View>
      <View style={styles.currentDayPlate}><Text style={styles.currentDaySmall}>CURRENT</Text><Text style={styles.currentDayValue}>DAY {guild.currentDay}</Text></View>
    </View>

    {!plannerPrimerSeen && <Panel style={styles.plannerPrimer}><Text style={styles.plannerPrimerLabel}>GUILD PLANNER TUTORIAL</Text><Text style={styles.plannerPrimerTitle}>Days Are Resources</Text><Text style={styles.plannerPrimerText}>Each End Day heals living heroes by 10% of max HP and restores normal readiness, but it also advances payroll, candidate expiry, contracts, training, projects, gathering, scouting, and regional threats. Tap a future day to inspect it before advancing, or jump to the next milestone when the week is quiet.</Text><SecondaryButton label="UNDERSTOOD · OPEN THE CALENDAR" onPress={acknowledgePlannerPrimer}/></Panel>}
    <View style={styles.summary}>
      <Panel style={styles.summaryCard}><GameIcon id="gold" size={28} /><Text style={styles.summaryLabel}>TREASURY</Text><Text style={styles.gold}>{guild.gold.toLocaleString()}</Text><Text style={styles.summaryMeta}>gold available</Text></Panel>
      <Panel style={styles.summaryCard}><GameIcon id="heroes" size={28} /><Text style={styles.summaryLabel}>PAYROLL</Text><Text style={styles.value}>{weeklyPayroll.toLocaleString()}</Text><Text style={styles.summaryMeta}>per week</Text></Panel>
      <Panel style={[styles.summaryCard, arrears > 0 && styles.dangerCard]}><GameIcon id={arrears > 0 ? "defeat" : "victory"} size={28} /><Text style={styles.summaryLabel}>ARREARS</Text><Text style={arrears > 0 ? styles.dangerValue : styles.value}>{arrears.toLocaleString()}</Text><Text style={styles.summaryMeta}>{arrears > 0 ? "payment due" : "all current"}</Text></Panel>
    </View>
    {arrears > 0 && <ActionButton label={`PAY SALARY ARREARS · UP TO ${Math.min(arrears, guild.gold)} GOLD`} disabled={guild.gold <= 0} onPress={settle} />}

    <SectionTitle>7-DAY COMMAND CALENDAR</SectionTitle>
    <Panel style={styles.calendarFrame}>
      <View style={styles.calendarHeader}>
        <View><Text style={styles.calendarEyebrow}>GUILD WEEK</Text><Text style={styles.calendarRange}>DAY {planner[0]?.day ?? guild.currentDay + 1} — {planner[planner.length - 1]?.day ?? guild.currentDay + 7}</Text></View>
        <View style={styles.routineBadge}><Text style={styles.routineBadgeTop}>EVERY DAY</Text><Text style={styles.routineBadgeValue}>+{Math.round(GAME_CONFIG.dailyHeroHealthRecoveryRatio * 100)}% HP</Text></View>
      </View>
      <Text style={styles.calendarHint}>Tap a day to inspect what will resolve before advancing time.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarRow}>
        {planner.map((day, index) => <PlannerDayTile key={day.day} day={day} selected={index === selectedDayIndex} onPress={() => setSelectedDayIndex(index)} />)}
      </ScrollView>
    </Panel>

    {selectedDay && selectedPresentation && <Panel style={[styles.selectedDayPanel, { borderColor: toneColor(selectedPresentation.tone) }]}>
      <View style={styles.selectedDayHeader}>
        <View style={[styles.selectedCalendarIcon, { borderColor: toneColor(selectedPresentation.tone) }]}><GameIcon id="calendar" size={42} framed={false} /></View>
        <View style={styles.flex}>
          <Text style={styles.selectedEyebrow}>SELECTED DAY · +{selectedDay.daysAway}</Text>
          <Text style={styles.selectedTitle}>Day {selectedDay.day}</Text>
          <Text style={styles.selectedSubtitle}>{selectedPresentation.headline}</Text>
        </View>
        <StatusChip label={selectedPresentation.statusLabel} tone={toneChip(selectedPresentation.tone)} />
      </View>

      {selectedDay.events.length > 0 ? <View style={styles.detailEvents}>
        {selectedDay.events.map((event, index) => <PlannerEventRow key={`${event.type}-${index}`} event={event} />)}
      </View> : <View style={styles.routineDetail}>
        <View style={styles.routineLine}><GameIcon id="temple" size={28} framed={false} /><Text style={styles.routineText}>Living heroes recover {Math.round(GAME_CONFIG.dailyHeroHealthRecoveryRatio * 100)}% of max HP.</Text></View>
        <View style={styles.routineLine}><GameIcon id="training" size={28} framed={false} /><Text style={styles.routineText}>Resting heroes recover readiness stamina.</Text></View>
        <View style={styles.routineLine}><GameIcon id="gold" size={28} framed={false} /><Text style={styles.routineText}>Tavern contributes +{tavernIncome} gold.</Text></View>
      </View>}

      <View style={styles.selectedFooter}>
        <View style={styles.footerStat}><Text style={styles.footerLabel}>PROJECTED TREASURY</Text><Text style={[styles.footerValue, selectedDay.arrearsAdded > 0 && styles.danger]}>{selectedDay.projectedGold.toLocaleString()} GOLD</Text></View>
        {selectedDay.payrollDue > 0 ? <View style={styles.footerStat}><Text style={styles.footerLabel}>PAYROLL</Text><Text style={selectedDay.arrearsAdded > 0 ? styles.danger : styles.footerValue}>{selectedDay.payrollPaid}/{selectedDay.payrollDue} PAID</Text></View> : null}
      </View>
      <ActionButton label={selectedDay.daysAway === 1 ? "END DAY" : `ADVANCE TO DAY ${selectedDay.day} · +${selectedDay.daysAway} DAYS`} onPress={() => advance(selectedDay.daysAway)} />
    </Panel>}

    <View style={styles.advanceButtons}>
      <SecondaryButton
        label={nextEvent ? `JUMP TO NEXT MILESTONE · DAY ${nextEvent.day} (+${nextEvent.daysAway})` : "NO MILESTONE IN NEXT 30 DAYS"}
        disabled={!nextEvent}
        onPress={() => nextEvent && advance(nextEvent.daysAway)}
      />
    </View>
    {nextEvent && <Panel style={styles.nextEventPanel}><Text style={styles.nextEventLabel}>NEXT MILESTONE</Text><Text style={styles.nextEventTitle}>Day {nextEvent.day} · {getGuildPlannerDayPresentation(nextEvent).headline}</Text><Text style={styles.nextEventText}>{nextEvent.events[0]?.text}</Text></Panel>}

    {lastAdvance.length > 0 && <>
      <SectionTitle>{lastAdvance.length === 1 ? `DAY ${lastEndDay} RESOLUTION` : `DAYS ${lastStartDay}–${lastEndDay} RESOLUTION`}</SectionTitle>
      <Panel style={styles.resolution}>
        <Text style={styles.resolutionMoney}>Payroll: {lastPayrollPaid}/{lastPayrollDue} paid{lastArrearsAdded ? ` · ${lastArrearsAdded} added to arrears` : ""}</Text>
        <Text style={styles.routineResolution}>Daily healing, readiness, tavern income, and calendar systems processed for {lastAdvance.length} day{lastAdvance.length === 1 ? "" : "s"}.</Text>
        {lastSpecialEvents.length ? lastSpecialEvents.map((event, index) => <PlannerEventRow key={`${event.type}-${index}`} event={event} />) : <Text style={styles.event}>No special guild milestones occurred.</Text>}
      </Panel>
    </>}

    <SectionTitle>GUILD HALL & TAVERN</SectionTitle>
    <Panel style={styles.hall}><View style={styles.hallHead}><View style={styles.flex}><Text style={styles.hallName}>LEVEL {guild.finance.tavernLevel} · {currentHall.name}</Text><Text style={styles.hallMeta}>Daily income now {dailyTavernIncome(guild)} gold · +{Math.round(currentHall.incomeModifier*100)}% hall income · +{currentHall.recruitmentSlots} board slot{currentHall.recruitmentSlots===1?"":"s"}</Text></View></View>{guild.finance.tavernUpgrade?<><Text style={styles.warning}>UPGRADING TO LEVEL {guild.finance.tavernUpgrade.targetLevel} · READY DAY {guild.finance.tavernUpgrade.completionDay}</Text></>:nextHall?<><Text style={styles.hallMeta}>Next: {nextHall.name} · {nextHall.goldCost} gold · {nextHall.durationDays} days · requires {nextHall.reputationRequired} reputation</Text><Text style={styles.hallBenefit}>Benefit: +{Math.round(nextHall.incomeModifier*100)}% hall income · +{nextHall.recruitmentSlots} recruitment slot{nextHall.recruitmentSlots===1?"":"s"} · stronger candidate pool</Text><ActionButton label={"Upgrade Guild Hall · "+nextHall.goldCost+" Gold"} disabled={guild.gold<nextHall.goldCost||guild.reputation<nextHall.reputationRequired} onPress={upgradeHall}/></>:<Text style={styles.active}>MAXIMUM GUILD HALL LEVEL</Text>}</Panel>
    <SectionTitle>ROSTER & CONTRACTS</SectionTitle>
    {guild.heroContracts.length ? guild.heroContracts.map((contract) => {
      const hero = guild.heroes.find((item) => item.id === contract.heroId);
      const owed = guild.finance.salaryArrearsByHeroId[contract.heroId] ?? 0;
      const loyalty = getHeroLoyalty(guild, contract.heroId);
      const loyaltyBand = getHeroLoyaltyBand(loyalty.score);

      return <Panel key={contract.heroId} style={styles.contract}>
        <View style={styles.contractHeader}>
          <View style={styles.flex}>
            <Text style={[styles.heroName, hero && { color: getRaceNameColor(hero.raceId) }]}>{hero?.name ?? "Unknown Hero"}</Text>
            <Text style={styles.contractMeta}>{hero && hero.currentHP <= 0 ? "Salary paused · fallen" : `${contract.weeklySalary} gold/week`} · ends Day {contract.endDay}</Text>
            <Text style={styles.loyalty}>LOYALTY · {HERO_LOYALTY_LABELS[loyaltyBand].toUpperCase()} · {loyalty.score}/100</Text>
          </View>
          <View style={styles.contractRight}>
            <Text style={contract.status === "expired" ? styles.danger : contract.status === "expiring" ? styles.warning : styles.active}>{contract.status.toUpperCase()}</Text>
            {owed > 0 && <Text style={styles.danger}>{owed} owed</Text>}
          </View>
        </View>
        {hero && contract.status !== "active" ? <View style={{gap: 8}}><Text style={styles.contractMeta}>Departure after Day {contractDepartureDay(contract)} if not renewed.</Text>{([4,8,12] as RenewalLengthWeeks[]).map(weeks => <SecondaryButton key={weeks} label={`${weeks} WEEKS · ${getRenewalSalaryForGuild(guild, contract, hero.level, weeks)} GOLD/WEEK`} disabled={owed > 0} onPress={() => renew(hero.id, weeks)} />)}<SecondaryButton label={contract.renewalIntent === "depart" ? "Cancel Departure" : "Let Contract Expire"} onPress={() => updateGuild(contract.renewalIntent === "depart" ? cancelContractDeparture(guild, hero.id) : markContractForDeparture(guild, hero.id))} /></View> : null}
      </Panel>;
    }) : <EmptyState title="No hero contracts" message="Recruit a hero to create the guild's first salary obligation." />}

    <SectionTitle>RECENT LEDGER</SectionTitle>
    <Panel>{guild.finance.transactions.length ? guild.finance.transactions.slice(-10).reverse().map((transaction) => <View key={transaction.id} style={styles.ledger}><View style={styles.flex}><Text style={styles.ledgerNote}>{transaction.note}</Text><Text style={styles.ledgerDay}>Day {transaction.day}</Text></View><Text style={styles.outflow}>{transaction.amount.toLocaleString()}</Text></View>) : <Text style={styles.emptyLedger}>No payroll transactions recorded.</Text>}</Panel>
  </ScrollView>;
}

const styles = StyleSheet.create({  hall:{gap:8},hallHead:{alignItems:"center",flexDirection:"row",gap:8},hallName:{color:colors.text,fontSize:16,fontWeight:"900"},hallMeta:{color:colors.muted,fontSize:10,lineHeight:15,marginTop:3},hallBenefit:{color:colors.green,fontSize:10,fontWeight:"800",lineHeight:15},
  plannerPrimer: { borderColor: colors.gold, gap: 7, marginBottom: 11 },
  plannerPrimerLabel: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  plannerPrimerTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  plannerPrimerText: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  content: { padding: 18, paddingBottom: 55 },
  heading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 13, marginTop: 8, gap: 10 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 25, fontWeight: "900", maxWidth: 255 },
  subtitle: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 3, maxWidth: 250 },
  currentDayPlate: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderWidth: 2, minWidth: 72, paddingHorizontal: 8, paddingVertical: 7 },
  currentDaySmall: { color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: .8 },
  currentDayValue: { color: colors.gold, fontSize: 12, fontWeight: "900", marginTop: 2 },
  summary: { flexDirection: "row", gap: 7 },
  summaryCard: { alignItems: "flex-start", flex: 1, minHeight: 125, padding: 9 },
  dangerCard: { borderColor: colors.danger },
  summaryLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", marginTop: 7 },
  gold: { color: colors.gold, fontSize: 19, fontWeight: "900", marginTop: 3 },
  value: { color: colors.text, fontSize: 19, fontWeight: "900", marginTop: 3 },
  dangerValue: { color: colors.danger, fontSize: 19, fontWeight: "900", marginTop: 3 },
  summaryMeta: { color: colors.muted, fontSize: 8, marginTop: 3 },
  danger: { color: colors.danger, fontWeight: "900" },
  warning: { color: colors.gold, fontSize: 10, fontWeight: "900" },
  calendarFrame: { padding: 10 },
  calendarHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 10 },
  calendarEyebrow: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  calendarRange: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 2 },
  routineBadge: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.green, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 },
  routineBadgeTop: { color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: .6 },
  routineBadgeValue: { color: colors.green, fontSize: 10, fontWeight: "900", marginTop: 1 },
  calendarHint: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 8 },
  calendarRow: { gap: 7, paddingBottom: 2, paddingRight: 6, paddingTop: 10 },
  dayTile: { backgroundColor: colors.panel2, borderWidth: 2, minHeight: 148, overflow: "hidden", padding: 8, width: 96 },
  dayTileSelected: { backgroundColor: "#2b2b25" },
  dayToneRail: { height: 4, left: 0, position: "absolute", right: 0, top: 0 },
  dayTileHeader: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  dayNumber: { color: colors.text, fontSize: 25, fontWeight: "900" },
  dayOffset: { color: colors.muted, fontSize: 7, fontWeight: "900" },
  dayStatus: { fontSize: 7, fontWeight: "900", letterSpacing: .5, marginTop: 1 },
  dayIcons: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8, minHeight: 24 },
  dayIconFrame: { borderWidth: 1, padding: 1 },
  dayHeadline: { color: colors.text, fontSize: 9, fontWeight: "800", lineHeight: 12, marginTop: 7 },
  dayTreasury: { color: colors.muted, fontSize: 8, fontWeight: "800", marginTop: "auto", paddingTop: 6 },
  pressed: { opacity: .78, transform: [{ translateY: 1 }] },
  selectedDayPanel: { borderWidth: 2, gap: 10, marginTop: 10, padding: 12 },
  selectedDayHeader: { alignItems: "center", flexDirection: "row", gap: 10 },
  selectedCalendarIcon: { borderWidth: 2, padding: 3 },
  selectedEyebrow: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: .8 },
  selectedTitle: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 1 },
  selectedSubtitle: { color: colors.gold, fontSize: 10, fontWeight: "900", marginTop: 1 },
  detailEvents: { gap: 6 },
  detailEvent: { alignItems: "center", backgroundColor: colors.panel2, borderLeftWidth: 3, flexDirection: "row", gap: 9, padding: 8 },
  detailEventIcon: { borderWidth: 1, padding: 2 },
  detailEventLabel: { fontSize: 8, fontWeight: "900", letterSpacing: .7 },
  detailEventText: { color: colors.text, fontSize: 10, lineHeight: 14, marginTop: 2 },
  routineDetail: { backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, gap: 7, padding: 9 },
  routineLine: { alignItems: "center", flexDirection: "row", gap: 8 },
  routineText: { color: colors.text, flex: 1, fontSize: 10, lineHeight: 14 },
  selectedFooter: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 16, paddingTop: 9 },
  footerStat: { flex: 1 },
  footerLabel: { color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: .6 },
  footerValue: { color: colors.text, fontSize: 11, fontWeight: "900", marginTop: 2 },
  advanceButtons: { gap: 8, marginTop: 9 },
  nextEventPanel: { borderColor: colors.gold, gap: 4, marginTop: 9, padding: 12 },
  nextEventLabel: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  nextEventTitle: { color: colors.text, fontSize: 13, fontWeight: "900" },
  nextEventText: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  resolution: { gap: 7 },
  resolutionMoney: { color: colors.gold, fontWeight: "900" },
  routineResolution: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  event: { color: colors.text, lineHeight: 19 },
  contract: { gap: 9, marginBottom: 8 },
  contractHeader: { alignItems: "center", flexDirection: "row", gap: 9 },
  flex: { flex: 1 },
  heroName: { color: colors.text, fontSize: 16, fontWeight: "900" },
  contractMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  loyalty: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: .6, marginTop: 4 },
  contractRight: { alignItems: "flex-end", gap: 3 },
  active: { color: colors.green, fontSize: 10, fontWeight: "900" },
  ledger: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", paddingVertical: 8 },
  ledgerNote: { color: colors.text, fontSize: 12 },
  ledgerDay: { color: colors.muted, fontSize: 9, marginTop: 2 },
  outflow: { color: colors.danger, fontWeight: "900" },
  emptyLedger: { color: colors.muted },
});
