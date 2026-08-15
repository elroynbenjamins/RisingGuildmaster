import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { ActionButton, Panel, SecondaryButton, colors } from "../../components/ui";
import { CLASSES } from "../../data/classes/classes";
import { RACES } from "../../data/races/races";
import { RACE_HOMELANDS } from "../../data/recruitment/raceHomelands";
import { RECRUITMENT_CONFIG } from "../../data/recruitment/recruitmentBalance";
import { REGIONS } from "../../data/world/regions";
import { hasGuildmasterSkill } from "../../game/guildmaster/guildmasterProgression";
import type { ClassId, RaceId } from "../../game/heroes/types";
import { regionalScoutDaysRemaining } from "../../game/recruitment/regionalScoutingService";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";

const RACE_IDS = ["human", "elf", "dwarf", "orc"] as const;
const CLASS_IDS = ["warrior", "ranger", "mage", "cleric", "paladin", "berserker"] as const;

export function RegionalScoutPanel({ openCalendar }: { openCalendar(): void }) {
  const { showDialog } = useGameDialog();
  const { guild, dispatchRegionalScout, focusRegionalScoutClass, speedUpRegionalScout, collectRegionalScoutReport } = useGuild();
  const [expanded, setExpanded] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState<RaceId>("human");
  const [selectedClassId, setSelectedClassId] = useState<ClassId | null>(null);
  const [message, setMessage] = useState<string>();
  const mission = guild.recruitment.regionalScoutMission;
  const regionalUnlocked = hasGuildmasterSkill(guild.guildmaster, "regional_network");
  const classFocusUnlocked = hasGuildmasterSkill(guild.guildmaster, "specialist_headhunting");
  const speedUpUnlocked = hasGuildmasterSkill(guild.guildmaster, "express_dispatches");

  if (mission) {
    const remaining = regionalScoutDaysRemaining(guild);
    const ready = remaining === 0;
    const className = mission.classId ? CLASSES[mission.classId].name : "Any class";
    const speedCost = RECRUITMENT_CONFIG.regionalScoutSpeedUpGemCost;
    const speedUp = () => {
      const error = speedUpRegionalScout();
      setMessage(error ?? "A courier has recalled the scout. The report is ready to collect.");
    };
    const collect = () => {
      const error = collectRegionalScoutReport();
      setMessage(error ?? "Five regional candidates have been added to the recruitment board.");
    };
    const applyClassFocus = () => {
      if (!selectedClassId) return;
      const error = focusRegionalScoutClass(selectedClassId);
      setMessage(error ?? `The scout will now seek ${CLASSES[selectedClassId].name} candidates.`);
    };
    return <Panel style={styles.activePanel}>
      <Text style={styles.eyebrow}>{ready ? "SCOUTING REPORT READY" : "SCOUT IN THE FIELD"}</Text>
      <Text style={styles.title}>{mission.locationName}</Text>
      <Text style={styles.region}>{REGIONS[mission.regionId]?.name} · {RACES[mission.raceId].name} contacts</Text>
      <View style={styles.progressRow}><View style={styles.flex}><Text style={styles.label}>CLASS FOCUS</Text><Text style={styles.value}>{className}</Text></View><View><Text style={styles.label}>GUILD DAY</Text><Text style={styles.day}>{guild.currentDay} / {mission.completionDay}</Text></View></View>
      <View style={styles.track}><View style={[styles.fill, { width: ready ? "100%" : `${Math.max(8, Math.min(100, (guild.currentDay - mission.startDay) / Math.max(1, mission.completionDay - mission.startDay) * 100))}%` }]} /></View>
      <Text style={ready ? styles.ready : styles.description}>{ready ? "The scout has returned with five narrowed candidate reports." : `${remaining} in-game day${remaining === 1 ? "" : "s"} remaining. Results are generated only when the finished report is collected.`}</Text>
      {!ready && !mission.classId && (classFocusUnlocked ? <View style={styles.fieldFocus}><Text style={styles.step}>ADD CLASS FOCUS · {RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost} GEMS</Text><Text style={styles.classHint}>Send instructions while the scout is traveling. All five returned candidates will use the chosen class.</Text><View style={styles.classes}>{CLASS_IDS.map((classId) => <ClassChoice key={classId} label={CLASSES[classId].name} active={selectedClassId === classId} onPress={() => setSelectedClassId(classId)} />)}</View><SecondaryButton label={!selectedClassId ? "Choose a Class" : guild.gems < RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost ? `Need ${RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost} Gems` : `Apply ${CLASSES[selectedClassId].name} Focus · ${RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost} Gems`} disabled={!selectedClassId || guild.gems < RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost} onPress={applyClassFocus} /></View> : <Text style={styles.lockedFeature}>Class focus unlocks through Specialist Headhunting at Guildmaster Level 3.</Text>)}
      {ready ? <ActionButton label="Collect 5 Candidate Reports" onPress={collect} /> : <View style={styles.actions}>
        <View style={styles.flex}><SecondaryButton label="Open Calendar" onPress={openCalendar} /></View>
        <View style={styles.flex}><SecondaryButton label={!speedUpUnlocked ? "Speed Up · Locked" : guild.gems < speedCost ? `Need ${speedCost} Gems` : `Speed Up · ${speedCost} Gems`} disabled={!speedUpUnlocked || guild.gems < speedCost} onPress={speedUp} /></View>
      </View>}
      {message && <Text style={message.includes("Five") || message.includes("ready") ? styles.success : styles.error}>{message}</Text>}
    </Panel>;
  }

  if (!regionalUnlocked) return <Panel style={styles.lockedPanel}><Text style={styles.eyebrow}>GUILDMASTER DEVELOPMENT</Text><Text style={styles.title}>Regional Scouting Locked</Text><Text style={styles.description}>Reach Guildmaster Level 2 and learn Regional Network in Guild Hall → Manage → Guildmaster Skills. Regular recruitment remains available while you build experience through quests.</Text><Text style={styles.unlockRequirement}>REQUIRES · LEVEL 2 · 1 SKILL POINT</Text></Panel>;

  const selected = RACE_HOMELANDS[selectedRaceId];
  const region = REGIONS[selected.regionId]!;
  const regionAccessible = guild.world.unlockedRegionIds.includes(selected.regionId);
  const baseCost = RECRUITMENT_CONFIG.regionalScoutGemCost;
  const classCost = selectedClassId ? RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost : 0;
  const totalCost = baseCost + classCost;

  const confirmDispatch = () => showDialog({
    title: `Dispatch to ${selected.locationName}?`,
    message: `The scout will return on Guild Day ${guild.currentDay + RECRUITMENT_CONFIG.regionalScoutDurationDays} with five ${selectedClassId ? CLASSES[selectedClassId].name : "mixed-class"} ${RACES[selectedRaceId].name} candidates.\n\nDispatch: ${baseCost} gems${selectedClassId ? `\nClass focus: ${classCost} gems` : ""}\nTotal: ${totalCost} gems\n\nNo candidates appear until the report is complete and collected.`,
    eyebrow: "SCOUTING ORDER",
    actions: [
      { label: "Cancel", tone: "secondary" },
      { label: `Spend ${totalCost} gems`, tone: "primary", onPress: () => {
        const error = dispatchRegionalScout(selectedRaceId, selectedClassId);
        setMessage(error ?? `Scout dispatched. Expected return: Guild Day ${guild.currentDay + RECRUITMENT_CONFIG.regionalScoutDurationDays}.`);
      } },
    ],
  });

  return <Panel style={styles.panel}>
    <View style={styles.header}><View style={styles.flex}><Text style={styles.eyebrow}>REGIONAL HEADHUNTING</Text><Text style={styles.title}>Dispatch a Guild Scout</Text><Text style={styles.summary}>Send a scout to a people's homeland. The journey takes {RECRUITMENT_CONFIG.regionalScoutDurationDays} in-game days and returns five narrowed reports.</Text></View><View style={styles.toggle}><SecondaryButton label={expanded ? "Close" : "Choose"} onPress={() => setExpanded((value) => !value)} /></View></View>
    <View style={styles.costRow}><Text style={styles.gems}>◇ {baseCost} GEMS TO DISPATCH</Text><Text style={styles.report}>5 CANDIDATES · {RECRUITMENT_CONFIG.regionalScoutDurationDays} DAYS</Text></View>
    {expanded && <>
      <Text style={styles.step}>1 · CHOOSE REGION & PEOPLE</Text>
      <View style={styles.races}>{RACE_IDS.map((raceId) => { const homeland = RACE_HOMELANDS[raceId]; const active = selectedRaceId === raceId; return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} key={raceId} onPress={() => setSelectedRaceId(raceId)} style={[styles.race, active && styles.activeRace]}><Text style={[styles.raceName, { color: getRaceNameColor(raceId) }]}>{RACES[raceId].name}</Text><Text numberOfLines={2} style={styles.location}>{REGIONS[homeland.regionId]?.name} · {homeland.locationName}</Text></Pressable>; })}</View>
      <View style={styles.destination}><View style={styles.destinationHeader}><View style={styles.flex}><Text style={[styles.destinationName, { color: getRaceNameColor(selectedRaceId) }]}>{selected.locationName}</Text><Text style={styles.region}>{region.name} · Home of the {selected.peopleName}</Text></View><Text style={regionAccessible ? styles.open : styles.distant}>{regionAccessible ? "REGION OPEN" : "DISTANT CONTACTS"}</Text></View><Text style={styles.description}>{selected.description}</Text><Text style={styles.approach}>SCOUT'S APPROACH</Text><Text style={styles.description}>{selected.scoutApproach}</Text>{!regionAccessible && <Text style={styles.distantNote}>Independent scouts can use old guild routes without unlocking party travel to this region.</Text>}</View>
      {classFocusUnlocked ? <><Text style={styles.step}>2 · OPTIONAL CLASS FOCUS · +{RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost} GEMS</Text><Text style={styles.classHint}>Choose Any Class for a mixed report, or pay for the scout to search specific training halls and professional circles.</Text><View style={styles.classes}><ClassChoice label="Any Class" active={selectedClassId === null} onPress={() => setSelectedClassId(null)} />{CLASS_IDS.map((classId) => <ClassChoice key={classId} label={CLASSES[classId].name} active={selectedClassId === classId} onPress={() => setSelectedClassId(classId)} />)}</View></> : <Text style={styles.lockedFeature}>Specific-class searches unlock with Specialist Headhunting at Guildmaster Level 3.</Text>}
      <ActionButton label={guild.gems < totalCost ? `Need ${totalCost - guild.gems} More Gems` : `Dispatch Scout · ${totalCost} Gems`} disabled={guild.gems < totalCost} onPress={confirmDispatch} />
    </>}
    {message && <Text style={message.startsWith("Scout dispatched") ? styles.success : styles.error}>{message}</Text>}
  </Panel>;
}

function ClassChoice({ label, active, onPress }: { label: string; active: boolean; onPress(): void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.classChoice, active && styles.activeClass]}><Text style={active ? styles.activeClassText : styles.classText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  panel: { borderColor: "#617c6b", marginBottom: 12 }, activePanel: { borderColor: colors.gold, marginBottom: 12 }, lockedPanel: { borderColor: colors.border, borderStyle: "dashed", marginBottom: 12 }, header: { alignItems: "center", flexDirection: "row", gap: 9 }, flex: { flex: 1 }, toggle: { minWidth: 82 }, eyebrow: { color: colors.green, fontSize: 9, fontWeight: "900", letterSpacing: 1.3 }, title: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 2 }, summary: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 }, costRow: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 11, paddingTop: 8 }, gems: { color: "#80b8e6", fontSize: 10, fontWeight: "900" }, report: { color: colors.gold, fontSize: 9, fontWeight: "900" }, step: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.1, marginTop: 14 }, races: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 }, race: { backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 8, borderWidth: 1, padding: 8, width: "48%" }, activeRace: { backgroundColor: "#3d3827", borderColor: colors.gold, borderWidth: 2 }, raceName: { fontSize: 15, fontWeight: "900" }, location: { color: colors.muted, fontSize: 9, lineHeight: 12, marginTop: 3 }, destination: { backgroundColor: "#151c1f", borderColor: colors.border, borderRadius: 10, borderWidth: 1, marginVertical: 11, padding: 11 }, destinationHeader: { alignItems: "flex-start", flexDirection: "row", gap: 8 }, destinationName: { fontSize: 17, fontWeight: "900" }, region: { color: colors.gold, fontSize: 10, fontWeight: "800", marginTop: 2 }, open: { color: colors.green, fontSize: 8, fontWeight: "900" }, distant: { color: colors.blue, fontSize: 8, fontWeight: "900" }, description: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 }, approach: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 10 }, distantNote: { color: colors.blue, fontSize: 10, lineHeight: 15, marginTop: 9 }, classHint: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 5 }, classes: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12, marginTop: 8 }, classChoice: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 7, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 8, width: "31%" }, activeClass: { backgroundColor: "#3d3827", borderColor: colors.gold, borderWidth: 2 }, classText: { color: colors.muted, fontSize: 10, fontWeight: "800" }, activeClassText: { color: colors.gold, fontSize: 10, fontWeight: "900" }, progressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 13 }, label: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 1 }, value: { color: colors.text, fontWeight: "900", marginTop: 3 }, day: { color: colors.gold, fontWeight: "900", marginTop: 3, textAlign: "right" }, track: { backgroundColor: colors.panel2, borderRadius: 5, height: 8, marginVertical: 10, overflow: "hidden" }, fill: { backgroundColor: colors.green, height: "100%" }, ready: { color: colors.green, fontWeight: "900", lineHeight: 19, marginBottom: 11 }, fieldFocus: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, marginVertical: 11, paddingBottom: 11 }, lockedFeature: { color: colors.muted, fontSize: 10, fontStyle: "italic", lineHeight: 15, marginVertical: 10 }, unlockRequirement: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 9 }, actions: { flexDirection: "row", gap: 8, marginTop: 11 }, success: { color: colors.green, fontWeight: "800", marginTop: 9 }, error: { color: colors.danger, fontWeight: "800", marginTop: 9 },
});
