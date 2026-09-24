import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { ActionButton, BackButton, EmptyState, MiniMeter, Panel, Portrait, SecondaryButton, SectionTitle, SegmentedTabs, StatusChip, colors } from "../../components/ui";
import { TRAINING_PROGRAMS } from "../../data/training/trainingPrograms";
import { TRAINING_GROUND_CONFIG } from "../../config/trainingConfig";
import { getTrainingGoldCost, calculateTrainingQuote, startHeroTraining, startTrainingGroundUpgrade, trainingCapacity } from "../../game/training/trainingService";
import { getTrainingCatchupAdvice, getTrainingQuotePresentation, getTrainingSessionPresentation } from "../../game/training/trainingPresentationService";
import type { TrainingProgramId } from "../../game/training/trainingTypes";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";

export function TrainingGroundsScreen({ onBack, openCalendar, openSideQuests }: { onBack(): void; openCalendar(): void; openSideQuests?(): void }) {
  const { showDialog } = useGameDialog();
  const { guild, updateGuild } = useGuild();
  const available = guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0);
  const [heroId, setHeroId] = useState<string | undefined>(available[0]?.id);
  const [programId, setProgramId] = useState<TrainingProgramId>("sparring_drills");
  const [tab,setTab]=useState<"Train"|"Active">("Train");
  const hero = guild.heroes.find((item) => item.id === heroId);
  const program = TRAINING_PROGRAMS[programId];
  const programQuotes = useMemo(() => new Map(Object.values(TRAINING_PROGRAMS).map((entry) => [entry.id, hero ? calculateTrainingQuote(hero, entry.id, guild) : undefined])), [guild, hero]);
  const quote = useMemo(() => hero ? getTrainingQuotePresentation(guild, hero, programId) : undefined, [guild, hero, programId]);
  const capacity = trainingCapacity(guild);
  const upgrade = TRAINING_GROUND_CONFIG.upgrades[guild.trainingGround.level + 1];
  const sessions = useMemo(() => guild.trainingGround.sessions.map((session) => getTrainingSessionPresentation(guild, session)), [guild]);
  const catchup = useMemo(() => getTrainingCatchupAdvice(guild), [guild]);
  const tutorialSeen = guild.world.worldFlags.training_hall_v2_tutorial_seen === true;
  const acknowledgeTutorial = () => updateGuild({ ...guild, world: { ...guild.world, worldFlags: { ...guild.world.worldFlags, training_hall_v2_tutorial_seen: true } } });

  const begin = () => {
    if (!hero || !quote) return;
    try {
      updateGuild(startHeroTraining(guild, hero.id, programId));
      showDialog({ title: "Training Started", message: `${hero.name} begins ${program.name}. Projected reward: +${quote.xpReward} XP. Cost: ${quote.goldCost} gold. Returns Day ${quote.completionDay}.`, tone: "success" });
      const nextHero = available.find((entry) => entry.id !== hero.id);
      setHeroId(nextHero?.id);
    } catch (error) {
      showDialog({ title: "Cannot train", message: error instanceof Error ? error.message : "Training could not begin", tone: "danger" });
    }
  };
  const improve = () => {
    try {
      const next = startTrainingGroundUpgrade(guild);
      updateGuild(next);
      showDialog({ title: "Training Hall Upgrade Started", message: `Level ${guild.trainingGround.level} to ${guild.trainingGround.level + 1}. ${upgrade?.goldCost.toLocaleString() ?? 0} gold committed. Completes Day ${guild.currentDay + (upgrade?.durationDays ?? 0)} and adds one training slot.`, tone: "success" });
    } catch (error) {
      showDialog({ title: "Cannot upgrade", message: error instanceof Error ? error.message : "Upgrade could not begin", tone: "danger" });
    }
  };

  const facilityUpgrade = guild.trainingGround.upgrade;
  const facilityProgress = facilityUpgrade ? Math.max(0, guild.currentDay - facilityUpgrade.startDay) : 0;
  const facilityDuration = facilityUpgrade ? Math.max(1, facilityUpgrade.completionDay - facilityUpgrade.startDay) : 1;

  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <View style={styles.header}><View style={styles.flex}><Text style={styles.eyebrow}>GUILDHAVEN FACILITY</Text><Text style={styles.title}>Guild Training Yard</Text><Text style={styles.day}>DAY {guild.currentDay} · {guild.gold.toLocaleString()} GOLD</Text></View><StatusChip label={`${guild.trainingGround.sessions.length}/${capacity} SLOTS`} tone={guild.trainingGround.sessions.length >= capacity ? "gold" : "good"} /></View>
    <Text style={styles.intro}>Train reserves while the field team adventures. Earn XP up to the campaign and roster cap; attributes stay unchanged.</Text>

    {!tutorialSeen && <Panel style={styles.tutorial}>
      <Text style={styles.tutorialLabel}>TRAINING YARD TUTORIAL</Text><Text style={styles.tutorialTitle}>Use downtime, not endless waiting</Text>
      <Text style={styles.tutorialText}>A hero is unavailable for field duty until their program finishes. Training grants XP only and stops at a campaign/roster catch-up cap. If the campaign says your main team is under-levelled, one-clear Side Quests remain the fastest active solution; Training is best for reserves, recovery days, and heroes lagging behind the core roster.</Text>
      <SecondaryButton label="GOT IT · OPEN TRAINING YARD" onPress={acknowledgeTutorial} />
    </Panel>}

    <Panel style={styles.facility}>
      <View style={styles.facilityHead}><View style={styles.levelPlate}><Text style={styles.levelSmall}>TRAINING HALL</Text><Text style={styles.level}>LEVEL {guild.trainingGround.level}</Text></View><View style={styles.flex}><Text style={styles.facilityName}>{guild.trainingGround.level === 1 ? "Guild Practice Yard" : guild.trainingGround.level === 2 ? "Veteran Training Hall" : "Master Adventurer Academy"}</Text><Text style={styles.meta}>{capacity} concurrent training slot{capacity === 1 ? "" : "s"} · {guild.trainingGround.completedTrainingCount} completed program{guild.trainingGround.completedTrainingCount === 1 ? "" : "s"}</Text></View></View>
      {facilityUpgrade ? <View style={styles.upgradeBox}><View style={styles.line}><View style={styles.flex}><Text style={styles.panelLabel}>FACILITY UPGRADE ACTIVE</Text><Text style={styles.panelTitle}>Training Hall Level {facilityUpgrade.targetLevel}</Text></View><StatusChip label={`DAY ${facilityUpgrade.completionDay}`} tone="gold" /></View><Text style={styles.meta}>{Math.max(0, facilityUpgrade.completionDay - guild.currentDay)} day(s) remaining</Text><MiniMeter value={facilityProgress} max={facilityDuration} color={colors.green} height={8}/><SecondaryButton label="OPEN GUILD CALENDAR" onPress={openCalendar}/></View>
        : upgrade ? <View style={styles.upgradeBox}><View style={styles.line}><View style={styles.flex}><Text style={styles.panelLabel}>NEXT FACILITY LEVEL</Text><Text style={styles.panelTitle}>Training Hall Level {guild.trainingGround.level + 1}</Text></View><StatusChip label={`+1 SLOT`} tone="blue" /></View><Text style={styles.meta}>{upgrade.goldCost.toLocaleString()} gold · {upgrade.durationDays} days · capacity becomes {TRAINING_GROUND_CONFIG.capacityByLevel[guild.trainingGround.level + 1]}</Text>{guild.gold < upgrade.goldCost && <Text style={styles.warning}>Need {(upgrade.goldCost - guild.gold).toLocaleString()} more gold.</Text>}<ActionButton label={`BEGIN UPGRADE · ${upgrade.goldCost.toLocaleString()}G`} disabled={guild.gold < upgrade.goldCost} onPress={improve}/></View>
        : <Text style={styles.mastered}>★ MASTER FACILITY · MAXIMUM TRAINING CAPACITY</Text>}
    </Panel>

    {catchup && <Panel style={styles.catchup}>
      <View style={styles.line}><View style={styles.flex}><Text style={styles.catchupLabel}>GUILDMASTER ADVICE</Text><Text style={styles.catchupTitle}>Field team below campaign level</Text></View><StatusChip label={`${catchup.averageLevel.toFixed(1)} / LV ${catchup.targetLevel}`} tone="gold" /></View>
      <Text style={styles.description}>{catchup.message}</Text><Text style={styles.catchupQuest}>NEXT STORY · {catchup.nextQuestName.toUpperCase()}</Text>
      {openSideQuests && <ActionButton label={`BROWSE SIDE QUESTS${catchup.sideQuestCount ? ` · ${catchup.sideQuestCount}` : ""}`} onPress={openSideQuests}/>}
    </Panel>}

    <SegmentedTabs values={["Train","Active"] as const} value={tab} onChange={setTab}/>{tab==="Active"&&<><SectionTitle>ACTIVE TRAINING</SectionTitle>
    <View style={styles.slotGrid}>{Array.from({ length: capacity }, (_, index) => {
      const session = sessions[index];
      if (!session) return <Panel key={`empty-${index}`} style={styles.emptySlot}><Text style={styles.emptySlotNumber}>SLOT {index + 1}</Text><Text style={styles.emptySlotTitle}>AVAILABLE</Text><Text style={styles.meta}>Assign an available hero below.</Text></Panel>;
      const trainee = guild.heroes.find((entry) => entry.id === session.heroId);
      return <Panel key={session.sessionId} style={styles.session}><View style={styles.sessionHead}>{trainee ? <Portrait hero={trainee} size={48}/> : null}<View style={styles.flex}><Text style={styles.sessionSlot}>SLOT {index + 1} · TRAINING</Text><Text style={styles.sessionName}>{session.heroName}</Text><Text style={styles.meta}>{session.programName}</Text></View><StatusChip label={`${session.daysRemaining}D LEFT`} tone={session.daysRemaining <= 1 ? "good" : "blue"}/></View><MiniMeter value={session.elapsedDays} max={session.durationDays} color={colors.green} height={7}/><View style={styles.sessionStats}><Text style={styles.reward}>+{session.xpReward} XP</Text><Text style={styles.meta}>Readiness on return · {Math.round(session.readinessAtCompletion)}</Text><Text style={styles.meta}>Ready Day {session.completionDay}</Text></View></Panel>;
    })}</View>
    {sessions.length > 0 && <SecondaryButton label="OPEN GUILD CALENDAR" onPress={openCalendar}/>}</>}

    {tab==="Train"&&<><SectionTitle>SELECT HERO</SectionTitle>
    {available.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heroRow}>{available.map((entry) => <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Select ${entry.name} for training`} accessibilityState={{ selected: heroId === entry.id }} aria-pressed={heroId === entry.id} onPress={() => setHeroId(entry.id)}><Panel style={[styles.hero, heroId === entry.id && styles.selected]}><Portrait hero={entry} size={58}/><Text style={[styles.heroName, { color: getRaceNameColor(entry.raceId) }]}>{entry.name}</Text><Text style={styles.heroLevel}>LV {entry.level}</Text><Text style={styles.heroMeta}>Readiness {Math.round(entry.adventureStamina)}</Text><Text style={styles.heroMeta}>Potential {entry.potentialEstimateMin}–{entry.potentialEstimateMax}</Text></Panel></Pressable>)}</ScrollView> : <EmptyState title="No heroes available" message="Heroes who are fallen, away on guild work, or already training cannot begin another program."/>}

    <SectionTitle>CHOOSE PROGRAM</SectionTitle>
    {Object.values(TRAINING_PROGRAMS).map((entry) => {
      const locked = guild.trainingGround.level < entry.trainingGroundLevel;
      const entryQuote = programQuotes.get(entry.id);
      return <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`${entry.name}${locked ? ` · Requires training hall level ${entry.trainingGroundLevel}` : ""}`} accessibilityState={{ selected: programId === entry.id, disabled: locked }} aria-pressed={programId === entry.id} aria-disabled={locked} disabled={locked} onPress={() => setProgramId(entry.id)}><Panel style={[styles.program, programId === entry.id && styles.selected, locked && styles.locked]}><View style={styles.programHead}><View style={styles.flex}><Text style={styles.programName}>{entry.name}</Text><Text style={styles.description}>{entry.description}</Text></View><StatusChip label={locked ? `HALL LV ${entry.trainingGroundLevel}` : `${entry.durationDays}D`} tone={locked ? "danger" : programId === entry.id ? "good" : "blue"}/></View><View style={styles.programFooter}><Text style={styles.programStat}>{entryQuote ? `${entryQuote.goldCost}G` : `${getTrainingGoldCost(entry.id)}G`}</Text><Text style={styles.programStat}>{entryQuote ? `+${entryQuote.xpReward} XP` : `BASE ${entry.baseXp} XP`}</Text><Text style={styles.programTag}>XP ONLY</Text></View></Panel></Pressable>;
    })}

    {hero && quote ? <>
      <SectionTitle>TRAINING ORDER</SectionTitle>
      <Panel style={[styles.quote, !quote.canBegin && styles.quoteBlocked]}>
        <View style={styles.quoteHead}><Portrait hero={hero} size={64}/><View style={styles.flex}><Text style={styles.panelLabel}>SELECTED TRAINEE</Text><Text style={[styles.quoteTitle, { color: getRaceNameColor(hero.raceId) }]}>{hero.name}</Text><Text style={styles.meta}>{program.name} · returns Day {quote.completionDay}</Text></View><StatusChip label={quote.canBegin ? "READY" : "BLOCKED"} tone={quote.canBegin ? "good" : "danger"}/></View>
        <View style={styles.projectionGrid}><View style={styles.projection}><Text style={styles.projectionLabel}>LEVEL</Text><Text style={styles.projectionValue}>{quote.levelBefore}{quote.levelAfter > quote.levelBefore ? ` → ${quote.levelAfter}` : ""}</Text></View><View style={styles.projection}><Text style={styles.projectionLabel}>XP REWARD</Text><Text style={styles.projectionValue}>+{quote.xpReward}</Text></View><View style={styles.projection}><Text style={styles.projectionLabel}>READINESS</Text><Text style={styles.projectionValue}>{Math.round(quote.readinessBefore)} → {Math.round(quote.readinessAfter)}</Text></View><View style={styles.projection}><Text style={styles.projectionLabel}>COST</Text><Text style={styles.projectionValue}>{quote.goldCost}G</Text></View></View>
        <Text style={styles.xpLabel}>CURRENT XP · {quote.xpBefore} / {quote.xpNeededBefore}</Text><MiniMeter value={quote.xpBefore} max={quote.xpNeededBefore} color={colors.blue} height={8}/>
        {quote.levelAfter === quote.levelBefore && <><Text style={styles.xpLabel}>AFTER TRAINING · {quote.xpAfter} / {quote.xpNeededAfter}</Text><MiniMeter value={quote.xpAfter} max={quote.xpNeededAfter} color={colors.green} height={8}/></>}
        {quote.levelAfter > quote.levelBefore && <Text style={styles.levelUp}>★ PROJECTED LEVEL UP · LEVEL {quote.levelAfter}</Text>}
        <View style={styles.capBox}><Text style={styles.cap}>TRAINING CAP · LEVEL {quote.levelCap}</Text><Text style={styles.capDetail}>Training can catch this hero toward the campaign and strongest-roster limit, but cannot overtake current progression.</Text></View>
        {quote.blockers.map((blocker) => <Text key={blocker.id} style={[styles.blocker, blocker.tone === "danger" && styles.danger]}>• {blocker.label}</Text>)}
        <Text style={styles.quoteNote}>Daily calendar recovery still applies while training, so readiness can improve before the hero returns. Training never grants permanent attributes.</Text>
        <ActionButton label={quote.canBegin ? `BEGIN ${program.name.toUpperCase()} · READY DAY ${quote.completionDay}` : "TRAINING REQUIREMENTS NOT MET"} disabled={!quote.canBegin} onPress={begin}/>
      </Panel>
    </> : null}</>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 55 },
  header: { alignItems: "center", flexDirection: "row", gap: 9, marginTop: 7 },
  flex: { flex: 1 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "600", letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700", marginTop: 2 },
  day: { color: colors.gold, fontSize: 10, fontWeight: "800", marginTop: 3 },
  intro: { color: colors.muted, lineHeight: 20, marginVertical: 11 },
  tutorial: { borderColor: colors.blue, gap: 7, marginBottom: 11 },
  tutorialLabel: { color: colors.blue, fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  tutorialTitle: { color: colors.text, fontSize: 17, fontWeight: "600" },
  tutorialText: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  facility: { borderColor: colors.gold, gap: 9 },
  facilityHead: { alignItems: "center", flexDirection: "row", gap: 10 },
  levelPlate: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderWidth: 0, borderRadius: 10, minWidth: 78, padding: 8 },
  levelSmall: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  level: { color: colors.gold, fontSize: 16, fontWeight: "600", marginTop: 2 },
  facilityName: { color: colors.text, fontSize: 16, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 11, marginTop: 2 },
  line: { alignItems: "center", flexDirection: "row", gap: 8 },
  upgradeBox: { borderRadius: 10, backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, gap: 7, padding: 10 },
  panelLabel: { color: colors.gold, fontSize: 11, fontWeight: "600", letterSpacing: .9 },
  panelTitle: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 2 },
  mastered: { color: colors.green, fontWeight: "600" },
  warning: { color: colors.danger, fontSize: 10, lineHeight: 15 },
  catchup: { borderColor: colors.gold, gap: 8 },
  catchupLabel: { color: colors.gold, fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  catchupTitle: { color: colors.text, fontSize: 17, fontWeight: "600", marginTop: 2 },
  catchupQuest: { color: colors.gold, fontSize: 11, fontWeight: "600", letterSpacing: .4 },
  description: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  slotGrid: { gap: 8 },
  emptySlot: { borderColor: colors.border, borderStyle: "dashed", minHeight: 89, justifyContent: "center" },
  emptySlotNumber: { color: colors.muted, fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  emptySlotTitle: { color: colors.green, fontSize: 15, fontWeight: "600", marginTop: 3 },
  session: { borderColor: colors.blue, gap: 8 },
  sessionHead: { alignItems: "center", flexDirection: "row", gap: 9 },
  sessionSlot: { color: colors.blue, fontSize: 11, fontWeight: "600", letterSpacing: .8 },
  sessionName: { color: colors.text, fontSize: 16, fontWeight: "600", marginTop: 2 },
  sessionStats: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  reward: { color: colors.green, fontSize: 10, fontWeight: "600" },
  heroRow: { gap: 8 },
  hero: { alignItems: "center", minHeight: 150, width: 132 },
  selected: { backgroundColor: colors.panel2, borderColor: colors.gold, borderWidth: 1 },
  heroName: { fontSize: 14, lineHeight: 19, textAlign: "center", fontWeight: "600", marginTop: 5, maxWidth: 110 },
  heroLevel: { color: colors.gold, fontSize: 11, fontWeight: "600", marginTop: 3 },
  heroMeta: { color: colors.muted, fontSize: 11, marginTop: 2 },
  program: { marginBottom: 8, gap: 7 },
  locked: { borderColor: colors.border },
  programHead: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  programName: { color: colors.text, fontSize: 16, fontWeight: "600" },
  programFooter: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  programStat: { color: colors.text, fontSize: 11, fontWeight: "600", paddingHorizontal: 7, paddingVertical: 4 },
  programTag: { color: colors.blue, fontSize: 11, fontWeight: "600", paddingHorizontal: 7, paddingVertical: 4 },
  quote: { borderColor: colors.green, gap: 9 },
  quoteBlocked: { borderColor: colors.danger },
  quoteHead: { alignItems: "center", flexDirection: "row", gap: 10 },
  quoteTitle: { color: colors.text, fontSize: 18, fontWeight: "600", marginTop: 2 },
  projectionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  projection: { borderBottomColor: colors.border, borderBottomWidth: 1, minWidth: "47%", flexGrow: 1, padding: 8 },
  projectionLabel: { color: colors.muted, fontSize: 11, fontWeight: "600", letterSpacing: .7 },
  projectionValue: { color: colors.text, fontSize: 13, fontWeight: "600", marginTop: 3 },
  xpLabel: { color: colors.muted, fontSize: 11, fontWeight: "600", letterSpacing: .5 },
  levelUp: { backgroundColor: colors.panel2, borderColor: colors.green, borderWidth: 1, color: colors.green, fontSize: 11, fontWeight: "600", padding: 8, textAlign: "center" },
  capBox: { backgroundColor: colors.panel2, borderLeftColor: colors.gold, borderLeftWidth: 3, padding: 8 },
  cap: { color: colors.gold, fontSize: 10, fontWeight: "600" },
  capDetail: { color: colors.muted, fontSize: 11, lineHeight: 14, marginTop: 2 },
  blocker: { color: colors.gold, fontSize: 10, lineHeight: 15 },
  danger: { color: colors.danger },
  quoteNote: { color: colors.muted, fontSize: 11, lineHeight: 14 },
});
