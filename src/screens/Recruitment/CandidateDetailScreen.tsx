import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { ActionButton, BackButton, EmptyState, Panel, Portrait, SecondaryButton, SegmentedTabs, StatusChip, colors } from "../../components/ui";
import { CLASSES } from "../../data/classes/classes";
import { RACES } from "../../data/races/races";
import { RECRUITMENT_CONFIG } from "../../data/recruitment/recruitmentBalance";
import { TRAITS } from "../../data/traits/traits";
import { ATTRIBUTE_KEYS } from "../../game/attributes/types";
import { createHeroCombatInstance, createHeroCombatUnit } from "../../game/combat/heroCombatFactory";
import { calculateHero } from "../../game/heroes/heroCalculator";
import { potentialRating, scoutingCost } from "../../game/recruitment/scoutingService";
import type { ScoutingLevel } from "../../game/recruitment/recruitmentTypes";
import { getCandidateRecruitmentPresentation } from "../../game/recruitment/recruitmentPresentationService";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";
import { BACKGROUNDS } from "../../data/backgrounds/backgrounds";
import { isClassAttribute } from "../../ui/classAttributes";
import { getModifierTargetLabel } from "../../ui/modifierLabels";
import { formatAbilityModifier } from "../../game/attributes/dndAttributes";
import { recordTutorialCandidateTab } from "../../game/onboarding/tutorialService";
import type { TutorialCandidateTab } from "../../game/onboarding/onboardingTypes";
import { HERO_COMBAT_ROLES } from "../../ui/heroPresentation";

const TABS = ["Overview", "Stats", "Traits", "Contract"] as const; type Tab = typeof TABS[number];
const range = (min: number, max: number) => min === max ? `${min}` : `${min}–${max}`;

export function CandidateDetailScreen({ candidateId, onBack }: { candidateId: string; onBack(): void }) {
  const { showDialog } = useGameDialog();
  const { guild, candidates, scoutCandidate, reserveCandidate, recruitCandidate, updateGuild } = useGuild();
  const [tab, setTab] = useState<Tab>("Overview"); const [message, setMessage] = useState<string>();
  const candidate = candidates.find((item) => item.candidateId === candidateId);
  const tutorialInspection = guild.tutorial.active && guild.tutorial.step === "inspect_candidate";
  const overviewVisited = guild.tutorial.inspectedCandidateId === candidateId && guild.tutorial.inspectedCandidateTabs.includes("Overview");
  useEffect(() => {
    if (candidate && tutorialInspection && !overviewVisited) updateGuild(recordTutorialCandidateTab(guild, candidateId, "Overview"));
  }, [candidate, candidateId, guild, overviewVisited, tutorialInspection, updateGuild]);
  if (!candidate) return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><EmptyState title="Candidate unavailable" message="This adventurer was recruited, passed over, refreshed, or has already left the tavern." /></ScrollView>;

  const hero = candidate.heroPreview;
  const calculated = calculateHero(hero); const instance = createHeroCombatInstance(hero); const unit = createHeroCombatUnit(hero, instance);
  const salaryCostMin = candidate.weeklySalaryEstimateMin * candidate.contractLengthWeeks; const salaryCostMax = candidate.weeklySalaryEstimateMax * candidate.contractLengthWeeks;
  const totalMin = candidate.recruitmentFeeEstimateMin + salaryCostMin; const totalMax = candidate.recruitmentFeeEstimateMax + salaryCostMax;
  const reserved = guild.recruitment.reservedCandidateId === candidateId;
  const tutorialReviewComplete = guild.tutorial.active && guild.tutorial.step === "recruit_first" && guild.tutorial.inspectedCandidateId === candidateId;
  const visitedTabs = guild.tutorial.inspectedCandidateId === candidateId ? guild.tutorial.inspectedCandidateTabs : [];
  const favored = CLASSES[hero.classId].favoredAttributeIds;
  const livingHeroes = guild.heroes.filter((entry) => entry.currentHP > 0);
  const currentPayroll = guild.heroContracts.filter((contract) => livingHeroes.some((entry) => entry.id === contract.heroId)).reduce((sum, contract) => sum + contract.weeklySalary, 0);
  const presentation = getCandidateRecruitmentPresentation(candidate, livingHeroes, guild.currentDay, guild.gold, currentPayroll);
  const visitTab = (next: Tab) => { setTab(next); if (tutorialInspection) updateGuild(recordTutorialCandidateTab(guild, candidateId, next as TutorialCandidateTab)); };
  const run = (action: () => string | null, success: string) => { const error = action(); setMessage(error ?? success); };
  const confirm = () => showDialog({ title: `Sign ${hero.name}?`, message: `${presentation.roleLabel} · ${presentation.fitLabel}\nEstimated fee: ${range(candidate.recruitmentFeeEstimateMin, candidate.recruitmentFeeEstimateMax)} gold\nSalary demand: ${range(candidate.weeklySalaryEstimateMin, candidate.weeklySalaryEstimateMax)} gold/week\nProjected payroll: ${range(presentation.payrollAfterMin, presentation.payrollAfterMax)} gold/week\nContract: ${candidate.contractLengthWeeks} weeks\nEstimated total contract cost: ${range(totalMin, totalMax)} gold`, eyebrow: "GUILD CONTRACT", actions: [{ label: "Keep Looking", tone: "secondary" }, { label: "Sign Contract", tone: "primary", onPress: () => { const error = recruitCandidate(candidateId); if (error) setMessage(error); else onBack(); } }] });
  const nextScout = Math.min(3, candidate.scoutingLevel + 1) as ScoutingLevel;

  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.eyebrow}>ADVENTURER DOSSIER</Text>
    <View style={styles.identity}><Portrait hero={hero} size={96} /><View style={styles.flex}><Text style={[styles.title, { color: getRaceNameColor(hero.raceId) }]}>{hero.name}</Text><Text style={styles.gold}>{RACES[hero.raceId].name} · {CLASSES[hero.classId].name} · Lv {hero.level}</Text><Text style={styles.role}>{HERO_COMBAT_ROLES[hero.classId]}</Text><View style={styles.chips}><StatusChip label={presentation.roleLabel} tone="blue"/><StatusChip label={presentation.qualityLabel} tone={presentation.qualityTone}/><StatusChip label={presentation.fitLabel} tone={presentation.fitTone}/>{reserved ? <StatusChip label="RESERVED" tone="blue"/> : <StatusChip label={presentation.expiryLabel} tone={presentation.expiryTone}/>}</View><Text style={styles.meta}>Age {hero.age} · {candidate.archetype.toUpperCase()} · {BACKGROUNDS[hero.backgroundId ?? "farmhand"].name}</Text></View></View>
    <Panel style={styles.guildFit}><Text style={styles.guildFitLabel}>GUILD FIT</Text><Text style={styles.guildFitTitle}>{presentation.fitLabel}</Text><Text style={styles.guildFitText}>{presentation.fitDetail}</Text><Text style={styles.guildFitEconomy}>{presentation.economyLabel} · After minimum fee: {presentation.goldAfterMinimumFee} G · Payroll becomes {range(presentation.payrollAfterMin, presentation.payrollAfterMax)} G/week</Text></Panel>
    {message && <Panel style={styles.messagePanel}><Text style={styles.message}>{message}</Text></Panel>}

    {(tutorialInspection || tutorialReviewComplete) && <Panel style={styles.tutorial}><Text style={styles.tutorialTitle}>{tutorialReviewComplete ? "CORE REVIEW COMPLETE" : "CANDIDATE REVIEW"}</Text><Text style={styles.tutorialText}>{tutorialReviewComplete ? "You have enough information to sign your first contract. Return to the tavern board when ready, or keep reading the remaining tabs. Comparing candidates is optional." : tab === "Overview" ? "Start with role fit and Overview. Then inspect either Stats or Traits to unlock your first contract. Contract shows the long-term payroll cost." : tab === "Stats" ? `${CLASSES[hero.classId].name} favors ${favored.map((key) => key[0]!.toUpperCase() + key.slice(1)).join(" and ")}. Green values support this class's combat role.` : tab === "Traits" ? "Traits can be strengths or drawbacks. Read their exact effects and decide whether they improve the role you need." : "Upfront fee is paid now; weekly salary repeats through the contract. A powerful recruit who breaks payroll is not a good early hire."}</Text><Text style={styles.tutorialProgress}>Required: {visitedTabs.includes("Overview") ? "✓" : "○"} Overview   {visitedTabs.includes("Stats") || visitedTabs.includes("Traits") ? "✓" : "○"} Stats or Traits{"\n"}Recommended: {TABS.filter((item) => !visitedTabs.includes(item)).length ? TABS.filter((item) => !visitedTabs.includes(item)).join(" · ") : "Full review complete"}</Text></Panel>}

    <SegmentedTabs values={TABS} value={tab} onChange={visitTab} />
    {tab === "Overview" && <><Panel><Text style={styles.sectionLabel}>SCOUT REPORT</Text>{candidate.source === "regional_scout" && <Text style={styles.reportSource}>REGIONAL SOURCE · {candidate.sourceLocationName}</Text>}<View style={styles.offerGrid}><View style={styles.offerCell}><Text style={styles.offerLabel}>POTENTIAL</Text><Text style={styles.offerGood}>{range(candidate.potentialEstimateMin, candidate.potentialEstimateMax)}</Text><Text style={styles.meta}>{potentialRating(candidate.potentialEstimateMin)}–{potentialRating(candidate.potentialEstimateMax)}</Text></View><View style={styles.offerCell}><Text style={styles.offerLabel}>FEE</Text><Text style={styles.offerValue}>{range(candidate.recruitmentFeeEstimateMin, candidate.recruitmentFeeEstimateMax)} G</Text></View><View style={styles.offerCell}><Text style={styles.offerLabel}>PAY</Text><Text style={styles.offerValue}>{range(candidate.weeklySalaryEstimateMin, candidate.weeklySalaryEstimateMax)}/WK</Text></View></View><Text style={styles.line}>Contract preference: {candidate.contractLengthWeeks} weeks</Text><Text style={styles.line}>Scouting: Level {candidate.scoutingLevel}/3</Text><Text style={styles.line}>Departure: Day {candidate.expiresAtDay} · {presentation.expiryLabel}</Text></Panel><View style={styles.actions}>{candidate.scoutingLevel < 3 && <View style={styles.flex}><SecondaryButton label={`SCOUT · ${scoutingCost(nextScout)}G`} disabled={guild.tutorial.active} onPress={() => run(() => scoutCandidate(candidateId), "Scouting report improved and estimates narrowed.")} /></View>}<View style={styles.flex}><SecondaryButton label={reserved ? "RESERVED" : `RESERVE · ${RECRUITMENT_CONFIG.reservationCost}G`} disabled={reserved || guild.tutorial.active} onPress={() => run(() => reserveCandidate(candidateId), `${hero.name} reserved.`)} /></View></View>{candidate.scoutingLevel < 3 && <Text style={styles.scoutHint}>Further scouting narrows potential, recruitment fee, weekly salary, and attributes. Expert scouting reveals exact figures.</Text>}<ActionButton label={guild.tutorial.active ? "RETURN TO TAVERN BOARD" : guild.recruitment.batchRecruitmentUsed ? "REFRESH BOARD FIRST" : guild.heroes.length >= RECRUITMENT_CONFIG.heroCapacity ? "GUILD CAPACITY REACHED" : !presentation.affordable ? "INSUFFICIENT GOLD" : "SIGN CONTRACT"} disabled={guild.tutorial.active || guild.recruitment.batchRecruitmentUsed || guild.heroes.length >= RECRUITMENT_CONFIG.heroCapacity || !presentation.affordable} onPress={confirm} /></>}
    {tab === "Stats" && <><Panel><Text style={styles.sectionLabel}>ESTIMATED ATTRIBUTES</Text>{ATTRIBUTE_KEYS.map((key) => { const preferred = isClassAttribute(hero.classId, key); const estimate = candidate.attributeEstimates[key]; const scoreText = range(estimate.minimum, estimate.maximum); const modifierText = range(Number(formatAbilityModifier(estimate.minimum)), Number(formatAbilityModifier(estimate.maximum))); return <View key={key} style={styles.statRow}><Text style={[styles.meta, preferred && styles.classAttribute]}>{key.toUpperCase()}</Text><Text style={[styles.value, preferred && styles.classAttribute]}>{scoreText} · MOD {modifierText}</Text></View>; })}<Text style={styles.classHint}>Green attributes are favored by this class. Scouting narrows every estimate; recruited heroes show exact values.</Text></Panel>{candidate.scoutingLevel === 3 ? <Panel style={styles.panelGap}><Text style={styles.sectionLabel}>DERIVED COMBAT STATS</Text>{Object.entries(calculated.stats).map(([key, value]) => <View key={key} style={styles.statRow}><Text style={styles.meta}>{key}</Text><Text style={styles.value}>{key === "criticalChance" ? `${(value * 100).toFixed(1)}%` : Math.round(value)}</Text></View>)}<View style={styles.statRow}><Text style={styles.meta}>Armor Class</Text><Text style={styles.value}>{unit.stats.armorClass}</Text></View><View style={styles.statRow}><Text style={styles.meta}>Movement Range</Text><Text style={styles.value}>{unit.movementRange}</Text></View></Panel> : <Panel style={styles.panelGap}><Text style={styles.meta}>Exact derived combat statistics unlock with Expert scouting or after recruitment.</Text></Panel>}</>}
    {tab === "Traits" && <>{hero.traitIds.map((id) => <Panel key={id} style={styles.panelGap}><Text style={styles.value}>{TRAITS[id].name} · {TRAITS[id].category.toUpperCase()}</Text><Text style={styles.traitDescription}>{TRAITS[id].description}</Text>{TRAITS[id].modifiers.map((modifier, index) => <Text key={index} style={styles.line}>{getModifierTargetLabel(modifier.target)}: {modifier.value >= 0 ? "+" : ""}{modifier.operation === "percentage" ? `${modifier.value * 100}%` : modifier.value}{modifier.condition ? " while HP ratio ≤ 0.50" : ""}</Text>)}</Panel>)}</>}
    {tab === "Contract" && <Panel style={styles.contract}><Text style={styles.sectionLabel}>CONTRACT FORECAST</Text><Text style={styles.line}>Upfront fee estimate: {range(candidate.recruitmentFeeEstimateMin, candidate.recruitmentFeeEstimateMax)} gold</Text><Text style={styles.line}>Weekly salary demand: {range(candidate.weeklySalaryEstimateMin, candidate.weeklySalaryEstimateMax)} gold</Text><Text style={styles.line}>Current living-roster payroll: {currentPayroll} gold/week</Text><Text style={styles.line}>Projected payroll after hire: {range(presentation.payrollAfterMin, presentation.payrollAfterMax)} gold/week</Text><Text style={styles.line}>Contract length: {candidate.contractLengthWeeks} weeks</Text><Text style={styles.value}>Estimated salary over contract: {range(salaryCostMin, salaryCostMax)} gold</Text><Text style={styles.total}>Estimated full contract cost: {range(totalMin, totalMax)} gold</Text><Text style={styles.meta}>Estimates become exact at Expert scouting. Loyalty later affects renewal demands, not this initial contract.</Text></Panel>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 55 },
  eyebrow:{color:colors.gold,fontSize:10,fontWeight:"900",letterSpacing:1.3,marginTop:12},
  identity: { alignItems: "center", flexDirection: "row", gap: 14, marginVertical: 14 },
  flex: { flex: 1 },
  title: { color: colors.text, fontSize: 27, fontWeight: "900" },
  gold: { color: colors.gold, fontWeight: "800", marginTop: 3 },
  role:{color:colors.blue,fontSize:9,fontWeight:"900",letterSpacing:.7,marginTop:4},
  chips:{flexDirection:"row",flexWrap:"wrap",gap:4,marginTop:7},
  meta: { color: colors.muted, fontSize: 10, marginTop: 3 },
  guildFit:{borderColor:colors.gold,gap:4,marginBottom:10},guildFitLabel:{color:colors.gold,fontSize:8,fontWeight:"900",letterSpacing:1},guildFitTitle:{color:colors.text,fontSize:17,fontWeight:"900"},guildFitText:{color:colors.muted,fontSize:11,lineHeight:17},guildFitEconomy:{color:colors.text,fontSize:10,fontWeight:"800",lineHeight:15,marginTop:4},
  messagePanel:{borderColor:colors.green,marginBottom:10,padding:9},message: { color: colors.green, fontWeight:"800" },
  reportSource: { color: colors.blue, fontSize: 10, fontWeight: "900", letterSpacing: .7, marginBottom: 8 },
  sectionLabel:{color:colors.gold,fontSize:8,fontWeight:"900",letterSpacing:1,marginBottom:8},
  value: { color: colors.text, fontWeight: "900", fontSize: 14 },
  traitDescription: { color: colors.muted, lineHeight: 19, marginTop: 5 },
  classAttribute: { color: colors.green, fontWeight: "900" },
  classHint: { color: colors.green, fontSize: 10, fontWeight: "700", marginTop: 9 },
  line: { color: colors.text, fontSize:11, marginTop: 8 },
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderColor: colors.border },
  actions: { flexDirection: "row", gap: 8, marginVertical: 12 },
  scoutHint: { color: colors.muted, lineHeight: 18, marginBottom: 12, fontSize:11 },
  panelGap: { marginTop: 10 },
  total: { color: colors.gold, fontWeight: "900", fontSize: 18, marginTop: 14 },
  contract:{borderColor:colors.gold},
  tutorial:{borderColor:colors.gold,gap:7,marginBottom:10}, tutorialTitle:{color:colors.gold,fontSize:11,fontWeight:"900",letterSpacing:.8}, tutorialText:{color:colors.text,lineHeight:19}, tutorialProgress:{color:colors.green,fontSize:10,fontWeight:"800",lineHeight:18},
  offerGrid:{flexDirection:"row",flexWrap:"wrap",gap:8}, offerCell:{backgroundColor:"transparent",flexBasis:"45%",flexGrow:1,minWidth:100,padding:4}, offerLabel:{color:colors.muted,fontSize:10,fontWeight:"500",letterSpacing:0}, offerValue:{color:colors.text,fontSize:13,fontWeight:"900",marginTop:3}, offerGood:{color:colors.green,fontSize:13,fontWeight:"900",marginTop:3},
});
