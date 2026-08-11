import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton, Panel, SectionTitle, SegmentedTabs, colors } from "../../components/ui";
import { CLASS_CODEX, RACE_CODEX } from "../../data/codex/heroCodex";
import { CLASSES } from "../../data/classes/classes";
import { RACES } from "../../data/races/races";
import { HERO_SKILLS } from "../../data/skills/heroSkills";
import type { AttributeKey } from "../../game/attributes/types";
import { getSkillDescriptionLines } from "../../game/combat/skillDescription";
import type { Modifier } from "../../game/modifiers/types";
import { getRaceNameColor } from "../../ui/raceColors";
import { GameIcon } from "../../components/icons/GameIcon";

type CodexTab = "Races" | "Classes";
const ATTRIBUTE_LABELS: Record<AttributeKey, string> = { strength: "STR", dexterity: "DEX", constitution: "CON", intelligence: "INT", wisdom: "WIS", charisma: "CHA" };
const words = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
const signed = (value: number) => `${value >= 0 ? "+" : ""}${value}`;
const percentage = (value: number) => `${value >= 0 ? "+" : ""}${Math.round(value * 100)}%`;

function modifierText(modifier: Modifier): string {
  const value = modifier.operation === "percentage" ? percentage(modifier.value) : signed(modifier.value);
  const condition = modifier.condition?.type === "hpRatioAtMost" ? ` while HP is at or below ${Math.round(modifier.condition.value * 100)}%` : "";
  return `${words(modifier.target)} ${value}${condition}`;
}

function tacticalRows(values: Record<string, number>, percentageKeys: string[]) {
  return Object.entries(values).filter(([, value]) => value !== 0).map(([key, value]) => `${words(key.replace(/Modifier$/, ""))} ${percentageKeys.includes(key) ? percentage(value) : signed(value)}`);
}

function Label({ children }: React.PropsWithChildren) { return <Text style={styles.label}>{children}</Text>; }
function Header({ badge, title, subtitle, color, expanded }: { badge: string; title: string; subtitle: string; color?: string; expanded: boolean }) {
  return <View style={styles.header}><GameIcon id={badge.length > 1 ? "skill_codex" : "hero_codex"} size={48} /><View style={styles.headerText}><Text style={[styles.entryTitle, color ? { color } : undefined]}>{title}</Text><Text style={styles.meta}>{subtitle}</Text></View><Text style={styles.chevron}>{expanded ? "−" : "+"}</Text></View>;
}

function RaceEntry({ raceId }: { raceId: keyof typeof RACES }) {
  const [expanded, setExpanded] = useState(false); const race = RACES[raceId]; const lore = RACE_CODEX[raceId]; const color = getRaceNameColor(raceId);
  const tactical = tacticalRows(race.tactical, ["meleeDamageModifier"]);
  return <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)}><Panel style={styles.entry}><Header badge={race.name.charAt(0)} title={race.name} subtitle={lore.epithet} color={color} expanded={expanded} />{expanded ? <View style={styles.details}><Text style={styles.body}>{lore.overview}</Text><Label>HOMELAND</Label><Text style={styles.body}>{lore.homeland}</Text><Label>ADVENTURING STYLE</Label><Text style={styles.body}>{lore.playstyle}</Text><Label>RACIAL MODIFIERS</Label><View style={styles.chips}>{race.modifiers.map((modifier, index) => <Text key={`${modifier.target}-${index}`} style={styles.chip}>{modifierText(modifier)}</Text>)}</View>{tactical.length ? <><Label>TACTICAL PROFILE</Label><View style={styles.chips}>{tactical.map((line) => <Text key={line} style={styles.chip}>{line}</Text>)}</View></> : null}</View> : null}</Panel></Pressable>;
}

function ClassEntry({ classId }: { classId: keyof typeof CLASSES }) {
  const [expanded, setExpanded] = useState(false); const heroClass = CLASSES[classId]; const lore = CLASS_CODEX[classId];
  const tactical = tacticalRows(heroClass.tactical, ["physicalDamageModifier", "magicDamageModifier", "healingPowerModifier"]);
  const growth = Object.entries(heroClass.attributeGrowthWeights) as [AttributeKey, number][];
  return <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)}><Panel style={styles.entry}><Header badge={heroClass.name.charAt(0)} title={heroClass.name} subtitle={lore.role} expanded={expanded} />{expanded ? <View style={styles.details}><Text style={styles.body}>{lore.overview}</Text><Label>BATTLEFIELD STYLE</Label><Text style={styles.body}>{lore.playstyle}</Text><Label>ATTRIBUTE GROWTH</Label><View style={styles.growthRow}>{growth.map(([attribute, value]) => <View key={attribute} style={styles.growthCell}><Text style={styles.growthLabel}>{ATTRIBUTE_LABELS[attribute]}</Text><Text style={styles.growthValue}>{value.toFixed(1)}x</Text></View>)}</View>{tactical.length ? <><Label>CLASS BONUSES</Label><View style={styles.chips}>{tactical.map((line) => <Text key={line} style={styles.chip}>{line}</Text>)}</View></> : null}<Label>SKILL PATH</Label>{heroClass.skillIds.map((skillId, index) => { const skill = HERO_SKILLS[skillId]; return skill ? <View key={skillId} style={styles.skill}><View style={styles.skillHeading}><Text style={styles.skillName}>{skill.name}</Text><Text style={styles.skillType}>{index === 0 ? "STARTING" : skill.type.replace(/_/g, " ").toUpperCase()}</Text></View>{getSkillDescriptionLines(skill).map((line) => <Text key={line} style={styles.skillLine}>{line}</Text>)}</View> : null; })}</View> : null}</Panel></Pressable>;
}

export function HeroCodexScreen({ onBack }: { onBack(): void }) {
  const [tab, setTab] = useState<CodexTab>("Races");
  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.eyebrow}>GUILD ARCHIVES</Text><Text style={styles.title}>Heroes' Codex</Text><Text style={styles.intro}>A field guide to Eldoria's playable peoples and the six disciplines taught by the guild. Tap an entry to study its lore and mechanics.</Text><SegmentedTabs values={["Races", "Classes"] as const} value={tab} onChange={setTab} /><SectionTitle>{tab === "Races" ? "PEOPLES OF ELDORIA" : "ADVENTURING CLASSES"}</SectionTitle>{tab === "Races" ? (Object.keys(RACES) as (keyof typeof RACES)[]).map((id) => <RaceEntry key={id} raceId={id} />) : (Object.keys(CLASSES) as (keyof typeof CLASSES)[]).map((id) => <ClassEntry key={id} classId={id} />)}</ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 40 }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 2, marginTop: 16 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 3 }, intro: { color: colors.muted, lineHeight: 20, marginBottom: 16, marginTop: 8 }, entry: { marginBottom: 10 }, header: { alignItems: "center", flexDirection: "row" }, badge: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderRadius: 24, borderWidth: 2, height: 48, justifyContent: "center", width: 48 }, badgeText: { color: colors.gold, fontSize: 21, fontWeight: "900" }, headerText: { flex: 1, marginLeft: 12 }, entryTitle: { color: colors.text, fontSize: 19, fontWeight: "900" }, meta: { color: colors.muted, fontSize: 12, marginTop: 2 }, chevron: { color: colors.gold, fontSize: 24, fontWeight: "700" }, details: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 14, paddingTop: 13 }, body: { color: colors.text, fontSize: 14, lineHeight: 20 }, label: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginBottom: 7, marginTop: 15 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, chip: { backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 7, borderWidth: 1, color: colors.text, fontSize: 12, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 6 }, growthRow: { flexDirection: "row", gap: 5 }, growthCell: { alignItems: "center", backgroundColor: colors.panel2, borderRadius: 7, flex: 1, paddingVertical: 7 }, growthLabel: { color: colors.muted, fontSize: 9, fontWeight: "900" }, growthValue: { color: colors.text, fontSize: 12, fontWeight: "800", marginTop: 2 }, skill: { backgroundColor: colors.panel2, borderRadius: 9, marginBottom: 8, padding: 11 }, skillHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, skillName: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "800" }, skillType: { color: colors.gold, fontSize: 9, fontWeight: "900" }, skillLine: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 } });
