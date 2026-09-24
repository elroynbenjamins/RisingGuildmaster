import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { EnemyPortrait } from "../../components/enemies/EnemyPortrait";
import { ArchiveRewardsPanel } from "../../components/archives/ArchiveRewardsPanel";
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
import { SkillDetailsModal } from "../../components/skills/SkillDetailsModal";
import { GameIcon } from "../../components/icons/GameIcon";
import { formatGameId, formatGameIdUpper } from "../../ui/textFormat";

type Filter = "All" | "Encountered" | "Unknown";
const pct = (value: number) => `${value >= 0 ? "+" : ""}${Math.round(value * 100)}%`;

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
    <Text style={styles.section}>KNOWN ACTIONS & TRAITS</Text>{skills.map((skill) => <View key={skill.id} style={styles.skill}><View style={styles.skillHead}><SkillIcon skillId={skill.id} size={42} /><View style={styles.flex}><Text style={styles.skillName}>{skill.name}</Text><Text style={styles.skillType}>{formatGameIdUpper(skill.type)}</Text></View></View>{getSkillDescriptionLines(skill).map((line, index) => <Text key={index} style={styles.skillLine}>• {line}</Text>)}</View>)}
    <Text style={styles.section}>DEFENSES</Text><Text style={styles.line}>{enemy.conditionImmunities.length ? `Immunities: ${enemy.conditionImmunities.map(formatGameId).join(", ")}` : "No confirmed condition immunities."}</Text>{resistances.length ? resistances.map(([type, value]) => <Text key={type} style={styles.line}>{formatGameId(type)} resistance: {Math.round(value * 100)}%</Text>) : <Text style={styles.line}>No confirmed resistances.</Text>}
    <Text style={styles.section}>FIELD REWARDS</Text><Text style={styles.line}>{enemy.xpReward} XP • {enemy.goldRewardMin}–{enemy.goldRewardMax} gold • Loot: {formatGameId(enemy.lootTableId)}</Text>
  </View>;
}

export function MonsterManualScreen({ onBack }: { onBack(): void }) {
  const { guild } = useGuild();
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState<string>();
  const [query,setQuery]=useState("");
  const progress = getMonsterManualProgress(guild);
  const normalized=query.trim().toLowerCase();
  const enemies = useMemo(() => Object.values(ENEMIES).sort((a, b) => a.factionId.localeCompare(b.factionId) || a.name.localeCompare(b.name)).filter((enemy) => (filter === "All" || (filter === "Encountered") === isEnemyDiscovered(guild, enemy.id)) && (!normalized || (isEnemyDiscovered(guild, enemy.id) && `${enemy.name} ${ENEMY_FACTIONS[enemy.factionId].name} ${formatGameId(enemy.role)}`.toLowerCase().includes(normalized)))), [filter, normalized, guild.discoveredEnemyIds]);
  const selectedEnemy=selectedId&&isEnemyDiscovered(guild,selectedId)?ENEMIES[selectedId]:undefined;
  return <><ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.eyebrow}>GUILD ARCHIVES</Text><Text style={styles.title}>Monster Manual</Text><Text style={styles.intro}>Field notes gathered by guild parties. Encounter creatures to reveal their identities, portraits, combat profiles, abilities, defenses, and rewards.</Text>
    <Panel style={styles.progress}><View style={styles.progressTop}><Text style={styles.progressValue}>{progress.discovered} / {progress.total}</Text><Text style={styles.progressLabel}>CREATURES RECORDED</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${progress.total ? progress.discovered / progress.total * 100 : 0}%` }]} /></View></Panel>
    <ArchiveRewardsPanel track="bestiary" />
    <TextInput accessibilityLabel="Search discovered monsters" placeholder="Search discovered creature, faction, or role…" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} autoCorrect={false} autoCapitalize="none" returnKeyType="done" submitBehavior="blurAndSubmit" style={styles.search}/>
    <SegmentedTabs values={["All", "Encountered", "Unknown"] as const} value={filter} onChange={(value)=>{setFilter(value);setSelectedId(undefined);}} />
    <View style={styles.entryGrid}>{enemies.map((enemy, index) => { const discovered = isEnemyDiscovered(guild, enemy.id); const selected = selectedId === enemy.id; return <Pressable accessibilityRole="button" accessibilityState={{selected}} accessibilityLabel={discovered ? `Open ${enemy.name} manual entry` : "Undiscovered monster"} disabled={!discovered} key={enemy.id} onPress={() => setSelectedId(enemy.id)} style={({pressed})=>[styles.entryPressable,pressed&&discovered&&styles.pressed]}><Panel style={[styles.entry, selected && styles.selected, !discovered && styles.unknown]}><View style={styles.tileTop}><EnemyPortrait enemyId={enemy.id} size={46} hidden={!discovered} />{discovered?<Text style={styles.inspect}>INSPECT</Text>:<GameIcon id="locked" size={24} />}</View><Text numberOfLines={2} style={[styles.enemyName, !discovered && styles.hiddenName]}>{discovered ? enemy.name : `Undiscovered Creature ${String(index + 1).padStart(2, "0")}`}</Text><Text numberOfLines={2} style={styles.meta}>{discovered ? `${ENEMY_FACTIONS[enemy.factionId].name} · ${formatGameId(enemy.role)}` : "No field report available"}</Text></Panel></Pressable>; })}</View>
    {!enemies.length && <EmptyState title="No entries in this section" message={query?"No discovered creatures match this search.":filter === "Encountered" ? "Begin a combat encounter to record its creatures." : "Every known creature has been encountered."} />}
  </ScrollView><SkillDetailsModal visible={Boolean(selectedEnemy)} title="MONSTER FIELD REPORT" closeLabel="Close monster field report" onClose={()=>setSelectedId(undefined)}>{selectedEnemy?<MonsterDetails enemy={selectedEnemy}/>:null}</SkillDetailsModal></>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 50 }, search:{backgroundColor:colors.panel,borderColor:colors.border,borderRadius:9,borderWidth:1,color:colors.text,marginBottom:12,minHeight:44,paddingHorizontal:12,paddingVertical:10},entryGrid:{flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:10},entryPressable:{flexBasis:"47%",flexGrow:1,minWidth:138},tileTop:{alignItems:"flex-start",flexDirection:"row",justifyContent:"space-between"},inspect:{color:colors.gold,fontSize:8,fontWeight:"900",letterSpacing:.6}, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.8, marginTop: 7 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 3 }, intro: { color: colors.muted, lineHeight: 20, marginTop: 7, marginBottom: 13 }, progress: { marginBottom: 13, borderColor: colors.gold }, progressTop: { flexDirection: "row", alignItems: "baseline", gap: 9 }, progressValue: { color: colors.gold, fontSize: 25, fontWeight: "900" }, progressLabel: { color: colors.text, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, track: { height: 8, backgroundColor: colors.panel2, borderRadius: 5, overflow: "hidden", marginTop: 9 }, fill: { height: "100%", backgroundColor: colors.gold }, entry: { minHeight: 142, padding: 10 }, selected: { borderColor: colors.gold, borderWidth: 2 }, unknown: { opacity: .62, borderStyle: "dashed" }, entryHead: { flexDirection: "row", alignItems: "center", gap: 11 }, flex: { flex: 1 }, enemyName: { color: colors.text, fontSize: 17, fontWeight: "900" }, hiddenName: { color: colors.muted }, meta: { color: colors.muted, fontSize: 11, textTransform: "capitalize", marginTop: 3 }, chevron: { color: colors.gold, fontSize: 23 }, details: { borderTopWidth: 1, borderColor: colors.border, marginTop: 12, paddingTop: 12 }, detailHero: { flexDirection: "row", gap: 12, alignItems: "center" }, detailLore: { flex: 1 }, lore: { color: colors.text, lineHeight: 20, fontStyle: "italic" }, section: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.3, marginTop: 15, marginBottom: 6 }, note: { color: colors.muted, fontSize: 10, marginBottom: 7 }, stats: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, stat: { width: "31%", backgroundColor: colors.panel2, borderRadius: 7, padding: 7 }, statLabel: { color: colors.muted, fontSize: 8, fontWeight: "900" }, statValue: { color: colors.text, fontWeight: "900", marginTop: 2 }, positive: { color: colors.danger }, negative: { color: colors.green }, skill: { backgroundColor: colors.panel2, padding: 9, borderRadius: 8, marginBottom: 6 }, skillHead: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, skillName: { color: colors.text, fontWeight: "900" }, skillType: { color: colors.gold, fontSize: 9, fontWeight: "900" }, skillLine: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }, line: { color: colors.text, fontSize: 12, lineHeight: 18, textTransform: "capitalize" }, pressed:{opacity:.76,transform:[{translateY:1}]} });
