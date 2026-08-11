import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, Panel, SectionTitle, colors } from "../../components/ui";
import { MaterialIcon } from "../../components/materials/MaterialIcon";
import { CAMPAIGN_CHOICES } from "../../data/campaign/campaignChoices";
import { MATERIALS } from "../../data/crafting/materials";
import { resolveEquipmentDefinition } from "../../game/equipment/equipmentResolver";
import type { MaterialId } from "../../game/crafting/craftingTypes";
import { QUEST_OUTCOME_NARRATIVES, CAMPAIGN_CHOICE_OUTCOMES } from "../../data/quests/questOutcomeNarratives";
import { QUESTS } from "../../data/quests/quests";
import type { RaceId } from "../../game/heroes/types";
import { getRaceNameColor } from "../../ui/raceColors";
import { GameIcon } from "../../components/icons/GameIcon";

export interface QuestHeroOutcome {
  heroId: string;
  name: string;
  raceId: RaceId;
  levelBefore: number;
  levelAfter: number;
  currentHP: number;
  maxHP: number;
  conditionIds: string[];
  availableSkillPoints: number;
}

export interface QuestResultSummary {
  questId: string;
  status: "victory" | "defeat";
  goldEarned: number;
  xpEarnedPerHero: number;
  lootIds: string[];
  materials?: Partial<Record<MaterialId, number>>;
  heroOutcomes: QuestHeroOutcome[];
  campaignNodeId?: string;
  selectedChoiceId?: string;
}

export function QuestResultScreen({ summary, choiceIds = [], onChoice, onContinue }: { summary: QuestResultSummary; choiceIds?: string[]; onChoice?(choiceId: string): void; onContinue(): void }) {
  const quest = QUESTS[summary.questId]!; const victory = summary.status === "victory"; const narrative = QUEST_OUTCOME_NARRATIVES[summary.questId]; const pendingChoice = victory && choiceIds.length > 0 && !summary.selectedChoiceId;
  return <ScrollView contentContainerStyle={styles.content}>
    <View style={[styles.banner, victory ? styles.victoryBanner : styles.defeatBanner]}>
      <GameIcon id={victory ? "victory" : "defeat"} size={58} /><Text style={styles.result}>{victory ? "QUEST VICTORY" : "PARTY DEFEATED"}</Text><Text style={styles.quest}>{quest.name}</Text>
    </View>
    <Panel style={styles.story}><Text style={styles.storyLabel}>AFTERMATH</Text><Text style={styles.storyText}>{victory ? narrative?.victory ?? "The contract is complete and the guild returns with its reward." : narrative?.defeat ?? "The surviving heroes withdraw to Guildhaven to recover."}</Text></Panel>
    {summary.selectedChoiceId && <Panel style={styles.choiceOutcome}><Text style={styles.storyLabel}>YOUR DECISION</Text><Text style={styles.storyText}>{CAMPAIGN_CHOICE_OUTCOMES[summary.selectedChoiceId]}</Text></Panel>}
    <SectionTitle>{victory ? "REWARDS" : "LOSSES & RECOVERY"}</SectionTitle>
    <View style={styles.rewards}>
      <Panel style={styles.reward}><GameIcon id="gold" size={32} framed={false} /><Text style={styles.rewardValue}>{summary.goldEarned}</Text><Text style={styles.rewardLabel}>GOLD</Text></Panel>
      <Panel style={styles.reward}><GameIcon id="xp" size={32} framed={false} /><Text style={styles.rewardValue}>{summary.xpEarnedPerHero}</Text><Text style={styles.rewardLabel}>XP / HERO</Text></Panel>
      <Panel style={styles.reward}><GameIcon id="loot" size={32} framed={false} /><Text numberOfLines={1} style={styles.rewardValue}>{summary.lootIds.length}</Text><Text style={styles.rewardLabel}>LOOT</Text></Panel>
    </View>
    {summary.lootIds.length > 0 && <Panel style={styles.loot}><Text style={styles.storyLabel}>RECOVERED EQUIPMENT</Text>{summary.lootIds.map((id, index) => <View key={`${id}-${index}`} style={styles.materialReward}><GameIcon id="loot" size={34} framed={false} /><Text style={styles.lootName}>{resolveEquipmentDefinition(id)?.name ?? id.replace(/_/g, " ")}</Text></View>)}</Panel>}
    {Object.keys(summary.materials ?? {}).length > 0 && <Panel style={styles.loot}><Text style={styles.storyLabel}>RECOVERED CRAFTING MATERIALS</Text>{(Object.entries(summary.materials ?? {}) as [MaterialId, number][]).map(([id, amount]) => <View key={id} style={styles.materialReward}><MaterialIcon materialId={id} size={38} /><Text style={styles.lootName}>{MATERIALS[id].name} × {amount}</Text></View>)}</Panel>}
    <SectionTitle>PARTY OUTCOME</SectionTitle>
    {summary.heroOutcomes.map((hero) => { const levelled = hero.levelAfter > hero.levelBefore; return <Panel key={hero.heroId} style={styles.hero}><View style={styles.heroRow}><View style={styles.flex}><Text style={[styles.heroName,{color:getRaceNameColor(hero.raceId)}]}>{hero.name}</Text><Text style={styles.heroMeta}>HP {Math.round(hero.currentHP)} / {Math.round(hero.maxHP)}</Text></View><Text style={[styles.level, levelled && styles.levelUp]}>Lv {hero.levelBefore}{levelled ? ` → ${hero.levelAfter}` : ""}</Text></View>{levelled && <Text style={styles.good}>★ LEVEL UP</Text>}{hero.availableSkillPoints > 0 && <Text style={styles.skillPoint}>★ {hero.availableSkillPoints} class skill point{hero.availableSkillPoints === 1 ? "" : "s"} available</Text>}{hero.conditionIds.length > 0 && <Text style={styles.injury}>⚠ {hero.conditionIds.join(", ")}</Text>}</Panel>; })}
    {narrative?.journalUpdate && victory && <Panel style={styles.journal}><Text style={styles.storyLabel}>JOURNAL UPDATED</Text><Text style={styles.storyText}>{narrative.journalUpdate}</Text></Panel>}
    {pendingChoice && <><SectionTitle>THE CHIEFTAIN'S FATE</SectionTitle><Text style={styles.decisionIntro}>This decision will be remembered and may change future quests, dialogue, and faction relations.</Text>{choiceIds.map((choiceId) => <Pressable key={choiceId} onPress={() => onChoice?.(choiceId)} style={styles.choice}><Text style={styles.choiceText}>{CAMPAIGN_CHOICES[choiceId]?.text ?? choiceId}</Text><Text style={styles.choiceArrow}>›</Text></Pressable>)}</>}
    {!pendingChoice && <View style={styles.continue}><ActionButton label={summary.campaignNodeId ? "Continue Campaign" : "Return to Guild"} onPress={onContinue} /></View>}
  </ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 55 }, banner: { alignItems: "center", borderRadius: 16, borderWidth: 2, paddingVertical: 23, paddingHorizontal: 15, marginTop: 8, marginBottom: 13 }, victoryBanner: { backgroundColor: "#263c2f", borderColor: colors.gold }, defeatBanner: { backgroundColor: "#42282b", borderColor: colors.danger }, emblem: { color: colors.gold, fontSize: 35 }, result: { color: colors.text, fontSize: 24, fontWeight: "900", letterSpacing: 2, marginTop: 4 }, quest: { color: colors.gold, fontSize: 16, fontWeight: "800", marginTop: 5 }, story: { borderColor: colors.gold }, choiceOutcome: { borderColor: colors.green, marginTop: 10 }, storyLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 }, storyText: { color: colors.text, lineHeight: 21, marginTop: 7 }, rewards: { flexDirection: "row", gap: 7 }, reward: { flex: 1, alignItems: "center", paddingHorizontal: 5, paddingVertical: 12 }, rewardIcon: { color: colors.gold, fontSize: 18 }, rewardValue: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 3 }, rewardLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", marginTop: 2 }, loot: { marginTop: 10 }, lootName: { color: colors.text, fontWeight: "800", marginTop: 8 }, materialReward: { alignItems: "center", flexDirection: "row", gap: 9, marginTop: 8 }, hero: { marginBottom: 8, paddingVertical: 11 }, heroRow: { flexDirection: "row", alignItems: "center", gap: 8 }, flex: { flex: 1 }, heroName: { color: colors.text, fontWeight: "900" }, heroMeta: { color: colors.muted, fontSize: 11, marginTop: 3 }, level: { color: colors.text, fontWeight: "900" }, levelUp: { color: colors.gold }, good: { color: colors.green, fontSize: 11, fontWeight: "900", marginTop: 7 }, skillPoint: { color: colors.gold, fontSize: 11, fontWeight: "800", marginTop: 5 }, injury: { color: colors.danger, fontSize: 11, fontWeight: "800", marginTop: 5, textTransform: "capitalize" }, journal: { marginTop: 10, borderColor: "#627b70" }, decisionIntro: { color: colors.muted, lineHeight: 19, marginBottom: 10 }, choice: { backgroundColor: colors.panel, borderColor: colors.gold, borderWidth: 1, borderRadius: 12, padding: 15, marginBottom: 9, flexDirection: "row", alignItems: "center" }, choiceText: { color: colors.text, fontWeight: "900", flex: 1 }, choiceArrow: { color: colors.gold, fontSize: 25 }, continue: { marginTop: 18 } });
