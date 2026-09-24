import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton, Panel, StatusChip, colors } from "../../components/ui";
import { TUTORIAL_GUIDE_TOPICS } from "../../game/onboarding/tutorialGuide";
import { GuidedTourControls } from '../../components/tutorial/GuidedTourControls';

export function TutorialGuideScreen({ onBack }: { onBack(): void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.eyebrow}>GUILDMASTER HANDBOOK</Text>
    <Text style={styles.title}>How to Run the Guild</Text>
    <Text style={styles.intro}>Review the rules here, or resume the interactive main-tab guides below. New systems are introduced as they become relevant.</Text>
    <GuidedTourControls />
    <Panel style={styles.legend}><Text style={styles.legendTitle}>QUICK COMBAT MEMORY</Text><Text style={styles.legendText}>YELLOW TILE = move · RED ENEMY BORDER = double-tap basic attack · highlighted skill target = double-tap selected skill</Text></Panel>
    {TUTORIAL_GUIDE_TOPICS.map((topic, index) => {
      const open = openId === topic.id;
      return <Pressable key={topic.id} accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpenId(open ? null : topic.id)} style={({ pressed }) => [styles.topic, pressed && styles.pressed]}>
        <View style={styles.topicHeader}><View style={styles.numberPlate}><Text style={styles.number}>{String(index + 1).padStart(2, "0")}</Text></View><View style={styles.flex}><Text style={styles.topicTitle}>{topic.title}</Text><Text style={styles.topicSubtitle}>{topic.subtitle}</Text></View><StatusChip label={open ? "OPEN" : "REVIEW"} tone={topic.accent} /></View>
        {open ? <View style={styles.bullets}>{topic.bullets.map((bullet, bulletIndex) => <View key={bulletIndex} style={styles.bulletRow}><Text style={styles.bulletMark}>◆</Text><Text style={styles.bulletText}>{bullet}</Text></View>)}</View> : null}
      </Pressable>;
    })}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 60 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.6, marginTop: 12 },
  title: { color: colors.text, fontSize: 29, fontWeight: "900", marginTop: 4 },
  intro: { color: colors.muted, lineHeight: 20, marginBottom: 12, marginTop: 7 },
  legend: { borderColor: colors.danger, gap: 5, marginBottom: 12 },
  legendTitle: { color: colors.danger, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  legendText: { color: colors.text, fontSize: 11, fontWeight: "800", lineHeight: 17 },
  topic: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 2, marginBottom: 9, padding: 11 },
  pressed: { opacity: .78, transform: [{ translateY: 1 }] },
  topicHeader: { alignItems: "center", flexDirection: "row", gap: 10 },
  numberPlate: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  number: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  flex: { flex: 1 },
  topicTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  topicSubtitle: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 2 },
  bullets: { borderTopColor: colors.border, borderTopWidth: 1, gap: 8, marginTop: 11, paddingTop: 10 },
  bulletRow: { alignItems: "flex-start", flexDirection: "row", gap: 8 },
  bulletMark: { color: colors.gold, fontSize: 9, marginTop: 2 },
  bulletText: { color: colors.text, flex: 1, fontSize: 11, lineHeight: 17 },
});
