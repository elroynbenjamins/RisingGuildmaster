import React, { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, Panel, colors } from "../../components/ui";
import { CARAVAN_DECISION_CHOICES, CARAVAN_DECISION_STAGES, CARAVAN_ESCORT_NPCS } from "../../data/quests/caravanEscort";
import type { QuestCombatSetup } from "../../game/combat/combatTypes";
import type { Party } from "../../game/party/partyTypes";
import type { QuestDecisionConclusion, QuestDecisionProgress, QuestDecisionResult } from "../../game/quests/questDecisionTypes";
import { advanceQuestDecision, concludeCaravanDecisions, EMPTY_QUEST_DECISION_PROGRESS, resolveQuestDecision } from "../../game/quests/questDecisionService";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";
import { createSeededRandom, randomSeed } from "../../utils/random";
import { NpcPortrait } from "../../components/characters/NpcPortrait";

export function QuestDecisionScreen({ party, onBack, onComplete }: { party: Party; onBack(): void; onComplete(setup: QuestCombatSetup): void }) {
  const { guild } = useGuild();
  const random = useRef(createSeededRandom(randomSeed()));
  const stages = Object.values(CARAVAN_DECISION_STAGES);
  const heroes = guild.heroes.filter((hero) => party.heroIds.includes(hero.id));
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState<QuestDecisionProgress>(EMPTY_QUEST_DECISION_PROGRESS);
  const [result, setResult] = useState<QuestDecisionResult>();
  const [conclusion, setConclusion] = useState<QuestDecisionConclusion>();
  const stage = stages[stageIndex]!;
  const checkingHero = result?.check ? heroes.find((hero) => hero.id === result.check?.heroId) : undefined;

  const choose = (choiceId: string) => {
    if (result) return;
    const resolved = resolveQuestDecision(CARAVAN_DECISION_CHOICES[choiceId]!, heroes, random.current);
    setResult(resolved);
    setProgress((current) => advanceQuestDecision(current, resolved));
  };
  const proceed = () => {
    if (!result) return;
    const updated = advanceQuestDecision(progress, result);
    // progress already includes the displayed result; conclude from that state without applying it twice.
    const current = progress.results.some((entry) => entry.choiceId === result.choiceId) ? progress : updated;
    if (stageIndex >= stages.length - 1) setConclusion(concludeCaravanDecisions(current));
    else { setStageIndex((value) => value + 1); setResult(undefined); }
  };

  if (conclusion) return <ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>THE BRAMBLEWAY RUN</Text><Text style={styles.title}>{conclusion.expectedAmbush ? "The Trap Revealed" : "The Trap Springs"}</Text><Panel style={[styles.conclusion, conclusion.expectedAmbush ? styles.expected : styles.surprised]}><Text style={styles.conclusionTitle}>{conclusion.summary}</Text><Text style={styles.effect}>{conclusion.combatSetup.label}</Text>{conclusion.combatSetup.heroArmorClassModifier > 0 && <Text style={styles.effect}>Prepared cover: +{conclusion.combatSetup.heroArmorClassModifier} party Armor Class</Text>}</Panel><Text style={styles.story}>{conclusion.expectedAmbush ? "Mira draws her sword before the first bandit leaves cover. Aldren pulls the reins and the wagons halt behind the guild's formation." : "A bolt buries itself in the driver's bench. Mira shouts a warning as Aldren hauls the lead wagon sideways and bandits emerge on both flanks."}</Text><ActionButton label="Defend the Caravan" onPress={() => onComplete(conclusion.combatSetup)} /></ScrollView>;

  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.eyebrow}>SIDE QUEST · DECISION {stageIndex + 1}/{stages.length}</Text><Text style={styles.title}>{stage.title}</Text><Text style={styles.story}>{stage.description}</Text>
    {stageIndex === 0 && <><Text style={styles.section}>ESCORT NPCS</Text><View style={styles.npcs}>{CARAVAN_ESCORT_NPCS.map((npc) => <Panel key={npc.id} style={styles.npc}><NpcPortrait portraitId={npc.portraitId} size={52} /><View style={styles.flex}><Text style={styles.npcName}>{npc.name}</Text><Text style={styles.role}>{npc.role}</Text><Text style={styles.npcDescription}>{npc.description}</Text></View></Panel>)}</View></>}
    {!result ? <View style={styles.choices}>{stage.choiceIds.map((id) => { const choice = CARAVAN_DECISION_CHOICES[id]!; return <Pressable key={id} onPress={() => choose(id)} style={styles.choice}><Text style={styles.choiceTitle}>{choice.text}</Text><Text style={styles.choiceDescription}>{choice.description}</Text><Text style={styles.check}>{choice.abilityCheck ? `${choice.abilityCheck.attribute.toUpperCase()} CHECK · DC ${choice.abilityCheck.difficultyClass}` : "NO D20 CHECK"}</Text></Pressable>; })}</View> : <Panel style={styles.result}><Text style={[styles.verdict, result.check?.success === false ? styles.failure : styles.success]}>{result.check ? (result.check.success ? "CHECK SUCCESS" : "CHECK FAILED") : "CHOICE MADE"}</Text>{result.check && <Text style={styles.dice}>D20 {result.check.diceRoll} + {result.check.modifier} = {result.check.total} vs DC {result.check.difficultyClass}</Text>}{checkingHero && <Text style={[styles.hero, { color: getRaceNameColor(checkingHero.raceId) }]}>{checkingHero.name} made the check</Text>}<Text style={styles.outcome}>{result.outcomeText}</Text><ActionButton label={stageIndex === stages.length - 1 ? "Face What Waits Ahead" : "Continue Along the Road"} onPress={proceed} /></Panel>}
  </ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 50 }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.4, marginTop: 8 }, title: { color: colors.text, fontSize: 29, fontWeight: "900", marginTop: 5 }, story: { color: colors.muted, fontSize: 15, lineHeight: 22, marginVertical: 16 }, section: { color: colors.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 8 }, npcs: { gap: 9, marginBottom: 18 }, npc: { flexDirection: "row", gap: 12 }, avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#31506c", borderWidth: 2, borderColor: "#79b8dd" }, avatarText: { color: colors.text, fontWeight: "900" }, flex: { flex: 1 }, npcName: { color: colors.text, fontSize: 17, fontWeight: "900" }, role: { color: colors.gold, fontSize: 11, fontWeight: "800" }, npcDescription: { color: colors.muted, lineHeight: 18, marginTop: 4 }, choices: { gap: 10 }, choice: { backgroundColor: colors.panel, borderWidth: 1, borderColor: "#596981", borderRadius: 12, padding: 15 }, choiceTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, choiceDescription: { color: colors.muted, lineHeight: 19, marginVertical: 6 }, check: { color: colors.gold, fontSize: 11, fontWeight: "900" }, result: { alignItems: "center", gap: 9, borderColor: colors.gold }, verdict: { fontSize: 19, fontWeight: "900" }, success: { color: colors.green }, failure: { color: colors.danger }, dice: { color: colors.gold, fontSize: 17, fontWeight: "900" }, hero: { fontWeight: "900" }, outcome: { color: colors.text, lineHeight: 21, textAlign: "center", marginVertical: 8 }, conclusion: { marginVertical: 18, gap: 10 }, expected: { borderColor: colors.green }, surprised: { borderColor: colors.danger }, conclusionTitle: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: "900" }, effect: { color: colors.gold, fontWeight: "800" } });
