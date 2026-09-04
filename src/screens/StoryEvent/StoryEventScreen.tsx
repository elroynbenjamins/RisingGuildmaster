import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, Panel, Portrait, colors } from "../../components/ui";
import type { GuildState } from "../../game/guild/types";
import { RELATIONSHIP_BAND_LABELS } from "../../game/relationships/relationshipService";
import { choiceRequirementsMet, describeEventOutcomes, resolveGuildEventChoice, type GuildEventResolution } from "../../game/world/worldEventResolver";
import type { EventChoice, WorldEventDefinition } from "../../game/world/worldTypes";
import type { RandomSource } from "../../utils/random";

interface EventResult { resolution: GuildEventResolution; choice: EventChoice }

export function StoryEventScreen({ event, guild, random, updateGuild, onDone, openQuest }: { event: WorldEventDefinition; guild: GuildState; random: RandomSource; updateGuild(guild: GuildState): void; onDone(): void; openQuest?(questId: string): void }) {
  const [result, setResult] = useState<EventResult>();
  const party = useMemo(() => {
    const recent = guild.recentPartyHeroIds.map((id) => guild.heroes.find((hero) => hero.id === id)).filter((hero): hero is NonNullable<typeof hero> => Boolean(hero));
    return recent.length ? recent : guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0).slice(0, 4);
  }, [guild.heroes, guild.recentPartyHeroIds]);
  const choose = (choiceId: string) => {
    const choice = event.choices.find((item) => item.id === choiceId)!;
    try { const resolution = resolveGuildEventChoice(choice, guild, party, random); updateGuild(resolution.guild); setResult({ resolution, choice }); } catch { setResult(undefined); }
  };
  const lead = result ? party.find((hero) => hero.id === result.resolution.check?.heroId) ?? party[0] : undefined;
  const companion = result && lead ? party.find((hero) => hero.id !== lead.id) : undefined;
  const succeeded = result ? result.resolution.check?.success !== false : false;
  const narration = result ? (succeeded ? result.choice.dialogue?.successNarration : result.choice.dialogue?.failureNarration) : undefined;
  const leadLine = result ? (succeeded ? result.choice.dialogue?.successLead : result.choice.dialogue?.failureLead) : undefined;
  const rewards = result ? describeEventOutcomes(result.resolution.outcomes) : [];
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>{event.choices.some((choice) => choice.questId) ? "ROAD OPPORTUNITY" : `${event.tier?.toUpperCase() ?? "COMMON"} TRAVEL EVENT`}</Text><Text style={styles.title}>{event.title}</Text><Text style={styles.description}>{event.description}</Text>
    {!!party.length && <View style={styles.partyStrip}>{party.map((hero) => <View key={hero.id} style={styles.partyHero}><Portrait hero={hero} size={38}/><Text numberOfLines={1} style={styles.partyName}>{hero.name}</Text></View>)}</View>}
    <Panel>{!result ? event.choices.map((choice) => { const enabled = choiceRequirementsMet(choice, party, guild.world); return <Pressable key={choice.id} disabled={!enabled} onPress={() => choose(choice.id)} style={[styles.choice, !enabled && styles.disabled]}><Text style={styles.choiceText}>{choice.text}</Text>{choice.abilityCheck && <Text style={styles.check}>{choice.abilityCheck.skillId?.replace(/_/g, " ").toUpperCase() ?? choice.abilityCheck.attribute.toUpperCase()} · {choice.abilityCheck.attribute.toUpperCase()} · DC {choice.abilityCheck.difficultyClass}</Text>}{!enabled && <Text style={styles.check}>Requirements not met</Text>}</Pressable>; }) : <>
      <Text style={[styles.verdict, succeeded ? styles.success : styles.failure]}>{result.resolution.check ? (succeeded ? "CHECK SUCCEEDED" : "CHECK FAILED") : "CHOICE RESOLVED"}</Text>
      {result.resolution.check && <Text style={styles.roll}>{lead?.name}: d20 {result.resolution.check.diceRoll} + {result.resolution.check.modifier} = {result.resolution.check.total} vs DC {result.resolution.check.difficultyClass}</Text>}
      {narration && <Text style={styles.narration}>{narration}</Text>}
      {lead && leadLine && <Dialogue hero={lead} text={leadLine}/>}
      {companion && result.choice.dialogue?.companion && <Dialogue hero={companion} text={result.choice.dialogue.companion}/>}
      {!!rewards.length && <View style={styles.consequences}><Text style={styles.consequenceTitle}>CONSEQUENCES</Text>{rewards.map((reward) => <Text key={reward} style={styles.reward}>◆ {reward}</Text>)}</View>}
      {result.resolution.relationshipChange && lead && companion && <Text style={styles.bond}>{lead.name} & {companion.name} · {result.resolution.relationshipChange.delta >= 0 ? "+" : ""}{result.resolution.relationshipChange.delta} bond · {RELATIONSHIP_BAND_LABELS[result.resolution.relationshipChange.newBand]}</Text>}
      <ActionButton label={result.choice.questId ? "Prepare Road Encounter" : "Continue Journey"} onPress={() => result.choice.questId && openQuest ? openQuest(result.choice.questId) : onDone()}/>
    </>}</Panel>
  </ScrollView>;
}

function Dialogue({ hero, text }: { hero: GuildState["heroes"][number]; text: string }) { return <View style={styles.dialogue}><Portrait hero={hero} size={48}/><View style={styles.dialogueCopy}><Text style={styles.speaker}>{hero.name}</Text><Text style={styles.quote}>“{text}”</Text></View></View>; }

const styles = StyleSheet.create({ content: { padding: 22, paddingTop: 60 }, eyebrow: { color: colors.gold, fontWeight: "900", letterSpacing: 2 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 7 }, description: { color: colors.muted, lineHeight: 22, marginVertical: 15 }, partyStrip: { flexDirection: "row", gap: 8, marginBottom: 14 }, partyHero: { width: 54, alignItems: "center" }, partyName: { color: colors.muted, fontSize: 9, marginTop: 3, width: 54, textAlign: "center" }, choice: { padding: 13, borderColor: colors.border, borderWidth: 1, borderRadius: 10, marginBottom: 9, backgroundColor: "#151d27" }, disabled: { opacity: .4 }, choiceText: { color: colors.text, fontWeight: "800" }, check: { color: colors.gold, fontSize: 11, marginTop: 4 }, verdict: { fontSize: 12, fontWeight: "900", letterSpacing: 1.4 }, success: { color: colors.green }, failure: { color: colors.danger }, roll: { color: colors.gold, fontWeight: "800", marginTop: 6 }, narration: { color: colors.text, lineHeight: 21, marginVertical: 14, fontStyle: "italic" }, dialogue: { flexDirection: "row", gap: 10, paddingVertical: 9, borderTopColor: colors.border, borderTopWidth: 1 }, dialogueCopy: { flex: 1 }, speaker: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase" }, quote: { color: colors.text, lineHeight: 19, marginTop: 3 }, consequences: { backgroundColor: "#101923", borderColor: colors.border, borderWidth: 1, borderRadius: 9, padding: 11, marginVertical: 12 }, consequenceTitle: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 5 }, reward: { color: colors.text, lineHeight: 20 }, bond: { color: "#d9a7e8", fontWeight: "800", marginBottom: 14 } });
