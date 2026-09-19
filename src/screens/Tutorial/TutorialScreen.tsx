import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { ActionButton, Panel, SecondaryButton, colors } from "../../components/ui";

export function TutorialScreen({ onBegin, onSkip }: { onBegin(): void; onSkip(): void }) {
  return <ScrollView contentContainerStyle={styles.screen}><Panel style={styles.panel}>
    <Text style={styles.step}>FIRST DAY IN GUILDHAVEN</Text>
    <Text style={styles.title}>Build Your First Party</Text>
    <Text style={styles.body}>Start with recruitment. Hire your first hero, use the tutorial's one free board refresh, then recruit a second hero so the guild has a real adventuring party.</Text>
    <Text style={styles.guide}>◆ Compare class, potential estimate, traits, recruitment fee, and weekly salary before signing a hero.</Text>
    <Text style={styles.guide}>◆ The tutorial will guide the free refresh automatically after your first recruit.</Text>
    <Text style={styles.note}>Combat, campaign travel, Idle Missions, Roguelite Expeditions, and Regional Threats now teach themselves when you first reach those systems.</Text>
    <ActionButton label="Begin Tutorial" onPress={onBegin} />
    <SecondaryButton label="Skip Tutorial" onPress={onSkip} />
  </Panel></ScrollView>;
}
const styles = StyleSheet.create({ screen: { backgroundColor: colors.background, flexGrow: 1, justifyContent: "center", padding: 20, paddingVertical: 30 }, panel: { borderColor: colors.gold, gap: 13 }, step: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 }, title: { color: colors.text, fontSize: 27, fontWeight: "900" }, body: { color: colors.text, lineHeight: 21 }, guide: { color: colors.text, fontSize: 12, lineHeight: 18 }, note: { color: colors.muted, lineHeight: 18, fontStyle: "italic" } });
