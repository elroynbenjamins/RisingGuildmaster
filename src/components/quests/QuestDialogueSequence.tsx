import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { QuestDialogueLine } from "../../data/quests/questDialogue";
import { EnemyPortrait } from "../enemies/EnemyPortrait";
import { NpcPortrait, SpeakerPortrait } from "../characters/NpcPortrait";
import { colors } from "../ui";

export function QuestDialogueSequence({ lines, label, finalLabel, onComplete }: { lines: readonly QuestDialogueLine[]; label: string; finalLabel?: string; onComplete?(): void }) {
  const [index, setIndex] = useState(0); const line = lines[Math.min(index, Math.max(0, lines.length - 1))]; if (!line) return null; const last = index >= lines.length - 1;
  const advance = () => last ? onComplete?.() : setIndex((value) => value + 1);
  return <View style={styles.scene}><View style={styles.top}><Text style={styles.label}>{label}</Text><Text style={styles.progress}>{index + 1} / {lines.length}</Text></View><View style={styles.dialogue}>{line.enemyId ? <EnemyPortrait enemyId={line.enemyId} size={70} /> : line.portraitId ? <NpcPortrait portraitId={line.portraitId} size={70} /> : <SpeakerPortrait speaker={line.speaker} size={70} />}<View style={styles.copy}><Text style={styles.speaker}>{line.speaker}</Text><Text style={styles.text}>“{line.text}”</Text></View></View>{(!last || onComplete) && <Pressable accessibilityRole="button" onPress={advance} style={styles.next}><Text style={styles.nextText}>{last ? finalLabel ?? "Continue" : "Next"}</Text><Text style={styles.arrow}>›</Text></Pressable>}</View>;
}

const styles = StyleSheet.create({ scene: { backgroundColor: "#171d20", borderColor: colors.gold, borderRadius: 14, borderWidth: 1, overflow: "hidden" }, top: { alignItems: "center", backgroundColor: "#242921", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 13, paddingVertical: 8 }, label: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.4 }, progress: { color: colors.muted, fontSize: 9, fontWeight: "800" }, dialogue: { alignItems: "flex-start", flexDirection: "row", gap: 12, minHeight: 118, padding: 14 }, copy: { flex: 1 }, speaker: { color: colors.gold, fontSize: 13, fontWeight: "900" }, text: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 7 }, next: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11 }, nextText: { color: colors.text, fontWeight: "900" }, arrow: { color: colors.gold, fontSize: 24 } });
