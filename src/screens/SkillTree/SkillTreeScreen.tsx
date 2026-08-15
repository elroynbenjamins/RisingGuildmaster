import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { SkillInfoPanel } from "../../components/skills/SkillInfoPanel";
import { ActionButton, BackButton, Panel, SectionTitle, colors } from "../../components/ui";
import { CLASSES } from "../../data/classes/classes";
import { CLASS_SKILL_TREES } from "../../data/skills/classSkillTrees";
import { HERO_SKILLS } from "../../data/skills/heroSkills";
import type { Hero } from "../../game/heroes/types";
import { getAvailableClassSkillPoints, getHeroSkillTree, learnClassSkill } from "../../game/progression/skills/skillProgressionService";
import { getRaceNameColor } from "../../ui/raceColors";

const stateLabel = { learned: "✓ LEARNED", available: "AVAILABLE", locked_level: "LEVEL LOCKED", locked_prerequisite: "PATH LOCKED", no_points: "NO SKILL POINT" } as const;

export function SkillTreeScreen({ hero, onBack, onUpdate }: { hero: Hero; onBack(): void; onUpdate(hero: Hero): void }) {
  const { showDialog } = useGameDialog();
  const [selectedId, setSelectedId] = useState<string>(); const [error, setError] = useState<string>();
  const tree = CLASS_SKILL_TREES[hero.classId]; const nodes = getHeroSkillTree(hero); const points = getAvailableClassSkillPoints(hero); const basic = HERO_SKILLS[tree.basicSkillId]!;
  const learn = (skillId: string) => { const skill = HERO_SKILLS[skillId]!; showDialog({ title: `Learn ${skill.name}?`, message: "Class skill choices are permanent for this hero.", eyebrow: "CONFIRM TRAINING", actions: [{ label: "Cancel", tone: "secondary" }, { label: "Learn Skill", tone: "primary", onPress: () => { try { setError(undefined); onUpdate(learnClassSkill(hero, skillId)); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not learn skill"); } } }] }); };
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.title}>{CLASSES[hero.classId].name} Skills</Text>
    <Text style={[styles.subtitle, { color: getRaceNameColor(hero.raceId) }]}>{hero.name} · Level {hero.level}</Text>
    <Panel style={styles.points}><Text style={styles.pointsValue}>{points}</Text><View style={styles.flex}><Text style={styles.pointsTitle}>AVAILABLE SKILL POINT{points === 1 ? "" : "S"}</Text><Text style={styles.help}>Earned at Levels 2, 4, 6, and 8. Choices are permanent.</Text></View></Panel>
    <SectionTitle>LEVEL 1 · CLASS FOUNDATION</SectionTitle>
    <Text style={styles.help}>Every {CLASSES[hero.classId].name} begins with this basic combat action.</Text>
    <SkillInfoPanel skill={basic} />
    <SectionTitle>RECOMMENDED PROGRESSION</SectionTitle>
    <Text style={styles.help}>These paths are guidance, not restrictions. You can combine choices from either route.</Text>
    <View style={styles.pathList}>{tree.recommendedPaths.map((path) => <Panel key={path.id} style={styles.path}>
      <Text style={styles.pathName}>{path.name}</Text>
      <Text style={styles.help}>{path.description}</Text>
      <View style={styles.pathSteps}>{path.skillIds.map((skillId, index) => { const skill = HERO_SKILLS[skillId]!; const node = nodes.find((entry) => entry.skillId === skillId)!; return <React.Fragment key={skillId}>
        {index > 0 && <Text style={styles.pathArrow}>›</Text>}
        <View style={[styles.pathStep, node.state === "learned" && styles.pathStepLearned, node.state === "available" && styles.pathStepAvailable]}><Text style={styles.pathLevel}>LV {node.requiredLevel}</Text><Text numberOfLines={2} style={styles.pathSkill}>{skill.name}</Text></View>
      </React.Fragment>; })}</View>
    </Panel>)}</View>
    {[1, 2, 3, 4].map((tier) => <View key={tier}>
      <SectionTitle>{["LEVEL 2 · FIRST TECHNIQUE", "LEVEL 4 · SPECIALIZATION", "LEVEL 6 · VETERAN TECHNIQUE", "LEVEL 8 · CLASS MASTERY"][tier - 1]}</SectionTitle>
      {nodes.filter((node) => node.tier === tier).map((node) => { const skill = HERO_SKILLS[node.skillId]!; const selected = selectedId === node.skillId; return <Panel key={node.skillId} style={[styles.node, node.state === "learned" && styles.learned, node.state === "available" && styles.available]}>
        <Pressable accessibilityRole="button" onPress={() => setSelectedId(selected ? undefined : node.skillId)}><View style={styles.row}><View style={styles.flex}><Text style={styles.skillName}>{skill.name}</Text><Text style={styles.requirement}>Requires Level {node.requiredLevel}</Text></View><Text style={[styles.state, node.state === "available" && styles.availableText]}>{stateLabel[node.state]}</Text></View><Text style={styles.inspect}>{selected ? "Hide details" : "Tap for details"}</Text></Pressable>
        {selected && <><SkillInfoPanel skill={skill} />{node.state === "available" && <View style={styles.learnAction}><ActionButton label={`Learn ${skill.name}`} onPress={() => learn(node.skillId)} /></View>}{node.state === "locked_level" && <Text style={styles.lockReason}>Reach Level {node.requiredLevel} to unlock this choice.</Text>}{node.state === "no_points" && <Text style={styles.lockReason}>Earn another class skill point at the next milestone.</Text>}</>}
      </Panel>; })}
    </View>)}
    {error && <Text style={styles.error}>{error}</Text>}
    <Text style={styles.footer}>Subclass abilities are granted separately when a subclass is chosen at Level 10.</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 55 }, title: { color: colors.text, fontSize: 29, fontWeight: "900", marginTop: 9 }, subtitle: { color: colors.gold, marginTop: 4, marginBottom: 13 }, points: { flexDirection: "row", alignItems: "center", gap: 13 }, pointsValue: { color: colors.gold, fontSize: 35, fontWeight: "900" }, pointsTitle: { color: colors.text, fontWeight: "900" }, help: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 }, flex: { flex: 1 }, node: { marginBottom: 9 }, learned: { borderColor: colors.green }, available: { borderColor: colors.gold, borderWidth: 2 }, row: { flexDirection: "row", alignItems: "center", gap: 8 }, skillName: { color: colors.text, fontSize: 17, fontWeight: "900" }, requirement: { color: colors.muted, fontSize: 11, marginTop: 2 }, state: { color: colors.muted, fontSize: 9, fontWeight: "900" }, availableText: { color: colors.gold }, inspect: { color: colors.gold, fontSize: 11, marginTop: 7 }, learnAction: { marginTop: 10 }, lockReason: { color: colors.muted, fontSize: 12, marginTop: 8 }, error: { color: colors.danger, marginTop: 10 }, footer: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 15 }, pathList: { gap: 9, marginTop: 9 }, path: { marginBottom: 0 }, pathName: { color: colors.gold, fontSize: 16, fontWeight: "900" }, pathSteps: { alignItems: "center", flexDirection: "row", marginTop: 12 }, pathArrow: { color: colors.muted, fontSize: 18, marginHorizontal: 3 }, pathStep: { alignItems: "center", backgroundColor: "#151c28", borderColor: colors.border, borderRadius: 7, borderWidth: 1, flex: 1, minHeight: 56, paddingHorizontal: 4, paddingVertical: 6 }, pathStepLearned: { borderColor: colors.green, backgroundColor: "#13251d" }, pathStepAvailable: { borderColor: colors.gold }, pathLevel: { color: colors.muted, fontSize: 8, fontWeight: "900" }, pathSkill: { color: colors.text, fontSize: 9, fontWeight: "800", marginTop: 3, textAlign: "center" } });
