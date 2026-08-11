import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, EmptyState, Panel, SegmentedTabs, colors } from "../components/ui";
import { QUEST_ENCOUNTERS } from "../data/encounters/questEncounters";
import { getEnemyDefinition } from "../data/enemies";
import { QUESTS } from "../data/quests/quests";
import { REGIONS } from "../data/world/regions";
import { useGuild } from "../state/GuildContext";
import { filterQuests, type QuestTab } from "../ui/questList";
import { isQuestAvailable } from "../game/quests/questAvailability";
const TABS: QuestTab[] = ["Contracts", "Side Quests", "Campaign", "Bosses"];

export function QuestSelectionScreen({ onBack, selectQuest, openCampaign, openDungeons, initialTab = "Contracts" }: { onBack?: () => void; selectQuest(id: string): void; openCampaign?(): void; openDungeons?(): void; initialTab?: QuestTab }) {
  const { guild } = useGuild(); const [tab, setTab] = useState<QuestTab>(initialTab);
  const quests = filterQuests(Object.values(QUESTS), tab, guild.world.completedQuestIds).filter((quest) => !quest.hiddenFromQuestBoard && guild.world.unlockedRegionIds.includes(quest.regionId) && isQuestAvailable(quest, guild.world));
  return <ScrollView contentContainerStyle={styles.content}>{onBack && <BackButton onPress={onBack}/>}<Text style={styles.title}>Quests</Text><Text style={styles.intro}>Contracts remain repeatable while campaign and boss quests advance Eldoria's story.</Text>
    {openDungeons && <View style={styles.expedition}><Text style={styles.expeditionTitle}>WARDSTONE EXPEDITIONS</Text><Text style={styles.expeditionText}>Branching rooms · carried injuries · elite and boss recipe drops</Text><ActionButton label={guild.activeDungeonRun ? "Resume Dungeon Run" : "Enter Roguelite Dungeon"} onPress={openDungeons}/></View>}
    <SegmentedTabs values={TABS} value={tab} onChange={setTab}/>{tab === "Campaign" && openCampaign && <View style={styles.campaign}><ActionButton label="Open Campaign Timeline" onPress={openCampaign}/></View>}
    {quests.map((quest) => { const factions = [...new Set(quest.encounterIds.flatMap((id) => QUEST_ENCOUNTERS[id]?.enemies ?? []).map((entry) => getEnemyDefinition(entry.enemyDefinitionId).factionId))]; const region = REGIONS[quest.regionId]; return <Panel key={quest.id} style={styles.card}><View style={styles.row}><View style={styles.flex}><Text style={styles.name}>{quest.name}</Text><Text style={styles.difficulty}>{quest.questType.toUpperCase()} · Difficulty {quest.difficulty}</Text></View><ActionButton label="Details" onPress={() => selectQuest(quest.id)}/></View><Text style={styles.detail}>{region?.name} · Recommended Lv {quest.recommendedLevelMin ?? region?.recommendedLevelMin}–{quest.recommendedLevelMax ?? region?.recommendedLevelMax}</Text><Text style={styles.detail}>Party {quest.minPartySize}–{quest.maxPartySize} · {quest.encounterIds.length} encounter{quest.encounterIds.length === 1 ? "" : "s"}</Text><Text style={styles.detail}>Factions: {factions.join(", ") || "Unknown"}</Text><Text style={styles.reward}>{quest.goldRewardMin}–{quest.goldRewardMax} gold · {quest.xpRewardPerHero} XP/hero</Text></Panel>; })}
    {!quests.length && <EmptyState title={`No ${tab.toLowerCase()} available`} message="Progress the campaign, unlock more regions, or check another quest category."/>}
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 40 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 8 }, intro: { color: colors.muted, lineHeight: 20, marginVertical: 9 }, expedition: { backgroundColor: "#241f2d", borderColor: "#8b6cab", borderWidth: 1, borderRadius: 14, padding: 14, gap: 7, marginBottom: 14 }, expeditionTitle: { color: "#c6a7e5", fontWeight: "900", letterSpacing: 1.2 }, expeditionText: { color: colors.muted, fontSize: 12, marginBottom: 3 }, campaign: { marginBottom: 12 }, card: { marginBottom: 11 }, row: { flexDirection: "row", alignItems: "center", gap: 10 }, flex: { flex: 1 }, name: { color: colors.text, fontSize: 19, fontWeight: "900" }, difficulty: { color: colors.gold, fontSize: 12, marginTop: 3 }, detail: { color: colors.muted, marginTop: 7 }, reward: { color: colors.green, fontWeight: "700", marginTop: 8 } });
