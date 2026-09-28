import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, Panel, SecondaryButton, StatusChip, colors } from "../../components/ui";

export function TutorialScreen({ onBegin, onSkip }: { onBegin(): void; onSkip(): void }) {
  return <View style={styles.screen}><Panel style={styles.panel}>
    <Text style={styles.step}>FIRST DAY IN GUILDHAVEN</Text>
    <Text style={styles.title}>Found Your Guild</Text>
    <Text style={styles.body}>We teach one action at a time. Start by signing two adventurers; the next useful button will glow when it matters.</Text>
    <View style={styles.flow}><StatusChip label="1 · RECRUIT" tone="gold"/><StatusChip label="2 · FIRST QUEST" tone="blue"/><StatusChip label="3 · COMBAT" tone="danger"/><StatusChip label="4 · TRAVEL" tone="good"/></View>
    <Text style={styles.note}>New systems get one short tip when you first reach them. The full rules stay optional in Settings → Guildmaster Handbook.</Text>
    <ActionButton label="BEGIN GUIDED GUILD" onPress={onBegin} />
    <SecondaryButton label="Skip Guided Recruitment" onPress={onSkip} />
  </Panel></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: 22 }, panel: { borderColor: colors.gold, gap: 14 }, step: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 }, title: { color: colors.text, fontSize: 28, fontWeight: "900" }, body: { color: colors.text, lineHeight: 21 }, flow:{flexDirection:"row",flexWrap:"wrap",gap:5}, note: { color: colors.muted, lineHeight: 18, fontStyle: "italic" } });
