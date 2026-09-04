import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { REGIONS } from "../../data/world/regions";
import { ActionButton, BackButton, EmptyState, Panel, SectionTitle, colors } from "../../components/ui";
import { advanceGuildTime, paySalaryArrears, previewNextGuildDay, totalSalaryArrears } from "../../game/economy/guildCalendarService";
import type { GuildDayResolution } from "../../game/economy/economyTypes";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";

export function FinancesScreen({ onBack }: { onBack(): void }) {
  const { showDialog } = useGameDialog();
  const { guild, updateGuild } = useGuild();
  const preview = useMemo(() => previewNextGuildDay(guild), [guild]);
  const [lastDay, setLastDay] = useState<GuildDayResolution | null>(null);
  const arrears = totalSalaryArrears(guild);
  const activeContracts = guild.heroContracts.filter((contract) => contract.status !== "expired");
  const weeklyPayroll = activeContracts.filter((contract) => guild.heroes.some((hero) => hero.id === contract.heroId && hero.currentHP > 0)).reduce((sum, contract) => sum + contract.weeklySalary, 0);
  const previewLines = [
    preview.payrollDue ? "Payroll due: " + preview.payrollDue + " gold" : "No payroll due",
    ...preview.workshopNames.map((name) => name + " construction completes"),
    ...(preview.gatheringMissionIds.length ? [preview.gatheringMissionIds.length + " gathering mission" + (preview.gatheringMissionIds.length === 1 ? "" : "s") + " ready"] : []),
    ...(preview.scoutReturns ? ["Regional scout returns"] : []),
    ...preview.recoveringHeroNames.map((name) => name + " recovers from a condition"),
    ...(preview.expiringCandidateCount ? [preview.expiringCandidateCount + " recruitment candidate" + (preview.expiringCandidateCount === 1 ? "" : "s") + " depart"] : []),
    ...(preview.contractChanges ? [preview.contractChanges + " contract status update" + (preview.contractChanges === 1 ? "" : "s")] : []),
    ...preview.threatIncreaseRegionIds.map((id) => (REGIONS[id]?.name ?? id) + " threat increases"),
  ];
  const advance = () => showDialog({ title: "End Guild Day?", message: "Advance from Day " + guild.currentDay + " to Day " + preview.targetDay + "?\n\n" + previewLines.join("\n"), eyebrow: "ADVANCE CALENDAR", actions: [{ label: "Cancel", tone: "secondary" }, { label: "End Day", tone: "primary", onPress: () => { const result = advanceGuildTime(guild); updateGuild(result.guild); setLastDay(result.days[0] ?? null); } }] });
  const settle = () => { try { updateGuild(paySalaryArrears(guild)); } catch (error) { showDialog({ title: "Payroll order failed", message: error instanceof Error ? error.message : "Payment failed", tone: "danger" }); } };
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <View style={styles.heading}><View><Text style={styles.eyebrow}>GUILD OPERATIONS</Text><Text style={styles.title}>Calendar & Finances</Text></View><Text style={styles.day}>DAY {guild.currentDay}</Text></View>
    <View style={styles.summary}>
      <Panel style={styles.summaryCard}><Text style={styles.summaryLabel}>TREASURY</Text><Text style={styles.gold}>{guild.gold.toLocaleString()}</Text><Text style={styles.summaryMeta}>gold available</Text></Panel>
      <Panel style={styles.summaryCard}><Text style={styles.summaryLabel}>WEEKLY PAYROLL</Text><Text style={styles.value}>{weeklyPayroll.toLocaleString()}</Text><Text style={styles.summaryMeta}>{activeContracts.length} active contracts</Text></Panel>
      <Panel style={[styles.summaryCard, arrears > 0 && styles.dangerCard]}><Text style={styles.summaryLabel}>ARREARS</Text><Text style={arrears > 0 ? styles.danger : styles.value}>{arrears.toLocaleString()}</Text><Text style={styles.summaryMeta}>{arrears > 0 ? "heroes awaiting payment" : "payroll current"}</Text></Panel>
    </View>
    {arrears > 0 && <ActionButton label={"Pay Salary Arrears · up to " + Math.min(arrears, guild.gold) + " Gold"} disabled={guild.gold <= 0} onPress={settle} />}
    <SectionTitle>NEXT DAY PREVIEW</SectionTitle>
    <Panel style={styles.preview}><Text style={styles.previewDay}>DAY {preview.targetDay}</Text>{previewLines.map((line, index) => <View key={line + "-" + index} style={styles.line}><Text style={styles.bullet}>◆</Text><Text style={styles.lineText}>{line}</Text></View>)}<ActionButton label="End Day" onPress={advance} /></Panel>
    {lastDay && <><SectionTitle>DAY {lastDay.day} RESOLUTION</SectionTitle><Panel style={styles.resolution}><Text style={styles.resolutionMoney}>Payroll: {lastDay.payrollPaid}/{lastDay.payrollDue} paid{lastDay.arrearsAdded ? " · " + lastDay.arrearsAdded + " added to arrears" : ""}</Text>{lastDay.events.length ? lastDay.events.map((event, index) => <Text key={event.type + "-" + index} style={event.type === "salary_arrears" || event.type === "regional_threat" ? styles.eventWarning : styles.event}>{event.text}</Text>) : <Text style={styles.event}>A quiet day passes at the guild.</Text>}</Panel></>}
    <SectionTitle>ROSTER & CONTRACTS</SectionTitle>
    {guild.heroContracts.length ? guild.heroContracts.map((contract) => { const hero = guild.heroes.find((item) => item.id === contract.heroId); const owed = guild.finance.salaryArrearsByHeroId[contract.heroId] ?? 0; return <Panel key={contract.heroId} style={styles.contract}><View style={styles.flex}><Text style={[styles.heroName, hero && { color: getRaceNameColor(hero.raceId) }]}>{hero?.name ?? "Unknown Hero"}</Text><Text style={styles.contractMeta}>{hero && hero.currentHP <= 0 ? "Salary paused · fallen" : `${contract.weeklySalary} gold/week`} · ends Day {contract.endDay}</Text></View><View style={styles.contractRight}><Text style={contract.status === "expired" ? styles.danger : contract.status === "expiring" ? styles.warning : styles.active}>{contract.status.toUpperCase()}</Text>{owed > 0 && <Text style={styles.danger}>{owed} owed</Text>}</View></Panel>; }) : <EmptyState title="No hero contracts" message="Recruit a hero to create the guild's first salary obligation." />}
    <SectionTitle>RECENT LEDGER</SectionTitle>
    <Panel>{guild.finance.transactions.length ? guild.finance.transactions.slice(-10).reverse().map((transaction) => <View key={transaction.id} style={styles.ledger}><View style={styles.flex}><Text style={styles.ledgerNote}>{transaction.note}</Text><Text style={styles.ledgerDay}>Day {transaction.day}</Text></View><Text style={styles.outflow}>{transaction.amount.toLocaleString()}</Text></View>) : <Text style={styles.emptyLedger}>No payroll transactions recorded.</Text>}</Panel>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 55 }, heading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 13, marginTop: 8 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 28, fontWeight: "900" }, day: { color: colors.gold, fontSize: 14, fontWeight: "900" },
  summary: { flexDirection: "row", gap: 7 }, summaryCard: { flex: 1, minHeight: 104, padding: 10 }, dangerCard: { borderColor: colors.danger }, summaryLabel: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  gold: { color: colors.gold, fontSize: 21, fontWeight: "900", marginTop: 6 }, value: { color: colors.text, fontSize: 21, fontWeight: "900", marginTop: 6 }, summaryMeta: { color: colors.muted, fontSize: 9, marginTop: 4 }, danger: { color: colors.danger, fontWeight: "900" },
  preview: { borderColor: colors.gold, gap: 8 }, previewDay: { color: colors.gold, fontSize: 18, fontWeight: "900" }, line: { alignItems: "center", flexDirection: "row", gap: 8 }, bullet: { color: colors.gold, fontSize: 9 }, lineText: { color: colors.text, flex: 1, fontSize: 13 },
  resolution: { gap: 7 }, resolutionMoney: { color: colors.gold, fontWeight: "900" }, event: { color: colors.text, lineHeight: 19 }, eventWarning: { color: colors.danger, lineHeight: 19 },
  contract: { alignItems: "center", flexDirection: "row", gap: 9, marginBottom: 8 }, flex: { flex: 1 }, heroName: { color: colors.text, fontSize: 16, fontWeight: "900" }, contractMeta: { color: colors.muted, fontSize: 11, marginTop: 3 }, contractRight: { alignItems: "flex-end", gap: 3 },
  active: { color: colors.green, fontSize: 10, fontWeight: "900" }, warning: { color: colors.gold, fontSize: 10, fontWeight: "900" }, ledger: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", paddingVertical: 8 }, ledgerNote: { color: colors.text, fontSize: 12 }, ledgerDay: { color: colors.muted, fontSize: 9, marginTop: 2 }, outflow: { color: colors.danger, fontWeight: "900" }, emptyLedger: { color: colors.muted },
});
