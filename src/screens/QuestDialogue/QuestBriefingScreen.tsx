import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { BackButton, colors } from "../../components/ui";
import { QuestDialogueSequence } from "../../components/quests/QuestDialogueSequence";
import { getQuestDialogue } from "../../data/quests/questDialogue";
import { QUESTS } from "../../data/quests/quests";

export function QuestBriefingScreen({ questId, onBack, onContinue }: { questId: string; onBack(): void; onContinue(): void }) {
  const quest = QUESTS[questId]; const dialogue = getQuestDialogue(questId);
  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.eyebrow}>QUEST BRIEFING</Text><Text style={styles.title}>{dialogue.briefingTitle}</Text><Text style={styles.quest}>{quest?.name}</Text><QuestDialogueSequence lines={dialogue.briefing} label="BEFORE DEPARTURE" finalLabel="Choose the Party" onComplete={onContinue} /><Pressable accessibilityRole="button" onPress={onContinue}><Text style={styles.skip}>Skip briefing and assemble party</Text></Pressable></ScrollView>;
}
const styles = StyleSheet.create({ content: { alignSelf: "center", maxWidth: 620, padding: 20, paddingBottom: 45, width: "100%" }, eyebrow: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 2, marginTop: 13 }, title: { color: colors.text, fontSize: 29, fontWeight: "900", marginTop: 4 }, quest: { color: colors.muted, fontSize: 12, fontWeight: "800", marginBottom: 16, marginTop: 4, textTransform: "uppercase" }, skip: { color: colors.muted, fontSize: 11, marginTop: 14, textAlign: "center", textDecorationLine: "underline" } });
