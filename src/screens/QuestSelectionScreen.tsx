import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, EmptyState, Panel, SecondaryButton, SegmentedTabs, StatusChip, colors } from "../components/ui";
import { GameIcon } from "../components/icons/GameIcon";
import { QUEST_ENCOUNTERS } from "../data/encounters/questEncounters";
import { getEnemyDefinition } from "../data/enemies";
import { QUESTS } from "../data/quests/quests";
import { REGIONS } from "../data/world/regions";
import { SETTLEMENTS } from "../data/world/settlements";
import { isQuestAvailableAtCurrentLocation, isQuestAvailableForGuild, isQuestBoardCategoryUnlocked } from "../game/quests/questAvailability";
import { useGuild } from "../state/GuildContext";
import { filterQuests, getQuestReadiness, sortQuestsForRoster, type QuestTab } from "../ui/questList";
import { getAvailableCampaignNodes } from "../game/campaign/campaignService";
import { formatGameId } from "../ui/textFormat";
import { hasCompletedQuestOnce } from "../game/quests/questCompletionService";

export const QUEST_SCREEN_TABS: QuestTab[] = ["Campaign", "Side Quests", "Bosses"];
const TABS = QUEST_SCREEN_TABS;

const READINESS_COLORS: Record<string, string> = {
  DANGER: colors.danger,
  CHALLENGING: colors.gold,
  READY: colors.green,
  ROUTINE: colors.blue,
};

function BoardStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.metaCell}><Text style={styles.metaLabel}>{label}</Text><Text numberOfLines={1} style={styles.metaValue}>{value}</Text></View>;
}

function RewardToken({ icon, label }: { icon: "gold" | "xp" | "loot"; label: string }) {
  return <View style={styles.rewardToken}><GameIcon id={icon} size={22} framed={false} /><Text style={styles.rewardTokenText}>{label}</Text></View>;
}

export function QuestSelectionScreen({ onBack, selectQuest, openCampaign, openDungeons, openOperations, openRaids, initialTab = "Campaign" }: { onBack?: () => void; selectQuest(id: string): void; openCampaign?(): void; openDungeons?(): void; openOperations?(): void; openRaids?(): void; initialTab?: QuestTab }) {
  const { guild } = useGuild();
  const [showQuestDetails, setShowQuestDetails] = useState(!guild.uiPreferences.compactQuestCards);
  const [tab, setTab] = useState<QuestTab>(initialTab === "Contracts" ? "Campaign" : initialTab);
  const [showActivities, setShowActivities] = useState(false);
  const categoryType = tab === "Side Quests" ? "side" : tab === "Bosses" ? "boss" : "campaign";
  const highestHeroLevel = Math.max(1, ...guild.heroes.map((hero) => hero.level));
  const fieldHeroes = [...guild.heroes].sort((a, b) => b.level - a.level).slice(0, 4);
  const fieldLevel = fieldHeroes.length ? fieldHeroes.reduce((sum, hero) => sum + hero.level, 0) / fieldHeroes.length : 1;
  const categoryUnlocked = isQuestBoardCategoryUnlocked(categoryType, guild.world, highestHeroLevel);
  const dungeonUnlocked = guild.world.completedCampaignNodeIds.includes("broken_wardstone");
  const nextCampaignNode = getAvailableCampaignNodes(guild.world)[0];
  const currentLocation = guild.world.currentSettlementId
    ? SETTLEMENTS[guild.world.currentSettlementId]?.name ?? formatGameId(guild.world.currentSettlementId)
    : REGIONS[guild.world.currentRegionId]?.name ?? "Unknown Posting";
  const completionFilter = tab === "Side Quests" ? [] : guild.world.completedQuestIds;
  const availableCategoryQuests = categoryUnlocked
    ? filterQuests(Object.values(QUESTS), tab, completionFilter)
      .filter((quest) => !quest.hiddenFromQuestBoard && guild.world.unlockedRegionIds.includes(quest.regionId) && isQuestAvailableForGuild(quest, guild.world, guild.heroes))
    : [];
  const quests = sortQuestsForRoster(availableCategoryQuests.filter((quest) => isQuestAvailableAtCurrentLocation(quest, guild.world)), fieldLevel)
    .sort((a, b) => Number(hasCompletedQuestOnce(guild, a.id)) - Number(hasCompletedQuestOnce(guild, b.id)));
  const remoteQuests = availableCategoryQuests.filter((quest) => !isQuestAvailableAtCurrentLocation(quest, guild.world));
  const remoteSettlements = [...new Set(remoteQuests.flatMap((quest) => quest.settlementIds?.length
    ? quest.settlementIds.map((id) => SETTLEMENTS[id]?.name ?? formatGameId(id))
    : [REGIONS[quest.regionId]?.name ?? formatGameId(quest.regionId)]))];

  return <ScrollView contentContainerStyle={styles.content}>
    {onBack && <BackButton onPress={onBack} />}

    <View style={styles.boardHeader}>

      <Text style={styles.boardEyebrow}>GUILD NOTICE BOARD</Text>
      <View style={styles.boardTitleRow}><Text style={styles.title}>Quest Board</Text><View style={styles.locationPlate}><Text style={styles.locationLabel}>POSTING</Text><Text numberOfLines={1} style={styles.locationValue}>{currentLocation}</Text></View></View>
      <View style={styles.fieldStrip}><Text style={styles.fieldLabel}>FIELD TEAM</Text><Text style={styles.fieldValue}>TOP 4 AVG · LV {fieldLevel.toFixed(1)}</Text><Text style={styles.fieldRoster}>{fieldHeroes.length}/4 HEROES</Text></View>
    </View>

    {(openDungeons || openOperations || openRaids) && <View style={styles.activitiesToggle}><Pressable accessibilityRole="button" accessibilityLabel="Special activities" accessibilityState={{ expanded: showActivities }} aria-expanded={showActivities} onPress={() => setShowActivities(value => !value)} style={{ minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14 }}>Special activities</Text><Text style={{ color: colors.muted, fontSize: 11 }}>Dungeons · Operations · Raids</Text></View><Text style={{ color: colors.muted }}>{showActivities ? "−" : "+"}</Text></Pressable></View>}
    {showActivities && <View style={styles.specialActivities}>
      {openDungeons && <View style={styles.expedition}><View style={styles.activityHeading}><GameIcon id="quests" size={34} framed={false} /><View style={styles.flex}><Text style={styles.expeditionTitle}>WARDSTONE EXPEDITIONS</Text><Text style={styles.expeditionText}>{dungeonUnlocked ? "Roguelite · choose 1 of 3 themes · temporary Boons & Pacts" : "LOCKED · Complete Chapter 1 and defeat its boss"}</Text></View></View><ActionButton disabled={!dungeonUnlocked} label={guild.activeDungeonRun ? "Resume Expedition" : "Open Roguelite Expeditions"} onPress={openDungeons} /></View>}
      {openOperations && <View style={styles.operation}><View style={styles.activityHeading}><GameIcon id="management" size={34} framed={false} /><View style={styles.flex}><Text style={styles.operationTitle}>CRISIS OPERATIONS · 6 HEROES</Text><Text style={styles.expeditionText}>{dungeonUnlocked ? `Two simultaneous teams · D20 command phases${guild.currentDay < guild.guildOperations.nextAvailableDay ? ` · Ready Day ${guild.guildOperations.nextAvailableDay}` : ""}` : "LOCKED · Establish the guild by completing Chapter 1"}</Text></View></View><ActionButton disabled={!dungeonUnlocked || guild.currentDay < guild.guildOperations.nextAvailableDay} label="Open Crisis Operations" onPress={openOperations} /></View>}
      {openRaids && <View style={styles.raid}><View style={styles.activityHeading}><GameIcon id="boss" size={34} framed={false} /><View style={styles.flex}><Text style={styles.raidTitle}>GUILD RAIDS · 8 HEROES</Text><Text style={styles.expeditionText}>Two squads · largest arenas · bespoke multi-phase objectives · weekly prestige</Text></View></View><ActionButton label="Open Guild Raids" onPress={openRaids} /></View>}
    </View>}

    <SegmentedTabs values={TABS} value={tab} onChange={setTab} />
    <View style={styles.boardControls}><Text style={[styles.boardCount, quests.length ? {color:colors.gold}:undefined]}>{quests.length ? `${quests.length} POSTING${quests.length===1?"":"S"} HERE · BEST MATCH FIRST` : "NO LOCAL POSTINGS"}</Text><SecondaryButton label={showQuestDetails ? "Compact Cards" : "Show Intel"} onPress={() => setShowQuestDetails((value) => !value)} /></View>

    {tab === "Campaign" && openCampaign && <Panel style={styles.campaign}>
      <View style={styles.campaignRail} /><View style={styles.campaignBody}><Text style={styles.campaignStamp}>STORY ORDER · CHAPTER {guild.world.campaignChapter}</Text><Text style={styles.campaignName}>{nextCampaignNode?.title ?? "Campaign Timeline"}</Text><Text style={styles.detail}>{nextCampaignNode?.description ?? "Review completed chapters and the next available story objective."}</Text><View style={styles.campaignAction}><ActionButton label={nextCampaignNode?.questId ? "Prepare Story Mission" : "Open Campaign Timeline"} onPress={openCampaign} /></View></View>
    </Panel>}

    {quests.map((quest, index) => {
      const factions = [...new Set(quest.encounterIds.flatMap((id) => QUEST_ENCOUNTERS[id]?.enemies ?? []).map((entry) => getEnemyDefinition(entry.enemyDefinitionId).factionId))];
      const region = REGIONS[quest.regionId];
      const readiness = getQuestReadiness(quest, fieldLevel);
      const completedBefore = hasCompletedQuestOnce(guild, quest.id);
      const recommendedLevelMin = quest.recommendedLevelMin ?? region?.recommendedLevelMin ?? 1;
      const recommendedLevelMax = quest.recommendedLevelMax ?? region?.recommendedLevelMax ?? recommendedLevelMin;
      const oneClear = quest.questType === "side" && !quest.repeatable;
      const railColor = completedBefore ? colors.green : index === 0 ? colors.gold : READINESS_COLORS[readiness] ?? colors.border;
      const settlementLabel = quest.settlementIds?.map((id) => SETTLEMENTS[id]?.name).filter(Boolean).join(" / ") || region?.name || formatGameId(quest.regionId);
      return <View key={quest.id} style={[styles.questCard, { borderColor: railColor }, completedBefore && styles.completedCard]}>
        <View style={[styles.questRail, { backgroundColor: railColor }]} />
        <View style={styles.questBody}>
          <View style={styles.labelRow}>
            <Text style={styles.questTypeStamp}>{quest.questType === "side" ? "SIDE QUEST" : quest.questType === "boss" ? "BOSS CONTRACT" : "QUEST"}</Text>
            {index === 0 && !completedBefore ? <StatusChip label="BEST MATCH" tone="gold" /> : null}
            {completedBefore ? <StatusChip label={`✓ COMPLETED${quest.repeatable ? " · REPEATABLE" : ""}`} tone="good" /> : null}
            {oneClear && !completedBefore ? <StatusChip label="ONE CLEAR · REWARDS ONCE" tone="gold" /> : null}
          </View>

          <View style={styles.questHeading}><View style={styles.flex}><Text style={styles.name}>{quest.name}</Text><Text style={styles.questLine}>POSTED AT {settlementLabel.toUpperCase()} · {region?.name.toUpperCase() ?? formatGameId(quest.regionId).toUpperCase()}</Text></View><View style={[styles.riskPlate, { borderColor: railColor }]}><Text style={styles.riskLabel}>READINESS</Text><Text style={[styles.riskValue, { color: railColor }]}>{readiness}</Text></View></View>

          <View style={styles.metaGrid}>
            <BoardStat label="LEVEL" value={`${recommendedLevelMin}–${recommendedLevelMax}`} />
            <BoardStat label="PARTY" value={`${quest.minPartySize}–${quest.maxPartySize}`} />
            <BoardStat label="BATTLES" value={`${quest.encounterIds.length}`} />
            <BoardStat label="RISK" value={`TIER ${quest.difficulty}`} />
          </View>

          <View style={styles.rewardRow}>
            <RewardToken icon="gold" label={`${quest.goldRewardMin}–${quest.goldRewardMax}`} />
            <RewardToken icon="xp" label={`${quest.xpRewardPerHero} / HERO`} />
            {oneClear ? <RewardToken icon="loot" label={completedBefore ? "CLAIMED" : "FIRST CLEAR"} /> : null}
          </View>

          {showQuestDetails && <View style={styles.detailBlock}><Text style={styles.detailLabel}>KNOWN INTEL</Text><Text style={styles.detail}>Expected enemy factions: {factions.join(", ") || "Unknown"}</Text><Text style={styles.detail}>{oneClear ? "This Side Quest can only be completed once. Chance-based listed drops are resolved on that one clear." : quest.repeatable ? "This posting is repeatable while it remains available." : "This posting advances authored progression once completed."}</Text></View>}

          <View style={styles.cardAction}><ActionButton label={completedBefore ? (quest.repeatable ? "Prepare Repeat Quest" : "Review Completed Quest") : readiness === "DANGER" ? "Prepare · High Risk" : "Prepare Quest"} onPress={() => selectQuest(quest.id)} /></View>
        </View>
      </View>;
    })}

    {!quests.length && <EmptyState title={categoryUnlocked ? remoteQuests.length ? `${tab} available elsewhere` : tab === "Campaign" && nextCampaignNode && openCampaign ? "No additional local missions" : `No ${tab.toLowerCase()} available` : `${tab} locked`} message={categoryUnlocked ? remoteQuests.length ? `Travel to ${remoteSettlements.join(", ")} to access ${remoteQuests.length} available quest${remoteQuests.length === 1 ? "" : "s"}.` : tab === "Campaign" && nextCampaignNode && openCampaign ? "Your next story objective is shown above. Continue there, or browse side quests and bosses." : "Progress the campaign, unlock more regions, or check another category." : tab === "Side Quests" ? `Reach Level 3 or advance to the Goblin Chieftain to unlock side quests. Highest level: ${highestHeroLevel}.` : "Complete Chapter 1 before optional boss quests appear."} />}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 44 },
  boardHeader: {backgroundColor: "#1d1b17", borderColor: "#76613a", marginBottom: 11, marginTop: 8, padding: 13, position: "relative", borderWidth: 0, borderRadius: 10},
  boardEyebrow: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  boardTitleRow: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between", marginTop: 2 },
  title: { color: colors.text, fontSize: 29, fontWeight: "900" },
  locationPlate: { alignItems: "flex-end", flex: 1, minWidth: 0 },
  locationLabel: { color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: .8 },
  locationValue: { color: colors.text, fontSize: 12, fontWeight: "900", marginTop: 1, maxWidth: 155 },
  fieldStrip: { alignItems: "center", borderTopColor: "#4a4334", borderTopWidth: 1, flexDirection: "row", gap: 8, marginTop: 10, paddingTop: 8 },
  fieldLabel: { color: colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: .7 },
  fieldValue: { color: colors.gold, flex: 1, fontSize: 10, fontWeight: "900" },
  fieldRoster: { color: colors.muted, fontSize: 8, fontWeight: "800" },
  activitiesToggle: { marginBottom: 10 },
  specialActivities: { gap: 8, marginBottom: 12 },
  expedition: {backgroundColor: "#241f2d", borderColor: "#8b6cab", padding: 12, gap: 9, borderWidth: 0, borderRadius: 10},
  operation: {backgroundColor: "#20291f", borderColor: "#718957", padding: 12, gap: 9, borderWidth: 0, borderRadius: 10},
  raid: {backgroundColor: "#2b1d1d", borderColor: "#a65752", padding: 12, gap: 9, borderWidth: 0, borderRadius: 10},
  activityHeading: { alignItems: "center", flexDirection: "row", gap: 9 },
  flex: { flex: 1 },
  expeditionTitle: { color: "#c6a7e5", fontWeight: "900", letterSpacing: 1 },
  operationTitle: { color: "#a9cb82", fontWeight: "900", letterSpacing: 1 },
  raidTitle: { color: "#e99a94", fontWeight: "900", letterSpacing: 1 },
  expeditionText: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  boardControls: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between", marginBottom: 10 },
  boardCount: { color: colors.muted, flex: 1, fontSize: 8, fontWeight: "900", letterSpacing: .8 },
  campaign: { borderColor: colors.gold, flexDirection: "row", marginBottom: 12, overflow: "hidden", padding: 0 },
  campaignRail: { backgroundColor: colors.gold, width: 5 },
  campaignBody: { flex: 1, padding: 13 },
  campaignStamp: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  campaignName: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 3 },
  campaignAction: { marginTop: 10 },
  questCard: {backgroundColor: colors.panel, flexDirection: "row", marginBottom: 10, overflow: "hidden", borderWidth: 0, borderRadius: 10},
  questRail: { width: 5 },
  questBody: { flex: 1, padding: 12 },
  completedCard: { opacity: .88 },
  labelRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 5 },
  questTypeStamp: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  questHeading: { alignItems: "flex-start", flexDirection: "row", gap: 9, marginTop: 4 },
  name: { color: colors.text, fontSize: 19, fontWeight: "900" },
  questLine: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: .35, marginTop: 3 },
  riskPlate: {alignItems: "center", backgroundColor: colors.panel2, minWidth: 72, paddingHorizontal: 6, paddingVertical: 5, borderWidth: 0, borderRadius: 10},
  riskLabel: { color: colors.muted, fontSize: 6, fontWeight: "900", letterSpacing: .5 },
  riskValue: { fontSize: 9, fontWeight: "900", marginTop: 1 },
  metaGrid: { flexDirection: "row", gap: 4, marginTop: 9 },
  metaCell: {alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, flex: 1, minWidth: 0, paddingHorizontal: 3, paddingVertical: 6, borderWidth: 0, borderRadius: 10},
  metaLabel: { color: colors.muted, fontSize: 6, fontWeight: "900", letterSpacing: .5 },
  metaValue: { color: colors.text, fontSize: 10, fontWeight: "900", marginTop: 2 },
  rewardRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 9, paddingTop: 8 },
  rewardToken: { alignItems: "center", flexDirection: "row", gap: 4 },
  rewardTokenText: { color: colors.green, fontSize: 9, fontWeight: "900" },
  detailBlock: {backgroundColor: "#161c1e", borderColor: colors.border, marginTop: 8, padding: 8, borderWidth: 0, borderRadius: 10},
  detailLabel: { color: colors.blue, fontSize: 7, fontWeight: "900", letterSpacing: .8 },
  detail: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  cardAction: { marginTop: 9 },
});
