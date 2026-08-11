import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { EnemyPortrait } from "../../components/enemies/EnemyPortrait";
import { BackButton, EmptyState, Panel, SegmentedTabs, colors } from "../../components/ui";
import { ENEMIES } from "../../data/enemies";
import { ENEMY_FACTIONS } from "../../data/enemies/factions";
import { MONSTER_LORE } from "../../data/enemies/monsterLore";
import { ENEMY_SKILLS } from "../../data/skills/enemySkills";
import { getSkillDescriptionLines } from "../../game/combat/skillDescription";
import type { EnemyDefinition } from "../../game/enemies/enemyTypes";
import { getMonsterManualProgress, isEnemyDiscovered } from "../../game/enemies/monsterManualService";
import { useGuild } from "../../state/GuildContext";
import { SkillIcon } from "../../components/skills/SkillIcon";
import { GameIcon } from "../../components/icons/GameIcon";

type Filter = "All" | "Encountered" | "Unknown";
const pct = (value: number) => `${value >= 0 ? "+" : ""}${Math.round(value * 100)}%`;
const words = (value: string) => value.replace(/_/g, " ");

function StatProfile({ enemy }: { enemy: EnemyDefinition }) {
  const values = [["HP", enemy.hpModifier], ["P. DMG", enemy.physicalDamageModifier], ["P. DEF", enemy.physicalDefenseModifier], ["M. DMG", enemy.magicDamageModifier], ["M. DEF", enemy.magicDefenseModifier], ["SPEED", enemy.speedModifier]] as const;
  return <View style={styles.stats}>{values.map(([label, value]) => <View key={label} style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue, value > 0 && styles.positive, value < 0 && styles.negative]}>{pct(value)}</Text></View>)}</View>;
}

function MonsterDetails({ enemy }: { enemy: EnemyDefinition }) {
  const resistances = Object.entries(enemy.resistanceModifiers);
  const skills = enemy.skillIds.map((id) => ENEMY_SKILLS[id]).filter(Boolean);
  return <View style={styles.details}>
    <View style={styles.detailHero}><EnemyPortrait enemyId={enemy.id} size={92} /><Text style={[styles.lore, styles.detailLore]}>{MONSTER_LORE[enemy.id] ?? "The guild has not yet recorded detailed field notes for this creature."}</Text></View>
    <Text style={styles.section}>RELATIVE STAT PROFILE</Text><Text style={styles.note}>Compared with a standard creature of the same level.</Text><StatProfile enemy={enemy} />
    <Text style={styles.section}>KNOWN ACTIONS & TRAITS</Text>{skills.map((skill) => <View key={skill.id} style={styles.skill}><View style={styles.skillHead}><SkillIcon skillId={skill.id} size={42} /><View style={styles.flex}><Text style={styles.skillName}>{skill.name}</Text><Text style={styles.skillType}>{skill.type.replace(/_/g, " ").toUpperCase()}</Text></View></View>{getSkillDescriptionLines(skill).map((line, index) => <Text key={index} style={styles.skillLine}>• {line}</Text>)}</View>)}
    <Text style={styles.section}>DEFENSES</Text><Text style={styles.line}>{enemy.conditionImmunities.length ? `Immunities: ${enemy.conditionImmunities.map(words).join(", ")}` : "No confirmed condition immunities."}</Text>{resistances.length ? resistances.map(([type, value]) => <Text key={type} style={styles.line}>{words(type)} resistance: {Math.round(value * 100)}%</Text>) : <Text style={styles.line}>No confirmed resistances.</Text>}
    <Text style={styles.section}>FIELD REWARDS</Text><Text style={styles.line}>{enemy.xpReward} XP • {enemy.goldRewardMin}–{enemy.goldRewardMax} gold • Loot: {words(enemy.lootTableId)}</Text>
  </View>;
}

export function MonsterManualScreen({ onBack }: { onBack(): void }) {
  const { guild } = useGuild();
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState<string>();
  const progress = getMonsterManualProgress(guild);
  const enemies = useMemo(() => Object.values(ENEMIES).sort((a, b) => a.factionId.localeCompare(b.factionId) || a.name.localeCompare(b.name)).filter((enemy) => filter === "All" || (filter === "Encountered") === isEnemyDiscovered(guild, enemy.id)), [filter, guild.discoveredEnemyIds]);
  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.eyebrow}>GUILD ARCHIVES</Text><Text style={styles.title}>Monster Manual</Text><Text style={styles.intro}>Field notes gathered by guild parties. Encounter creatures to reveal their identities, portraits, combat profiles, abilities, defenses, and rewards.</Text>
    <Panel style={styles.progress}><View style={styles.progressTop}><Text style={styles.progressValue}>{progress.discovered} / {progress.total}</Text><Text style={styles.progressLabel}>CREATURES RECORDED</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${progress.total ? progress.discovered / progress.total * 100 : 0}%` }]} /></View></Panel>
    <SegmentedTabs values={["All", "Encountered", "Unknown"] as const} value={filter} onChange={setFilter} />
    {enemies.map((enemy, index) => { const discovered = isEnemyDiscovered(guild, enemy.id); const selected = selectedId === enemy.id; return <Pressable accessibilityRole="button" accessibilityLabel={discovered ? `Open ${enemy.name} manual entry` : "Undiscovered monster"} key={enemy.id} onPress={() => discovered && setSelectedId(selected ? undefined : enemy.id)}><Panel style={[styles.entry, selected && styles.selected, !discovered && styles.unknown]}><View style={styles.entryHead}><EnemyPortrait enemyId={enemy.id} size={48} hidden={!discovered} /><View style={styles.flex}><Text style={[styles.enemyName, !discovered && styles.hiddenName]}>{discovered ? enemy.name : `Undiscovered Creature ${String(index + 1).padStart(2, "0")}`}</Text><Text style={styles.meta}>{discovered ? `${ENEMY_FACTIONS[enemy.factionId].name} • ${words(enemy.role)}` : "No field report available"}</Text></View>{discovered ? <Text style={styles.chevron}>{selected ? "⌃" : "›"}</Text> : <GameIcon id="locked" size={28} />}</View>{selected && discovered ? <MonsterDetails enemy={enemy} /> : null}</Panel></Pressable>; })}
    {!enemies.length && <EmptyState title="No entries in this section" message={filter === "Encountered" ? "Begin a combat encounter to record its creatures." : "Every known creature has been encountered."} />}
  </ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 50 }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.8, marginTop: 7 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 3 }, intro: { color: colors.muted, lineHeight: 20, marginTop: 7, marginBottom: 13 }, progress: { marginBottom: 13, borderColor: colors.gold }, progressTop: { flexDirection: "row", alignItems: "baseline", gap: 9 }, progressValue: { color: colors.gold, fontSize: 25, fontWeight: "900" }, progressLabel: { color: colors.text, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, track: { height: 8, backgroundColor: colors.panel2, borderRadius: 5, overflow: "hidden", marginTop: 9 }, fill: { height: "100%", backgroundColor: colors.gold }, entry: { marginBottom: 9, padding: 13 }, selected: { borderColor: colors.gold, borderWidth: 2 }, unknown: { opacity: .62, borderStyle: "dashed" }, entryHead: { flexDirection: "row", alignItems: "center", gap: 11 }, flex: { flex: 1 }, enemyName: { color: colors.text, fontSize: 17, fontWeight: "900" }, hiddenName: { color: colors.muted }, meta: { color: colors.muted, fontSize: 11, textTransform: "capitalize", marginTop: 3 }, chevron: { color: colors.gold, fontSize: 23 }, details: { borderTopWidth: 1, borderColor: colors.border, marginTop: 12, paddingTop: 12 }, detailHero: { flexDirection: "row", gap: 12, alignItems: "center" }, detailLore: { flex: 1 }, lore: { color: colors.text, lineHeight: 20, fontStyle: "italic" }, section: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.3, marginTop: 15, marginBottom: 6 }, note: { color: colors.muted, fontSize: 10, marginBottom: 7 }, stats: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, stat: { width: "31%", backgroundColor: colors.panel2, borderRadius: 7, padding: 7 }, statLabel: { color: colors.muted, fontSize: 8, fontWeight: "900" }, statValue: { color: colors.text, fontWeight: "900", marginTop: 2 }, positive: { color: colors.danger }, negative: { color: colors.green }, skill: { backgroundColor: colors.panel2, padding: 9, borderRadius: 8, marginBottom: 6 }, skillHead: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, skillName: { color: colors.text, fontWeight: "900" }, skillType: { color: colors.gold, fontSize: 9, fontWeight: "900" }, skillLine: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }, line: { color: colors.text, fontSize: 12, lineHeight: 18, textTransform: "capitalize" } });
