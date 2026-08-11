import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { BackButton, Panel, SectionTitle, colors } from "../../components/ui";
import { SkillInfoPanel } from "../../components/skills/SkillInfoPanel";
import { HERO_SKILLS } from "../../data/skills/heroSkills";
import type { Hero } from "../../game/heroes/types";
import { getSubclassChoices, selectSubclass } from "../../game/progression/subclasses/subclassService";
export function SubclassSelectionScreen({ hero, onBack, onSelect }: { hero: Hero; onBack(): void; onSelect(hero: Hero): void }) {
  const [error, setError] = useState<string>();
  const [selectedSkillId, setSelectedSkillId] = useState<string>();
  const choose = (id: string) => { try { onSelect(selectSubclass(hero, id)); } catch (caught) { setError(caught instanceof Error ? caught.message : "Selection failed"); } };
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.title}>Choose a Subclass</Text>
    <Text style={styles.warning}>This choice is permanent for {hero.name}.</Text>
    <SectionTitle>TWO PATHS</SectionTitle>
    {getSubclassChoices(hero).map((subclass) => <Panel key={subclass.id} style={styles.card}>
      <Text style={styles.name}>{subclass.name}</Text>
      <Text style={styles.description}>{subclass.description}</Text>
      <Text style={styles.label}>MODIFIERS</Text>
      {subclass.modifiers.map((modifier, index) => <Text key={`${modifier.target}-${index}`} style={styles.line}>{modifier.target}: {modifier.value > 0 ? "+" : ""}{modifier.operation === "percentage" ? `${modifier.value * 100}%` : modifier.value}</Text>)}
      <Text style={styles.label}>ADDED SKILLS · TAP FOR DETAILS</Text>
      {subclass.addedSkillIds.map((id) => <React.Fragment key={id}><Pressable onPress={() => setSelectedSkillId((value) => value === id ? undefined : id)}><Text style={styles.skillLink}>{HERO_SKILLS[id]?.name ?? id} ›</Text></Pressable>{selectedSkillId === id && HERO_SKILLS[id] && <SkillInfoPanel skill={HERO_SKILLS[id]} />}</React.Fragment>)}
      <Pressable disabled={hero.level < subclass.levelRequirement || Boolean(hero.subclassId)} onPress={() => choose(subclass.id)} style={[styles.button, (hero.level < subclass.levelRequirement || hero.subclassId) && styles.disabled]}><Text style={styles.buttonText}>{hero.subclassId ? "Already chosen" : hero.level < 10 ? "Unlocks at Level 10" : `Become ${subclass.name}`}</Text></Pressable>
    </Panel>)}
    {error && <Text style={styles.error}>{error}</Text>}
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 50 }, title: { color: colors.text, fontSize: 29, fontWeight: "900", marginTop: 10 }, warning: { color: colors.gold, marginTop: 5 }, card: { marginTop: 12 }, name: { color: colors.text, fontSize: 21, fontWeight: "900" }, description: { color: colors.muted, lineHeight: 20, marginVertical: 8 }, label: { color: colors.gold, fontSize: 10, fontWeight: "900", marginTop: 8 }, line: { color: colors.text, marginTop: 3 }, skillLink: { color: colors.gold, marginTop: 7, fontWeight: "800", paddingVertical: 4 }, button: { backgroundColor: colors.gold, padding: 11, borderRadius: 9, marginTop: 12, alignItems: "center" }, buttonText: { color: "#17130c", fontWeight: "900" }, disabled: { opacity: .4 }, error: { color: colors.danger, marginTop: 10 } });
