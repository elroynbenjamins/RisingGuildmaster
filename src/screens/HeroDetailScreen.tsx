import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CLASSES } from "../data/classes/classes";
import { CONDITIONS } from "../data/conditions/conditions";
import { EQUIPMENT } from "../data/equipment/equipment";
import { RACES } from "../data/races/races";
import { TRAITS } from "../data/traits/traits";
import { ActionButton, BackButton, Panel, Portrait, SectionTitle, colors } from "../components/ui";
import { ATTRIBUTE_KEYS } from "../game/attributes/types";
import { calculateHero } from "../game/heroes/heroCalculator";
import type { Hero } from "../game/heroes/types";
import { SUBCLASSES } from "../data/subclasses/subclasses";
import { HERO_SKILLS } from "../data/skills/heroSkills";

const LABELS: Record<string, string> = { strength: "STR", dexterity: "DEX", constitution: "CON", intelligence: "INT", wisdom: "WIS", charisma: "CHA", maxHP: "HP", physicalAttack: "Physical Attack", physicalDefense: "Physical Defense", magicPower: "Magic Power", magicDefense: "Magic Defense", speed: "Speed", criticalChance: "Critical Chance" };
export function HeroDetailScreen({ hero, onBack, candidate = false, recruit, openSubclass }: { hero: Hero; onBack(): void; candidate?: boolean; recruit?(): string | null; openSubclass?(): void }) {
  const calculated = calculateHero(hero);
  const [message, setMessage] = useState<string | null>(null);
  const equipment = Object.entries(hero.equipment);
  const handleRecruit = () => { const error = recruit?.(); if (error) setMessage(error); else onBack(); };
  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} />
    <View style={styles.identity}><Portrait hero={hero} size={112} /><Text style={styles.name}>{hero.name}</Text><Text style={styles.meta}>{RACES[hero.raceId].name} • {CLASSES[hero.classId].name}</Text><Text style={styles.secondary}>Level {hero.level} · Age {hero.age} · {hero.background}</Text></View>
    {candidate && <Panel style={styles.contract}><View><Text style={styles.contractLabel}>CONTRACT</Text><Text style={styles.contractValue}>{hero.recruitmentCost} gold · {hero.salary}/day</Text></View><ActionButton label="Recruit" onPress={handleRecruit} />{message && <Text style={styles.error}>{message}</Text>}</Panel>}
    <SectionTitle>ATTRIBUTES</SectionTitle><Panel style={styles.grid}>{ATTRIBUTE_KEYS.map((key) => <View key={key} style={styles.stat}><Text style={styles.statLabel}>{LABELS[key]}</Text><Text style={styles.statValue}>{Math.round(calculated.attributes[key])}</Text>{calculated.attributes[key] !== hero.baseAttributes[key] && <Text style={styles.base}>base {hero.baseAttributes[key]}</Text>}</View>)}</Panel>
    <SectionTitle>DERIVED STATS</SectionTitle><Panel>{Object.entries(calculated.stats).map(([key, value]) => <View key={key} style={styles.row}><Text style={styles.rowLabel}>{LABELS[key]}</Text><Text style={styles.rowValue}>{key === "criticalChance" ? `${(value * 100).toFixed(1)}%` : Math.round(value)}</Text></View>)}</Panel>
    <SectionTitle>POTENTIAL</SectionTitle><Panel><Text style={styles.rowValue}>{hero.potentialEstimateMin}–{hero.potentialEstimateMax}</Text><Text style={styles.hint}>Estimated range. The hero's true potential remains hidden.</Text></Panel>
    <SectionTitle>SUBCLASS</SectionTitle><Panel>{hero.subclassId ? <><Text style={styles.entryName}>{CLASSES[hero.classId].name} → {SUBCLASSES[hero.subclassId]?.name}</Text><Text style={styles.hint}>{SUBCLASSES[hero.subclassId]?.description}</Text>{SUBCLASSES[hero.subclassId]?.addedSkillIds.map((id) => <Text key={id} style={styles.hint}>Skill: {HERO_SKILLS[id]?.name}</Text>)}</> : <><Text style={styles.entryName}>{hero.level >= 10 ? "SUBCLASS AVAILABLE" : "Unlocks at Level 10"}</Text>{openSubclass && <View style={{ marginTop: 10 }}><ActionButton label={hero.level >= 10 ? "Choose Subclass" : "View Subclasses"} onPress={openSubclass} /></View>}</>}</Panel>
    <SectionTitle>TRAITS</SectionTitle><Panel>{hero.traitIds.map((id) => <View key={id} style={styles.entry}><Text style={styles.entryName}>{TRAITS[id].name}</Text><Text style={styles.hint}>{TRAITS[id].description}</Text></View>)}</Panel>
    <SectionTitle>CONDITIONS</SectionTitle><Panel>{hero.conditions.length ? hero.conditions.map((item) => <Text key={item.conditionId} style={styles.entryName}>{CONDITIONS[item.conditionId].name} · {item.remainingDuration} days</Text>) : <Text style={styles.hint}>No active conditions</Text>}</Panel>
    <SectionTitle>EQUIPMENT</SectionTitle><Panel>{equipment.map(([slot, id]) => <View key={slot} style={styles.row}><Text style={styles.rowLabel}>{slot.replace(/([0-9])/, " $1")}</Text><Text style={styles.rowValue}>{id ? EQUIPMENT[id]?.name : "Empty"}</Text></View>)}</Panel>
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 60 }, identity: { alignItems: "center", marginVertical: 15 }, name: { color: colors.text, fontSize: 32, fontWeight: "900", marginTop: 12 }, meta: { color: colors.gold, fontSize: 17, fontWeight: "700", marginTop: 4 }, secondary: { color: colors.muted, marginTop: 5 }, contract: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }, contractLabel: { color: colors.muted, fontSize: 11, fontWeight: "800" }, contractValue: { color: colors.text, fontWeight: "800", marginTop: 3 }, error: { color: colors.danger, width: "100%", marginTop: 9 }, grid: { flexDirection: "row", flexWrap: "wrap", paddingVertical: 7 }, stat: { width: "33.33%", alignItems: "center", paddingVertical: 10 }, statLabel: { color: colors.muted, fontSize: 11, fontWeight: "800" }, statValue: { color: colors.text, fontSize: 25, fontWeight: "900" }, base: { color: colors.green, fontSize: 10 }, row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }, rowLabel: { color: colors.muted, textTransform: "capitalize" }, rowValue: { color: colors.text, fontWeight: "800" }, hint: { color: colors.muted, lineHeight: 20, marginTop: 3 }, entry: { marginBottom: 12 }, entryName: { color: colors.text, fontWeight: "800" } });
