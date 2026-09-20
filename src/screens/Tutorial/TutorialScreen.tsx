import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, Panel, SecondaryButton, StatusChip, colors } from "../../components/ui";

export function TutorialScreen({ onBegin, onSkip }: { onBegin(): void; onSkip(): void }) {
  return <View style={styles.screen}><Panel style={styles.panel}>
    <Text style={styles.step}>FIRST DAY IN GUILDHAVEN</Text>
    <Text style={styles.title}>Found Your Guild</Text>
    <Text style={styles.body}>Your first job as Guildmaster is to sign two adventurers. The guided recruitment teaches party roles, potential, traits, signing fees, weekly salary, and contracts instead of asking you to guess what the numbers mean.</Text>
    <View style={styles.flow}><StatusChip label="1 · RECRUIT" tone="gold"/><StatusChip label="2 · FIRST QUEST" tone="blue"/><StatusChip label="3 · COMBAT" tone="danger"/><StatusChip label="4 · TRAVEL" tone="good"/></View>
    <Text style={styles.note}>Guidance continues contextually as systems unlock: the War Table, balanced deployment, red-border basic attacks, quest rewards, End Day healing, the seven-day Guild Planner, travel, Side Quests, Archives, dungeons, and Raids. Everything can be reviewed later in Settings → Guildmaster Handbook.</Text>
    <ActionButton label="BEGIN GUIDED GUILD" onPress={onBegin} />
    <SecondaryButton label="Skip Guided Recruitment" onPress={onSkip} />
  </Panel></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: 22 }, panel: { borderColor: colors.gold, gap: 14 }, step: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 }, title: { color: colors.text, fontSize: 28, fontWeight: "900" }, body: { color: colors.text, lineHeight: 21 }, flow:{flexDirection:"row",flexWrap:"wrap",gap:5}, note: { color: colors.muted, lineHeight: 18, fontStyle: "italic" } });
