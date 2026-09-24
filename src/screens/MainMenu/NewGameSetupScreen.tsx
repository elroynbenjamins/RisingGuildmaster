import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton, BackButton, Panel, colors } from "../../components/ui";
import { GuildCrest } from "../../components/guild/GuildCrest";
import { DIFFICULTIES } from "../../data/difficulty/difficulties";
import { GUILD_CRESTS, STARTER_GUILD_CREST_IDS, type GuildCrestId } from "../../data/guild/guildCrests";
import type { GameDifficultyId } from "../../game/difficulty/difficultyTypes";

const IDS: GameDifficultyId[] = ["standard", "veteran", "iron_guild"];
const EXPERIENCE_GUIDE: Record<GameDifficultyId, { bestFor: string; experience: string }> = {
  standard: { bestFor: "New players · Story-focused play", experience: "Forgiving battles · Comfortable economy" },
  veteran: { bestFor: "Experienced D20 and strategy players", experience: "Smarter foes · Tighter resources" },
  iron_guild: { bestFor: "Veterans seeking the full challenge", experience: "Ruthless foes · Harsh consequences" },
};

export function NewGameSetupScreen({ onBack, onStart }: { onBack(): void; onStart(difficultyId: GameDifficultyId, guildName: string, crestId: GuildCrestId): void }) {
  const [selectedId, setSelectedId] = useState<GameDifficultyId>("standard");
  const [guildName, setGuildName] = useState("The Wayfarers");
  const [crestId, setCrestId] = useState<GuildCrestId>("crownroad");
  const selected = DIFFICULTIES[selectedId];
  const crest = GUILD_CRESTS[crestId];
  const cleanName = guildName.trim();
  const validName = cleanName.length >= 3 && cleanName.length <= 24;
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.eyebrow}>NEW GUILD CHARTER</Text>
    <Text style={styles.title}>Found Your Guild</Text>
    <Text style={styles.intro}>Name the company, choose its starter crest, then select the challenge for this save. Name and crest identify the guild; difficulty cannot be changed later.</Text>

    <Panel style={styles.identity}>
      <View style={styles.identityHead}><GuildCrest crestId={crestId} size={62}/><View style={styles.flex}><Text style={styles.identityLabel}>GUILD NAME</Text><TextInput value={guildName} onChangeText={setGuildName} maxLength={24} placeholder="The Wayfarers" placeholderTextColor={colors.muted} style={styles.input}/></View></View>
      <Text style={validName ? styles.valid : styles.invalid}>{validName ? cleanName.length + "/24 · Charter name ready" : "Use 3–24 characters."}</Text>
      <Text style={styles.identityLabel}>STARTER CREST</Text>
      <View style={styles.crests}>{STARTER_GUILD_CREST_IDS.map((id) => { const entry = GUILD_CRESTS[id]; const active = id === crestId; return <Pressable key={id} onPress={() => setCrestId(id)} style={[styles.crestCard, active && styles.crestSelected]}><GuildCrest crestId={id} size={44}/><Text style={styles.crestName}>{entry.name}</Text></Pressable>; })}</View>
      <Text style={styles.motto}>“{crest.motto}”</Text>
    </Panel>

    <Text style={styles.section}>CHARTER DIFFICULTY</Text>
    <View style={styles.difficultyGrid}>{IDS.map((id) => { const entry = DIFFICULTIES[id]; const active = id === selectedId; return <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => setSelectedId(id)} style={styles.difficultyPressable}><View style={[styles.difficultyChoice, active && styles.selected, id === "iron_guild" && styles.iron]}><Text style={styles.difficultyName}>{entry.name}</Text><Text numberOfLines={2} style={styles.difficultyTagline}>{entry.tagline}</Text><View style={[styles.mark, active && styles.markSelected]}><Text style={styles.markText}>{active ? "✓" : ""}</Text></View></View></Pressable>; })}</View>
    <Panel style={[styles.difficultyDetail,selectedId==="iron_guild"&&styles.iron]}><Text style={styles.name}>{selected.name}</Text><Text style={styles.tagline}>{selected.tagline}</Text><Text style={styles.description}>{selected.description}</Text><View style={styles.guide}><Text style={styles.guideLabel}>BEST FOR</Text><Text style={styles.guideValue}>{EXPERIENCE_GUIDE[selectedId].bestFor}</Text><Text style={styles.guideLabel}>WHAT TO EXPECT</Text><Text style={styles.guideValue}>{EXPERIENCE_GUIDE[selectedId].experience}</Text></View>{!selected.allowsPaidRecruitmentRefresh && <Text style={styles.restriction}>IRON RULE · Tavern candidates cannot be refreshed with gold. Scheduled free and tutorial refreshes remain available.</Text>}</Panel>

    <Panel style={styles.summary}><View style={styles.identityHead}><GuildCrest crestId={crestId} size={48}/><View style={styles.flex}><Text style={styles.summaryLabel}>FOUNDING CHARTER</Text><Text style={styles.summaryName}>{cleanName || "Unnamed Guild"}</Text><Text style={styles.summaryText}>{selected.name + " · " + crest.name}</Text></View></View></Panel>
    <ActionButton disabled={!validName} label={"Found " + (cleanName || "Guild")} onPress={() => onStart(selectedId, cleanName, crestId)} />
  </ScrollView>;
}
const styles = StyleSheet.create({
  content: { alignSelf: "center", maxWidth: 620, padding: 18, paddingBottom: 45, width: "100%" },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 2, marginTop: 12 },
  title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 5 },
  intro: { color: colors.muted, lineHeight: 20, marginBottom: 14, marginTop: 8 },
  identity: { borderColor: colors.gold, gap: 9, marginBottom: 15 },
  identityHead: { alignItems: "center", flexDirection: "row", gap: 10 },
  identityLabel: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: .8 },
  input: { backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text, fontSize: 17, fontWeight: "900", marginTop: 4, minHeight: 44, paddingHorizontal: 10 },
  valid: { color: colors.green, fontSize: 9, fontWeight: "800" }, invalid: { color: colors.danger, fontSize: 9, fontWeight: "800" },
  crests: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  crestCard: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 8, borderWidth: 1, padding: 6, width: "23%" },
  crestSelected: { borderColor: colors.gold, borderWidth: 2 },
  crestName: { color: colors.text, fontSize: 8, fontWeight: "800", marginTop: 4, textAlign: "center" },
  motto: { color: colors.muted, fontStyle: "italic", textAlign: "center" },
  section: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 8 },
  difficultyGrid:{flexDirection:"row",gap:7,marginBottom:9},difficultyPressable:{flex:1},difficultyChoice:{backgroundColor:colors.panel,borderColor:colors.border,borderRadius:10,borderWidth:1,minHeight:94,padding:9,position:"relative"},difficultyName:{color:colors.text,fontSize:13,fontWeight:"900",paddingRight:20},difficultyTagline:{color:colors.gold,fontSize:9,fontWeight:"800",lineHeight:13,marginTop:4},difficultyDetail:{gap:8}, selected: { backgroundColor: "#29281f", borderColor: colors.gold, borderWidth: 2 }, iron: { borderColor: "#72504c" },
  cardHead: { alignItems: "center", flexDirection: "row", gap: 10 }, flex: { flex: 1 }, name: { color: colors.text, fontSize: 21, fontWeight: "900" }, tagline: { color: colors.gold, fontSize: 11, fontWeight: "800", marginTop: 2 },
  mark: { alignItems: "center", borderColor: colors.border, borderRadius: 10, borderWidth: 2, height: 20, justifyContent: "center", position:"absolute",right:7,top:7,width:20 }, markSelected: { backgroundColor: colors.gold, borderColor: colors.gold }, markText: { color: "#17130c", fontWeight: "900" },
  description: { color: colors.muted, fontSize: 12, lineHeight: 18 }, guide: { backgroundColor: colors.panel2, borderRadius: 7, gap: 2, padding: 9 }, guideLabel: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: .8, marginTop: 3 }, guideValue: { color: colors.text, fontSize: 11, fontWeight: "700", lineHeight: 16 }, restriction: { color: colors.danger, fontSize: 10, fontWeight: "800", lineHeight: 15 },
  summary: { borderColor: colors.gold, marginBottom: 12, marginTop: 16 }, summaryLabel: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.4 }, summaryName: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 3 }, summaryText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 }
});
