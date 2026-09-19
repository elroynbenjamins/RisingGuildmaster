import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, Panel, SecondaryButton, colors } from "../../components/ui";

export function TutorialScreen({ onBegin, onSkip }: { onBegin(): void; onSkip(): void }) {
  return <View style={styles.screen}><Panel style={styles.panel}><Text style={styles.step}>FIRST DAY IN GUILDHAVEN</Text><Text style={styles.title}>Build Your First Party</Text><Text style={styles.body}>Recruit your first hero, then use the tutorial's free board refresh and recruit a second hero. Portraits, potential estimates, traits, recruitment fees, and weekly salary demand all matter.</Text>
<Text style={styles.guide}>◆ Campaign objectives now follow the world map. Travel to the required region—and settlement when shown—before starting the next story step.</Text>
<Text style={styles.guide}>◆ In tactical combat, select a skill first if you want. Double tap an empty teal tile to move; the skill stays queued and its valid targets update from the new position.</Text>
<Text style={styles.guide}>◆ Ending a guild day restores 35 readiness. Idle Missions give normal mission XP plus a guaranteed 5% of each assigned hero's next-level requirement.</Text>
<Text style={styles.guide}>◆ Roguelite Expeditions unlock at 6 owned heroes. Regional Threat appears later, once 6 heroes reach Level 2, with its own explanation.</Text>
<Text style={styles.note}>The normal board refresh costs gold or waits for its weekly free refresh. This guided refresh is free once.</Text><ActionButton label="Begin Tutorial" onPress={onBegin} /><SecondaryButton label="Skip Tutorial" onPress={onSkip} /></Panel></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: 22 }, panel: { borderColor: colors.gold, gap: 14 }, step: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 }, title: { color: colors.text, fontSize: 28, fontWeight: "900" }, body: { color: colors.text, lineHeight: 21 }, guide: { color: colors.text, fontSize: 12, lineHeight: 18 }, note: { color: colors.muted, lineHeight: 18, fontStyle: "italic" } });
