import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SkillIcon } from "../../components/skills/SkillIcon";
import { BackButton, Panel, SectionTitle, SegmentedTabs, colors } from "../../components/ui";
import { CLASSES } from "../../data/classes/classes";
import { ENEMIES } from "../../data/enemies";
import { ENEMY_SKILLS } from "../../data/skills/enemySkills";
import { HERO_SKILLS } from "../../data/skills/heroSkills";
import { SUBCLASSES } from "../../data/subclasses/subclasses";
import { MASTERIES } from "../../data/masteries/masteries";
import { getSkillDescriptionLines } from "../../game/combat/skillDescription";
import type { CombatSkillDefinition } from "../../game/combat/skillTypes";
import { useGuild } from "../../state/GuildContext";

type Tab = "Hero Skills" | "Enemy Abilities";
const words = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function SkillEntry({ skill, source }: { skill: CombatSkillDefinition; source: string }) {
  const [expanded, setExpanded] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)}><Panel style={styles.entry}><View style={styles.head}><SkillIcon skillId={skill.id} size={54} /><View style={styles.copy}><Text style={styles.name}>{skill.name}</Text><Text style={styles.meta}>{source} · {words(skill.type)}</Text></View><Text style={styles.chevron}>{expanded ? "−" : "+"}</Text></View>{expanded ? <View style={styles.details}>{getSkillDescriptionLines(skill).map((line, index) => <Text key={`${line}-${index}`} style={styles.line}>• {line}</Text>)}</View> : null}</Panel></Pressable>;
}

export function SkillCodexScreen({ onBack }: { onBack(): void }) {
  const { guild } = useGuild(); const [tab, setTab] = useState<Tab>("Hero Skills"); const [query,setQuery]=useState("");
  const heroSources = useMemo(() => { const sources: Record<string, string[]> = {}; for (const heroClass of Object.values(CLASSES)) for (const id of heroClass.skillIds) (sources[id] ??= []).push(heroClass.name); for (const subclass of Object.values(SUBCLASSES)) for (const id of subclass.addedSkillIds) (sources[id] ??= []).push(subclass.name); for (const mastery of Object.values(MASTERIES)) for (const id of mastery.addedSkillIds) (sources[id] ??= []).push(`${mastery.name} mastery`); return sources; }, []);
  const enemyEntries = useMemo(() => { const discovered = new Set(guild.discoveredEnemyIds); const sources: Record<string, string[]> = {}; for (const enemy of Object.values(ENEMIES)) if (discovered.has(enemy.id)) for (const id of enemy.skillIds) (sources[id] ??= []).push(enemy.name); return Object.keys(sources).map((id) => ({ skill: ENEMY_SKILLS[id], source: sources[id]!.join(", ") })).filter((entry): entry is { skill: CombatSkillDefinition; source: string } => Boolean(entry.skill)).sort((a, b) => a.skill.name.localeCompare(b.skill.name)); }, [guild.discoveredEnemyIds]);
  const heroEntries = Object.values(HERO_SKILLS).map((skill) => ({ skill, source: heroSources[skill.id]?.join(", ") ?? "Subclass technique" })).sort((a, b) => a.source.localeCompare(b.source) || a.skill.name.localeCompare(b.skill.name));
  const normalized=query.trim().toLowerCase();const entries = (tab === "Hero Skills" ? heroEntries : enemyEntries).filter(({skill,source})=>!normalized||skill.name.toLowerCase().includes(normalized)||source.toLowerCase().includes(normalized)||skill.type.includes(normalized));
  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.eyebrow}>TACTICIAN'S ARCHIVE</Text><Text style={styles.title}>Skills & Abilities</Text><Text style={styles.intro}>A mechanical field guide drawn from the same definitions used in combat. Enemy techniques are recorded when their owners are first encountered.</Text><TextInput accessibilityLabel="Search skills and abilities" placeholder="Search skill, class or type…" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={{backgroundColor:colors.panel,borderColor:colors.border,borderRadius:9,borderWidth:1,color:colors.text,marginBottom:12,paddingHorizontal:12,paddingVertical:10}}/><SegmentedTabs values={["Hero Skills", "Enemy Abilities"] as const} value={tab} onChange={setTab} /><SectionTitle>{tab === "Hero Skills" ? `${entries.length} HERO TECHNIQUES` : `${entries.length} DISCOVERED ENEMY TECHNIQUES`}</SectionTitle>{entries.map(({ skill, source }) => <SkillEntry key={skill.id} skill={skill} source={source} />)}{!entries.length ? <Panel><Text style={styles.empty}>{query?"No techniques match this search.":"No enemy abilities recorded yet. Meet enemies in tactical combat to reveal their techniques."}</Text></Panel> : null}</ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 52 }, eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.8, marginTop: 8 }, title: { color: colors.text, fontSize: 29, fontWeight: "900", marginTop: 3 }, intro: { color: colors.muted, lineHeight: 20, marginVertical: 10 }, entry: { marginBottom: 8, padding: 10 }, head: { alignItems: "center", flexDirection: "row", gap: 11 }, copy: { flex: 1 }, name: { color: colors.text, fontSize: 16, fontWeight: "900" }, meta: { color: colors.gold, fontSize: 10, marginTop: 4 }, chevron: { color: colors.gold, fontSize: 23 }, details: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 10, paddingTop: 8 }, line: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 }, empty: { color: colors.muted, lineHeight: 20, textAlign: "center" } });
