import { getRecruitmentRecommendation } from "../game/recruitment/recruitmentRecommendationService";
import { formerMemberRehireFee, formerMemberRehireSalary, rehireFormerMember } from "../game/recruitment/recruitmentService";
import React, { useEffect, useRef, useState } from "react";
import { LocationArtwork } from "../components/art/LocationArtwork";
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useGameDialog } from "../components/dialogs/GameDialog";
import { ActionButton, BackButton, Panel, Portrait, SecondaryButton, SegmentedTabs, SectionTitle, StatusChip, colors } from "../components/ui";
import { CLASSES } from "../data/classes/classes";
import { RACES } from "../data/races/races";
import { RECRUITMENT_CONFIG } from "../data/recruitment/recruitmentBalance";
import { TRAITS } from "../data/traits/traits";
import { completeTutorial, skipTutorial } from "../game/onboarding/tutorialService";
import type { RecruitmentCandidate } from "../game/recruitment/recruitmentTypes";
import { getCandidateRecruitmentPresentation, getRosterRoleSummary, type RecruitmentUiTone } from "../game/recruitment/recruitmentPresentationService";
import { useGuild } from "../state/GuildContext";
import { getRaceNameColor } from "../ui/raceColors";
import { RegionalScoutPanel } from "./Recruitment/RegionalScoutPanel";
import { getDifficulty } from "../data/difficulty/difficulties";
import { canUsePaidRecruitmentRefresh } from "../game/onboarding/starterJourneyService";

const range = (min: number, max: number) => min === max ? `${min}` : `${min}–${max}`;
const toneColor = (tone: RecruitmentUiTone) => tone === "good" ? colors.green : tone === "gold" ? colors.gold : tone === "danger" ? colors.danger : tone === "blue" ? colors.blue : colors.border;

export function RecruitmentScreen({ onBack, inspect, openCalendar, openCampaign }: { onBack(): void; inspect(candidate: RecruitmentCandidate): void; openCalendar(): void; openCampaign(): void }) {
  const { showDialog } = useGameDialog();
  const { candidates, guild, refreshCandidates, recruitCandidate, rejectCandidate, updateGuild } = useGuild();
  const [message, setMessage] = useState<string>();
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"All" | "Board" | "Scout">("All");
  const [section,setSection]=useState<"Candidates"|"Scouting"|"Alumni">("Candidates");
  const [sort, setSort] = useState<"Potential" | "Fee" | "Salary" | "Expiry">("Potential");
  const displayedCandidates = candidates.filter(candidate => sourceFilter === "All" || candidate.source === (sourceFilter === "Scout" ? "regional_scout" : "guild_board")).filter(candidate => `${candidate.heroPreview.name} ${RACES[candidate.heroPreview.raceId].name} ${CLASSES[candidate.heroPreview.classId].name}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => sort === "Fee" ? a.recruitmentFeeEstimateMin - b.recruitmentFeeEstimateMin : sort === "Salary" ? a.weeklySalaryEstimateMin - b.weeklySalaryEstimateMin : sort === "Expiry" ? a.expiresAtDay - b.expiresAtDay : b.potentialEstimateMax - a.potentialEstimateMax);
  const [showPartyFit, setShowPartyFit] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [expandedCandidateId,setExpandedCandidateId]=useState<string>();
  const scrollRef = useRef<ScrollView>(null);
  const refreshPulse = useRef(new Animated.Value(1)).current;
  const formerMembers = [...guild.recruitment.formerMembers].sort((a,b) => {
    const rank = (member: typeof a) => member.departureKind === "retired" ? 2 : member.eligibleReturnDay <= guild.currentDay ? 0 : 1;
    return rank(a) - rank(b) || b.hero.level - a.hero.level || b.departedDay - a.departedDay;
  });
  const confirmRehire = (heroId:string) => {
    const member=guild.recruitment.formerMembers.find((entry)=>entry.hero.id===heroId); if(!member||member.departureKind==="retired")return;
    const fee=formerMemberRehireFee(member); const salary=formerMemberRehireSalary(member);
    showDialog({ title:`Invite ${member.hero.name} Back?`, message:`Level ${member.hero.level} ${CLASSES[member.hero.classId].name}\nSigning bonus: ${fee} gold\nNew salary: ${salary} gold/week\nContract: 12 weeks\n\nThey keep their level, XP, skills, traits, potential and personal history. Their old equipment remains in guild inventory.`, eyebrow:"FORMER GUILD MEMBER", actions:[{label:"Cancel",tone:"secondary"},{label:"Rehire",tone:"primary",onPress:()=>{try{updateGuild(rehireFormerMember(guild,heroId));setMessage(member.hero.name+" returned to the guild.");}catch(error){setMessage(error instanceof Error?error.message:"Could not rehire hero");}}}]});
  };

  const freeReady = guild.currentDay >= guild.recruitment.nextFreeRefreshDay;
  const paidRefreshAllowed = getDifficulty(guild.difficultyId).allowsPaidRecruitmentRefresh || canUsePaidRecruitmentRefresh(guild);
  const tutorial = guild.tutorial.active ? guild.tutorial.step : null;
  const tutorialRefresh = tutorial === "refresh_board";
  const livingHeroes = guild.heroes.filter((hero) => hero.currentHP > 0);
  const roleSummary = getRosterRoleSummary(livingHeroes);
  const currentPayroll = guild.heroContracts.filter((contract) => livingHeroes.some((hero) => hero.id === contract.heroId)).reduce((sum, contract) => sum + contract.weeklySalary, 0);
  const tutorialCopy = tutorial === "inspect_candidate"
    ? "Inspect one adventurer. Start with role fit and Overview, then read Stats or Traits. The strongest-looking recruit is not always the best hire: party role, upfront fee, weekly payroll, and contract length all matter."
    : tutorial === "recruit_first"
        ? "Review complete. Sign your first contract when you are ready. Choose a role and salary that suit your guild. Comparing candidates is optional."
        : tutorialRefresh
          ? "A candidate batch allows one hire. Refresh the tavern board now; this guided refresh is free and required before hero 2."
          : tutorial === "recruit_second"
            ? "Choose exactly one adventurer from the refreshed arrivals. A balanced first party benefits from complementary frontline, support, and ranged roles."
            : tutorial === "party_complete"
              ? "Your first company is formed. The War Table will now guide your most important next order. Start Chapter 1 and clear the guildhall cellar to earn Guildhaven's trust."
              : null;
  const leaveRecruitment = () => { if (tutorial === "party_complete") updateGuild(completeTutorial(guild)); onBack(); };
  const beginCampaign = () => { updateGuild(completeTutorial(guild)); openCampaign(); };
  const act = (action: () => string | null, success: string) => { const beforeHeroes=guild.heroes.length; const beforeGold=guild.gold; const error = action(); if(error){setMessage(error);return;} const hired=guild.heroes.length>beforeHeroes; setMessage(hired?`${success} · Roster ${beforeHeroes} → ${guild.heroes.length} · Treasury ${beforeGold.toLocaleString()} → ${guild.gold.toLocaleString()}G`:success); };
  const confirmRecruit = (candidate: RecruitmentCandidate) => {
    const presentation = getCandidateRecruitmentPresentation(candidate, livingHeroes, guild.currentDay, guild.gold, currentPayroll);
    showDialog({
      title: `Sign ${candidate.heroPreview.name}?`,
      message: `${presentation.roleLabel} · ${presentation.fitLabel}\nEstimated fee: ${range(candidate.recruitmentFeeEstimateMin, candidate.recruitmentFeeEstimateMax)} gold\nSalary demand: ${range(candidate.weeklySalaryEstimateMin, candidate.weeklySalaryEstimateMax)} gold/week\nProjected payroll: ${range(presentation.payrollAfterMin, presentation.payrollAfterMax)} gold/week\nContract: ${candidate.contractLengthWeeks} weeks`,
      eyebrow: "GUILD CONTRACT",
      actions: [{ label: "Keep Looking", tone: "secondary" }, { label: "Sign Contract", tone: "primary", onPress: () => act(() => recruitCandidate(candidate.candidateId), `${candidate.heroPreview.name} joined the guild.`) }],
    });
  };
  const toggleCompare = (id: string) => {
    const next = compareIds.includes(id) ? compareIds.filter((item) => item !== id) : compareIds.length < 3 ? [...compareIds, id] : compareIds;
    setCompareIds(next);
  };
  const compared = candidates.filter((item) => compareIds.includes(item.candidateId));
  const potentialLeader = compared.reduce<RecruitmentCandidate | undefined>((best, candidate) => !best || candidate.potentialEstimateMax > best.potentialEstimateMax ? candidate : best, undefined);
  const salaryLeader = compared.reduce<RecruitmentCandidate | undefined>((best, candidate) => !best || candidate.weeklySalaryEstimateMin < best.weeklySalaryEstimateMin ? candidate : best, undefined);

  useEffect(() => {
    if (!tutorialRefresh) { refreshPulse.setValue(1); return; }
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(refreshPulse, { toValue: .45, duration: 650, useNativeDriver: true }),
      Animated.timing(refreshPulse, { toValue: 1, duration: 650, useNativeDriver: true }),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, [tutorialRefresh, refreshPulse]);

  return <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
    <BackButton onPress={leaveRecruitment} />
    <LocationArtwork location="tavern" />
    <Text style={styles.eyebrow}>GUILDHAVEN TAVERN</Text>
    <Text style={styles.title}>Adventurers for Hire</Text>
    <Text style={styles.intro}>Inspect each adventurer’s skills and contract before hiring.</Text>

    <Panel style={styles.guildPlate}>
      <View style={styles.guildPlateTop}><View><Text style={styles.plateLabel}>RECRUITMENT BOARD</Text><Text style={styles.plateValue}>{candidates.length} adventurer{candidates.length === 1 ? "" : "s"} available</Text></View><StatusChip label={`DAY ${guild.currentDay}`} tone="gold" /></View>
      <View style={styles.guildStats}><View style={styles.stat}><Text style={styles.statLabel}>ROSTER</Text><Text style={styles.statValue}>{guild.heroes.length}/{RECRUITMENT_CONFIG.heroCapacity}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>TREASURY</Text><Text style={styles.goldValue}>{guild.gold.toLocaleString()} G</Text></View><View style={styles.stat}><Text style={styles.statLabel}>PAYROLL</Text><Text style={styles.statValue}>{currentPayroll}/WK</Text></View></View>
      {showPartyFit && <View style={styles.roleRow}>{roleSummary.labels.map((label) => <StatusChip key={label} label={label} tone={roleSummary.missing.some((role) => label.startsWith(role.toUpperCase())) ? "danger" : "neutral"} />)}</View>}
      <Pressable accessibilityRole="button" accessibilityLabel="Party role coverage" aria-expanded={showPartyFit} accessibilityState={{ expanded: showPartyFit }} onPress={() => setShowPartyFit(value => !value)} style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ color: colors.muted, fontSize: 11 }}>Party role coverage {showPartyFit ? "−" : "+"}</Text></Pressable>
      {roleSummary.missing.length > 0 ? <Text style={styles.needText}>GUILD NEED · {roleSummary.missing.map((role) => role.toUpperCase()).join(" · ")}</Text> : null}
    </Panel>

    {tutorialCopy && <Panel style={styles.tutorial}><Text style={styles.tutorialStep}>FIRST GUILD PARTY · {guild.heroes.length}/2 HEROES</Text><Text style={styles.tutorialTitle}>{tutorial === "inspect_candidate" ? "Read the Adventurer" : tutorial === "recruit_first" ? "Sign Your First Contract" : tutorialRefresh ? "Bring in New Arrivals" : tutorial === "recruit_second" ? "Complete the First Company" : "Your First Party Is Ready"}</Text><Text style={styles.tutorialText}>{tutorialCopy}</Text>{tutorial === "party_complete" ? <ActionButton label="BEGIN CHAPTER 1" onPress={beginCampaign} /> : <SecondaryButton label="Skip Recruitment Tutorial" onPress={() => updateGuild(skipTutorial(guild))} />}</Panel>}

    <Animated.View style={{ opacity: refreshPulse }}><Panel style={[styles.refresh, tutorialRefresh && styles.tutorialTarget]}><View style={styles.flex}><Text style={styles.name}>New arrivals</Text><Text style={styles.meta}>{tutorialRefresh ? "Guided refresh · FREE" : `Next free refresh · ${freeReady ? "READY" : `${guild.recruitment.nextFreeRefreshDay - guild.currentDay} DAYS`}`}</Text><Text style={styles.meta}>{tutorialRefresh ? "Required before recruiting hero 2" : guild.recruitment.batchRecruitmentUsed ? "One contract signed from this batch · refresh required" : paidRefreshAllowed ? `Manual refresh · ${guild.recruitment.manualRefreshCost} gold` : "Iron Guild · gold refresh returns after Brambleford"}</Text></View><View style={styles.refreshButtons}><SecondaryButton label={tutorialRefresh ? "Free refresh" : freeReady ? "Free refresh" : paidRefreshAllowed ? `Refresh · ${guild.recruitment.manualRefreshCost}G` : "Wait for refresh"} disabled={(Boolean(tutorial) && !tutorialRefresh) || (!tutorialRefresh && !freeReady && (!paidRefreshAllowed || guild.gold < guild.recruitment.manualRefreshCost))} onPress={() => act(() => refreshCandidates(freeReady), "New adventurers arrived at the tavern.")} /></View></Panel></Animated.View>

    <SegmentedTabs values={["Candidates","Scouting","Alumni"] as const} value={section} onChange={setSection}/>
    {section==="Scouting"&&<RegionalScoutPanel openCalendar={openCalendar} />}
    {message && <Panel style={styles.messagePanel}><Text style={styles.message}>{message}</Text></Panel>}

    {section==="Candidates"&&<><SectionTitle>CANDIDATES</SectionTitle>
    {!tutorial && <View style={{gap: 8, marginBottom: 12}}><TextInput accessibilityLabel="Search recruits" placeholder="Search recruits by name, race, or class" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={{color:colors.text, backgroundColor:colors.panel2, borderRadius:12, padding:12}} /><SegmentedTabs values={["All", "Board", "Scout"] as const} value={sourceFilter} onChange={setSourceFilter} /><SegmentedTabs values={["Potential", "Fee", "Salary", "Expiry"] as const} value={sort} onChange={setSort} />{!displayedCandidates.length && <Text style={styles.meta}>No adventurers match these filters.</Text>}</View>}
    {displayedCandidates.map((candidate) => {
      const hero = candidate.heroPreview;
      const reserved = guild.recruitment.reservedCandidateId === candidate.candidateId;
      const presentation = getCandidateRecruitmentPresentation(candidate, livingHeroes, guild.currentDay, guild.gold, currentPayroll);
      const cardBorder = toneColor(presentation.fitTone);
      const hireBlock = guild.heroes.length >= RECRUITMENT_CONFIG.heroCapacity ? "Roster full" : Boolean(tutorial) && tutorial !== "recruit_first" && tutorial !== "recruit_second" ? "Finish tutorial step" : guild.recruitment.batchRecruitmentUsed ? "Refresh first" : !presentation.affordable ? "Need gold" : undefined;
      return <Panel key={candidate.candidateId} style={[styles.card, { borderColor: cardBorder }]}>
        <View style={[styles.cardRail, { backgroundColor: cardBorder }]} />
        <View style={styles.row}><Portrait hero={hero} size={78} /><View style={styles.flex}><View style={styles.nameRow}><Text style={[styles.candidateName, { color: getRaceNameColor(hero.raceId) }]}>{hero.name}</Text>{reserved ? <StatusChip label="RESERVED" tone="blue" /> : null}</View><Text style={styles.identity}>{RACES[hero.raceId].name} · {CLASSES[hero.classId].name} · Lv {hero.level}</Text><View style={styles.chips}><StatusChip label={presentation.roleLabel} tone="blue" /><StatusChip label={presentation.qualityLabel} tone={presentation.qualityTone} /><StatusChip label={presentation.fitLabel} tone={presentation.fitTone} /><StatusChip label={presentation.expiryLabel} tone={presentation.expiryTone} /></View>{candidate.source === "regional_scout" ? <Text style={styles.scoutSource}>SCOUT REPORT · {candidate.sourceLocationName}</Text> : null}</View></View>

        <View style={styles.offerGrid}><View style={styles.offerCell}><Text style={styles.offerLabel}>SIGNING FEE</Text><Text style={styles.offerValue}>{range(candidate.recruitmentFeeEstimateMin, candidate.recruitmentFeeEstimateMax)} G</Text></View><View style={styles.offerCell}><Text style={styles.offerLabel}>SALARY</Text><Text style={styles.offerValue}>{range(candidate.weeklySalaryEstimateMin, candidate.weeklySalaryEstimateMax)}/WK</Text></View></View>
        <Text style={styles.fitDetail}>Potential {range(candidate.potentialEstimateMin, candidate.potentialEstimateMax)} · {presentation.fitLabel} · {candidate.contractLengthWeeks} weeks</Text><Pressable onPress={()=>setExpandedCandidateId(expandedCandidateId===candidate.candidateId?undefined:candidate.candidateId)}><Text style={styles.expand}>{expandedCandidateId===candidate.candidateId?"Hide details":"More details +"}</Text></Pressable>{expandedCandidateId===candidate.candidateId&&<><Text style={styles.fitDetail}>{presentation.fitDetail}</Text>{getRecruitmentRecommendation(guild, candidate) && <Text style={styles.fitDetail}>Recommended by {getRecruitmentRecommendation(guild, candidate)!.heroName}: {getRecruitmentRecommendation(guild, candidate)!.reason}.</Text>}<Text style={styles.traits}>TRAITS · {hero.traitIds.map((id) => TRAITS[id].name).join(" · ")}</Text><View style={styles.economyLine}><StatusChip label={presentation.economyLabel} tone={presentation.economyTone} /><Text style={styles.economyText}>After min. fee: {presentation.goldAfterMinimumFee} G · Payroll after hire: {range(presentation.payrollAfterMin, presentation.payrollAfterMax)} G/week</Text></View></>}

        <View style={styles.actions}><View style={styles.flex}><SecondaryButton label="Inspect" onPress={() => inspect(candidate)} /></View><View style={styles.flex}><ActionButton label={hireBlock ?? "Hire"} disabled={Boolean(hireBlock)} onPress={() => confirmRecruit(candidate)} /></View></View>
        <View style={styles.secondaryActions}><Pressable onPress={() => toggleCompare(candidate.candidateId)} style={styles.compare}><Text style={styles.compareText}>{compareIds.includes(candidate.candidateId) ? "✓ IN COMPARISON" : "COMPARE"}</Text></Pressable><Pressable disabled={Boolean(tutorial)} onPress={() => act(() => rejectCandidate(candidate.candidateId), `${hero.name} left the candidate board.`)}><Text style={[styles.reject, tutorial && styles.disabled]}>PASS</Text></Pressable></View>
      </Panel>;
    })}

    {compared.length >= 2 && <Panel style={styles.comparison}><Text style={styles.panelEyebrow}>GUILDMASTER'S DESK</Text><Text style={styles.name}>Candidate Comparison</Text>{potentialLeader && salaryLeader && <View style={styles.tradeoff}><Text style={styles.tradeoffTitle}>DECISION TRADEOFF</Text><Text style={styles.tradeoffText}>{potentialLeader.heroPreview.name} has the highest estimated potential ceiling ({potentialLeader.potentialEstimateMax}). {salaryLeader.heroPreview.name} has the lowest estimated salary floor ({salaryLeader.weeklySalaryEstimateMin} gold/week).</Text><Text style={styles.tradeoffLesson}>{potentialLeader.candidateId === salaryLeader.candidateId ? `${potentialLeader.heroPreview.name} currently leads on both measures. Check role fit, class, traits, and fee before signing.` : "Higher potential favors long-term growth; lower salary preserves treasury for equipment, healing, facilities, and future recruits."}</Text></View>}<View style={styles.compareGrid}>{compared.map((candidate) => { const p = getCandidateRecruitmentPresentation(candidate, livingHeroes, guild.currentDay, guild.gold, currentPayroll); return <View key={candidate.candidateId} style={styles.compareColumn}><Text numberOfLines={1} style={[styles.columnName, { color: getRaceNameColor(candidate.heroPreview.raceId) }]}>{candidate.heroPreview.name}</Text><StatusChip label={p.roleLabel} tone="blue" /><Text style={styles.meta}>{CLASSES[candidate.heroPreview.classId].name} · Lv {candidate.heroPreview.level}</Text><Text style={styles.potential}>POT {candidate.potentialEstimateMin}–{candidate.potentialEstimateMax}</Text><Text style={styles.meta}>Fee {range(candidate.recruitmentFeeEstimateMin, candidate.recruitmentFeeEstimateMax)}</Text><Text style={styles.meta}>Pay {range(candidate.weeklySalaryEstimateMin, candidate.weeklySalaryEstimateMax)}/wk</Text><Text style={[styles.fitMini, { color: toneColor(p.fitTone) }]}>{p.fitLabel}</Text></View>; })}</View></Panel>}
  </>}{section==="Alumni"&&(formerMembers.length>0?<><Text style={styles.formerHeading}>GUILD ALUMNI · {formerMembers.length}</Text><Text style={styles.formerIntro}>Departed heroes keep their history here. Contract alumni may return after time away; retired veterans remain honored members of the guild's story.</Text>{formerMembers.map((member)=>{const retired=member.departureKind==="retired";const eligible=!retired&&member.eligibleReturnDay<=guild.currentDay;const fee=retired?0:formerMemberRehireFee(member);const salary=retired?0:formerMemberRehireSalary(member);return <Panel key={member.hero.id} style={[styles.formerCard,!eligible&&!retired&&styles.formerCooling,retired&&styles.retiredCard]}><View style={styles.row}><Portrait hero={member.hero} size={62}/><View style={styles.flex}><Text style={[styles.name,{color:getRaceNameColor(member.hero.raceId)}]}>{member.hero.name}</Text><Text style={styles.meta}>{RACES[member.hero.raceId].name} {CLASSES[member.hero.classId].name} · Lv {member.hero.level}</Text><Text style={[styles.formerMeta,retired&&styles.retiredMeta]}>{retired?`Retired Day ${member.departedDay} · HONORED ALUMNUS`:`Left Day ${member.departedDay} · ${eligible?"AVAILABLE TO RETURN":"Can return Day "+member.eligibleReturnDay}`}</Text><Text style={styles.cost}>{retired?`${member.hero.history.questsCompleted} completed quests · full chronicle preserved`:`Return fee ${fee} · Salary ${salary}/wk · 12-week contract`}</Text></View></View><ActionButton label={retired?"Retired Veteran":!eligible?"Away for "+(member.eligibleReturnDay-guild.currentDay)+" more day(s)":guild.heroes.length>=RECRUITMENT_CONFIG.heroCapacity?"Roster Full":guild.gold<fee?"Need "+fee+" Gold":"Invite Back"} disabled={retired||!eligible||guild.heroes.length>=RECRUITMENT_CONFIG.heroCapacity||guild.gold<fee} onPress={()=>confirmRehire(member.hero.id)}/></Panel>;})}</>}</ScrollView>;
}

const styles = StyleSheet.create({ cost: {color: colors.text, fontWeight: "800", marginTop: 5},formerHeading:{color:colors.gold,fontSize:10,fontWeight:"900",letterSpacing:1,marginBottom:4,marginTop:4},formerIntro:{color:colors.muted,fontSize:10,lineHeight:15,marginBottom:8},formerCard:{borderColor:"#705b3e",gap:8,marginBottom:8},formerCooling:{opacity:.64},retiredCard:{borderColor:"#7e7459"},retiredMeta:{color:colors.gold},formerMeta:{color:colors.green,fontSize:9,fontWeight:"900",marginTop:4},
  content: { padding: 18, paddingBottom: 55 },
  eyebrow: {color: colors.gold, fontSize: 10, fontWeight: "500", letterSpacing: .3, marginTop: 0},
  title: {color: colors.text, fontWeight: "900", marginTop: 4, fontSize: 25, lineHeight: 31},
  intro: { color: colors.muted, lineHeight: 19, marginBottom: 12, marginTop: 5 },
  guildPlate: { borderColor: colors.panel, gap: 9, marginBottom: 12 },
  guildPlateTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  plateLabel: { color: colors.muted, fontSize: 9, fontWeight: "500", letterSpacing: .3 },
  plateValue: { color: colors.text, fontSize: 17, fontWeight: "900", marginTop: 2 },
  guildStats: { flexDirection: "row", gap: 7 },
  stat: { backgroundColor: "transparent", borderColor: colors.border, flex: 1, padding: 8, borderWidth: 0, borderRadius: 10, },
  statLabel: { color: colors.muted, fontSize: 7, fontWeight: "500", letterSpacing: .3 },
  statValue: { color: colors.text, fontSize: 14, fontWeight: "900", marginTop: 3 },
  goldValue: { color: colors.gold, fontSize: 14, fontWeight: "900", marginTop: 3 },
  roleRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  needText: { color: colors.danger, fontSize: 10, fontWeight: "900" },
  tutorial: { borderColor: colors.gold, gap: 8, marginBottom: 12 },
  tutorialStep: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  tutorialTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  tutorialText: { color: colors.muted, lineHeight: 18 },
  tutorialTarget: { borderColor: colors.green, borderWidth: 2 },
  refresh: {gap: 10, justifyContent: "space-between", marginBottom: 12, flexDirection: "row", alignItems: "center"},
  refreshButtons: { minWidth: 0, maxWidth: 130},
  panelEyebrow: { color: colors.muted, fontSize: 8, fontWeight: "500", letterSpacing: .3 },
  name: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 2 },
  meta: { color: colors.muted, fontSize: 10, marginTop: 3 },
  flex: { flex: 1 },
  messagePanel: { borderColor: colors.green, marginBottom: 10, padding: 9 },
  message: { color: colors.green, fontWeight: "800" },
  card: { marginBottom: 12, overflow: "hidden", paddingLeft: 18 },
  cardRail: { bottom: 0, left: 0, position: "absolute", top: 0, width: 5 },
  row: { flexDirection: "row", gap: 12 },
  nameRow: {flexWrap: "wrap", gap: 6, flexDirection: "column", alignItems: "flex-start"},
  candidateName: {flexShrink: 1, fontWeight: "700", fontSize: 20, lineHeight: 25},
  identity: {color: colors.text, marginTop: 3, fontWeight: "400", fontSize: 12, lineHeight: 18},
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 7 },
  scoutSource: { color: colors.blue, fontSize: 9, fontWeight: "900", letterSpacing: .6, marginTop: 6 },
  offerGrid: { flexDirection: "row", gap: 6, marginTop: 11 },
  offerCell: {backgroundColor: "transparent", borderColor: colors.border, flex: 1, borderWidth: 0, borderRadius: 10, padding: 4},
  offerLabel: {color: colors.muted, fontWeight: "500", letterSpacing: .3, fontSize: 10},
  offerValue: { color: colors.text, fontSize: 13, fontWeight: "900", marginTop: 3 },
  fitDetail: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 7 }, expand:{color:colors.gold,fontSize:10,fontWeight:"800",paddingVertical:8},
  traits: { color: colors.text, fontSize: 10, fontWeight: "500", lineHeight: 15, marginTop: 6 },
  economyLine: { alignItems: "flex-start", borderTopColor: colors.border, borderTopWidth: 1, gap: 6, marginTop: 9, paddingTop: 9 },
  economyText: { color: colors.muted, fontSize: 9, lineHeight: 14 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  secondaryActions: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  compare: {borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 0, borderRadius: 10, minHeight: 44, justifyContent: "center"},
  compareText: {letterSpacing: .5, fontWeight: "600", fontSize: 11, color: colors.muted},
  reject: {color: colors.danger, padding: 12, fontWeight: "600", fontSize: 11},
  disabled: { opacity: .35 },
  comparison: { borderColor: colors.gold, marginTop: 4 },
  tradeoff: { backgroundColor: colors.panel2, borderLeftColor: colors.gold, borderLeftWidth: 3, marginTop: 10, padding: 10 },
  tradeoffTitle: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  tradeoffText: { color: colors.text, lineHeight: 18, marginTop: 5 },
  tradeoffLesson: { color: colors.green, fontSize: 11, fontWeight: "700", lineHeight: 17, marginTop: 6 },
  compareGrid: { flexDirection: "row", gap: 7, marginTop: 10 },
  compareColumn: { backgroundColor: "transparent", borderColor: colors.border, flex: 1, gap: 4, padding: 7, borderWidth: 0, borderRadius: 10, },
  columnName: { fontSize: 11, fontWeight: "900" },
  potential: { color: colors.green, fontSize: 10, fontWeight: "900" },
  fitMini: { fontSize: 8, fontWeight: "900", marginTop: 3 },
});
