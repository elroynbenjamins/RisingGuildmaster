import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GameIcon } from "../../components/icons/GameIcon";
import { BackButton, Panel, SectionTitle, colors } from "../../components/ui";
import { getDiscoveredLoreEntries, getLoreProgress } from "../../game/world/loreService";
import type { LorePerspectiveKind } from "../../game/world/worldTypes";
import { useGuild } from "../../state/GuildContext";
import { SpeakerPortrait } from "../../components/characters/NpcPortrait";

const KIND_LABELS: Record<LorePerspectiveKind, string> = {
  eyewitness: "EYEWITNESS",
  oral_tradition: "ORAL TRADITION",
  official_claim: "OFFICIAL ACCOUNT",
  scholarly_record: "SCHOLARLY RECORD",
  field_note: "FIELD NOTE",
};

export function LoreJournalScreen({ onBack }: { onBack(): void }) {
  const { guild } = useGuild();
  const entries = getDiscoveredLoreEntries(guild.world);
  const progress = getLoreProgress(guild.world);
  const [expandedId, setExpandedId] = useState<string | null>(entries[0]?.id ?? null);

  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.eyebrow}>GUILD ARCHIVES</Text>
    <Text style={styles.title}>Lore & Journal</Text>
    <Text style={styles.intro}>Facts are recorded beside the voices that preserved, disputed, or survived them. No account is guaranteed to be impartial.</Text>
    <Panel style={styles.progress}><GameIcon id="journal" size={42} /><View style={styles.progressText}><Text style={styles.progressValue}>{progress.discovered} / {progress.total}</Text><Text style={styles.progressLabel}>DISCOVERED ENTRIES</Text></View></Panel>
    <SectionTitle>KNOWN LORE</SectionTitle>
    {entries.map((entry) => {
      const expanded = entry.id === expandedId;
      return <Pressable key={entry.id} accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpandedId(expanded ? null : entry.id)}>
        <Panel style={styles.entry}>
          <View style={styles.header}><View style={styles.headerText}><Text style={styles.category}>{entry.category.toUpperCase()}</Text><Text style={styles.entryTitle}>{entry.title}</Text></View><Text style={styles.chevron}>{expanded ? "−" : "+"}</Text></View>
          {expanded && <View style={styles.details}>
            <Text style={styles.body}>{entry.text}</Text>
            {!!entry.perspectives?.length && <><Text style={styles.perspectiveHeading}>RECORDED PERSPECTIVES</Text>{entry.perspectives.map((perspective, index) => <View key={`${perspective.speaker}-${index}`} style={styles.quote}>
              <SpeakerPortrait speaker={perspective.speaker} size={43} /><View style={styles.quoteCopy}><Text style={styles.quoteText}>“{perspective.text}”</Text><Text style={styles.speaker}>— {perspective.speaker}</Text><Text style={styles.role}>{perspective.role ? `${perspective.role} · ` : ""}{KIND_LABELS[perspective.kind]}</Text></View>
            </View>)}</>}
          </View>}
        </Panel>
      </Pressable>;
    })}
    {progress.discovered < progress.total && <Text style={styles.locked}>{progress.total - progress.discovered} entries remain undiscovered. Complete quests, inspect ruins, and listen to local witnesses to reveal them.</Text>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 50 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 2, marginTop: 16 },
  title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 3 },
  intro: { color: colors.muted, lineHeight: 20, marginBottom: 15, marginTop: 8 },
  progress: { alignItems: "center", borderColor: colors.gold, flexDirection: "row", marginBottom: 15 },
  progressText: { marginLeft: 13 }, progressValue: { color: colors.text, fontSize: 23, fontWeight: "900" }, progressLabel: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.3, marginTop: 2 },
  entry: { marginBottom: 10 }, header: { alignItems: "center", flexDirection: "row" }, headerText: { flex: 1 }, category: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 }, entryTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 3 }, chevron: { color: colors.gold, fontSize: 25, fontWeight: "800" },
  details: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 13, paddingTop: 13 }, body: { color: colors.text, lineHeight: 21 }, perspectiveHeading: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 8, marginTop: 17 },
  quote: { alignItems: "flex-start", backgroundColor: colors.panel2, borderLeftColor: colors.gold, borderLeftWidth: 3, borderRadius: 8, flexDirection: "row", gap: 10, marginTop: 8, padding: 12 }, quoteCopy: { flex: 1 }, quoteText: { color: colors.text, fontStyle: "italic", lineHeight: 20 }, speaker: { color: colors.gold, fontSize: 12, fontWeight: "900", marginTop: 9 }, role: { color: colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: .5, marginTop: 2, textTransform: "uppercase" }, locked: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: "center" },
});
