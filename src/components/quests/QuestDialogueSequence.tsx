import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { QuestDialogueLine } from "../../data/quests/questDialogue";

import { SpeakerPortrait } from "../characters/NpcPortrait";
import { colors } from "../ui";
import { useTheme } from "../../theme/theme";

export function QuestDialogueSequence({ lines, label, finalLabel, onComplete }: { lines: readonly QuestDialogueLine[]; label: string; finalLabel?: string; onComplete?(): void }) {
  const {colors:themeColors}=useTheme();
  const [index, setIndex] = useState(0); const line = lines[Math.min(index, Math.max(0, lines.length - 1))]; if (!line) return null; const last = index >= lines.length - 1;
  const advance = () => last ? onComplete?.() : setIndex((value) => value + 1);
  return <View style={[styles.scene,{backgroundColor:themeColors.panel,borderColor:themeColors.gold}]}><View style={[styles.top,{backgroundColor:themeColors.panel2}]}><Text style={[styles.label,{color:themeColors.gold}]}>{label}</Text><Text style={[styles.progress,{color:themeColors.muted}]}>{index + 1} / {lines.length}</Text></View><View style={styles.dialogue}><SpeakerPortrait speaker={line.speaker} portraitId={line.portraitId} enemyId={line.enemyId} size={70} /><View style={styles.copy}><Text style={[styles.speaker,{color:themeColors.gold}]}>{line.speaker}</Text><Text style={[styles.text,{color:themeColors.text}]}>“{line.text}”</Text></View></View>{(!last || onComplete) && <Pressable accessibilityRole="button" onPress={advance} style={[styles.next,{borderTopColor:themeColors.border}]}><Text style={[styles.nextText,{color:themeColors.text}]}>{last ? finalLabel ?? "Continue" : "Next"}</Text><Text style={[styles.arrow,{color:themeColors.gold}]}>›</Text></Pressable>}</View>;
}

const styles = StyleSheet.create({ scene: { backgroundColor: "#171d20", borderColor: colors.gold, borderRadius: 14, borderWidth: 1, overflow: "hidden" }, top: { alignItems: "center", backgroundColor: "#242921", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 13, paddingVertical: 8 }, label: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.4 }, progress: { color: colors.muted, fontSize: 9, fontWeight: "800" }, dialogue: { alignItems: "flex-start", flexDirection: "row", gap: 12, minHeight: 118, padding: 14 }, copy: { flex: 1 }, speaker: { color: colors.gold, fontSize: 13, fontWeight: "900" }, text: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 7 }, next: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11 }, nextText: { color: colors.text, fontWeight: "900" }, arrow: { color: colors.gold, fontSize: 24 } });
