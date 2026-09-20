import React, { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import type { QuestDefinition } from "../../game/quests/questTypes";
import type { QuestResultSummary } from "../../game/quests/questResultTypes";
import { getEquipmentRewardPresentation, getHeroQuestProgressPresentation, type RewardRarityTone } from "../../game/quests/questRewardPresentationService";
import { CRAFTING_RECIPES } from "../../data/crafting/recipes";
import { MATERIALS } from "../../data/crafting/materials";
import { CONDITIONS } from "../../data/conditions/conditions";
import type { MaterialId } from "../../game/crafting/craftingTypes";
import { resolveEquipmentDefinition } from "../../game/equipment/equipmentResolver";
import { formatGameId } from "../../ui/textFormat";
import { getRaceNameColor } from "../../ui/raceColors";
import { EquipmentIcon } from "../equipment/EquipmentIcon";
import { HeroPortrait } from "../heroes/HeroPortrait";
import { GameIcon } from "../icons/GameIcon";
import { MaterialIcon } from "../materials/MaterialIcon";
import { MiniMeter, Panel, SecondaryButton, SectionTitle, StatusChip, colors } from "../ui";

const RARITY_COLORS: Record<RewardRarityTone, string> = {
  common: colors.muted,
  uncommon: colors.green,
  rare: colors.blue,
  epic: "#b38bd6",
  legendary: colors.gold,
};

export function QuestRewardReveal({ summary, quest, openLoot, openHeroSkills, openGuildmasterSkills }: {
  summary: QuestResultSummary;
  quest: QuestDefinition;
  openLoot(itemId: string): void;
  openHeroSkills(heroId: string): void;
  openGuildmasterSkills(): void;
}) {
  const victory = summary.status === "victory";
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => subscription.remove();
  }, []);
  const guildmasterLevelled = (summary.guildmasterLevelAfter ?? 0) > (summary.guildmasterLevelBefore ?? 0);
  const guildmasterPointGained = (summary.guildmasterSkillPointsAfter ?? 0) > (summary.guildmasterSkillPointsBefore ?? 0);
  const equipmentRewards = useMemo(() => summary.lootIds.map((id) => getEquipmentRewardPresentation(id)).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)), [summary.lootIds]);
  const materialEntries = Object.entries(summary.materials ?? {}) as [MaterialId, number][];
  const recipeIds = victory ? quest.recipeUnlockIdsOnVictory ?? [] : [];
  const oneClearSideQuest = quest.questType === "side" && !quest.repeatable && !quest.hiddenFromQuestBoard;

  return <>
    <SectionTitle>{victory ? "REWARD CHEST" : "LOSSES & RECOVERY"}</SectionTitle>
    <RewardStage delay={0} reducedMotion={reducedMotion}>
      <Panel style={[styles.rewardChest, !victory && styles.lossChest]}>
        <View style={styles.rewardChestHeader}>
          <GameIcon id={victory ? "loot" : "defeat"} size={48} />
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>{victory ? "SPOILS SECURED" : "WITHDRAWAL REPORT"}</Text>
            <Text style={styles.rewardTitle}>{victory ? "Guild Rewards" : "No Victory Rewards"}</Text>
            <Text style={styles.rewardIntro}>{victory ? "Rewards are already banked. Review what changed before issuing the next order." : "The party returns wounded. Recovery takes priority before another deployment."}</Text>
          </View>
          {summary.campaignChapterCompleted ? <View style={styles.chapterSeal}><Text style={styles.chapterSealSmall}>CHAPTER</Text><Text style={styles.chapterSealNumber}>{summary.campaignChapterCompleted}</Text><Text style={styles.chapterSealSmall}>COMPLETE</Text></View> : null}
        </View>
        <View style={styles.resourceGrid}>
          <RewardResource icon="gold" value={summary.goldEarned} label="GOLD" tone="gold" />
          <RewardResource icon="victory" value={summary.reputationEarned ?? 0} label="REPUTATION" tone="gold" />
          <RewardResource icon="guild" value={summary.guildmasterXpEarned ?? 0} label="GM XP" tone="blue" />
          <RewardResource icon="xp" value={summary.xpEarnedPerHero} label="BASE XP/HERO" tone="blue" />
        </View>
        {(guildmasterLevelled || guildmasterPointGained) && <View style={styles.guildmasterUnlock}>
          <View style={styles.guildmasterUnlockCopy}>
            <Text style={styles.unlockEyebrow}>GUILD LEADERSHIP ADVANCED</Text>
            {guildmasterLevelled ? <Text style={styles.unlockTitle}>Guildmaster Level {summary.guildmasterLevelBefore} → {summary.guildmasterLevelAfter}</Text> : null}
            {guildmasterPointGained ? <Text style={styles.unlockDetail}>★ New Guildmaster skill point available</Text> : null}
          </View>
          <View style={styles.unlockAction}><SecondaryButton label="OPEN SKILL TREE" onPress={openGuildmasterSkills} /></View>
        </View>}
      </Panel>
    </RewardStage>

    {victory && (equipmentRewards.length > 0 || materialEntries.length > 0 || recipeIds.length > 0) ? <>
      <SectionTitle>LOOT REVEAL</SectionTitle>
      {equipmentRewards.map((reward, index) => <RewardStage key={`${reward.inventoryKey}-${index}`} delay={120 + index * 90} reducedMotion={reducedMotion}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Inspect ${reward.name}, ${reward.rarityLabel}`} onPress={() => openLoot(reward.inventoryKey)}>
          <Panel style={[styles.lootCard, { borderColor: RARITY_COLORS[reward.rarity] }, reward.rarity === "legendary" && styles.legendaryLoot]}>
            <EquipmentIcon equipmentKey={reward.inventoryKey} label={reward.name} size={52} />
            <View style={styles.flex}>
              <Text style={[styles.rarity, { color: RARITY_COLORS[reward.rarity] }]}>{reward.rarityLabel} DROP</Text>
              <Text style={styles.lootName}>{reward.name}</Text>
              <Text style={styles.lootMeta}>Requires Lv {reward.levelRequirement} · Value {reward.value.toLocaleString()} gold</Text>
            </View>
            <View style={styles.inspectPlate}><Text style={styles.inspectText}>INSPECT ›</Text></View>
          </Panel>
        </Pressable>
      </RewardStage>)}
      {recipeIds.map((id, index) => {
        const recipe = CRAFTING_RECIPES[id];
        const item = recipe ? resolveEquipmentDefinition(recipe.outputEquipmentId) : undefined;
        return <RewardStage key={id} delay={180 + (equipmentRewards.length + index) * 90} reducedMotion={reducedMotion}>
          <Panel style={styles.patternCard}>
            <EquipmentIcon equipmentKey={item?.inventoryKey} slot={item?.slot} label={item?.name} size={46} />
            <View style={styles.flex}><Text style={styles.patternStamp}>PATTERN UNLOCKED</Text><Text style={styles.lootName}>{item?.name ?? formatGameId(id)}</Text><Text style={styles.lootMeta}>Permanently available in the Artisan District.</Text></View>
          </Panel>
        </RewardStage>;
      })}
      {materialEntries.length > 0 ? <RewardStage delay={240 + (equipmentRewards.length + recipeIds.length) * 90} reducedMotion={reducedMotion}>
        <Panel style={styles.materialPanel}>
          <View style={styles.materialHeader}><Text style={styles.patternStamp}>{oneClearSideQuest ? "ONE-CLEAR REWARD SECURED" : "CRAFTING MATERIALS"}</Text>{oneClearSideQuest ? <StatusChip label="REWARDS ONCE" tone="gold" /> : null}</View>
          {materialEntries.map(([id, amount]) => <View key={id} style={styles.materialRow}><MaterialIcon materialId={id} size={40} /><View style={styles.flex}><Text style={styles.materialName}>{MATERIALS[id].name}</Text><Text style={styles.lootMeta}>{oneClearSideQuest ? "Guaranteed on this one available clear" : "Recovered from the mission"}</Text></View><Text style={styles.materialAmount}>×{amount}</Text></View>)}
        </Panel>
      </RewardStage> : null}
    </> : null}

    <SectionTitle>PARTY PROGRESSION</SectionTitle>
    {summary.heroOutcomes.map((hero, index) => <HeroProgressionRewardCard key={hero.heroId} outcome={hero} delay={victory ? 300 + index * 110 : index * 80} reducedMotion={reducedMotion} openSkills={() => openHeroSkills(hero.heroId)} />)}
  </>;
}

function RewardStage({ children, delay, reducedMotion }: React.PropsWithChildren<{ delay: number; reducedMotion: boolean }>) {
  const reveal = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reducedMotion) { reveal.setValue(1); return; }
    reveal.setValue(0);
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.spring(reveal, { toValue: 1, friction: 8, tension: 90, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [delay, reducedMotion, reveal]);
  return <Animated.View style={{ opacity: reveal, transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }, { scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [.985, 1] }) }] }}>{children}</Animated.View>;
}

function RewardResource({ icon, value, label, tone }: { icon: "gold" | "victory" | "guild" | "xp"; value: number; label: string; tone: "gold" | "blue" }) {
  const toneColor = tone === "gold" ? colors.gold : colors.blue;
  return <View style={[styles.resource, { borderColor: toneColor }]}><GameIcon id={icon} size={26} framed={false} /><Text style={[styles.resourceValue, { color: toneColor }]}>{Math.max(0, Math.round(value)).toLocaleString()}</Text><Text style={styles.resourceLabel}>{label}</Text></View>;
}

function HeroProgressionRewardCard({ outcome, delay, reducedMotion, openSkills }: { outcome: QuestResultSummary["heroOutcomes"][number]; delay: number; reducedMotion: boolean; openSkills(): void }) {
  const progress = getHeroQuestProgressPresentation(outcome);
  const meter = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reducedMotion) { meter.setValue(1); return; }
    meter.setValue(0);
    const animation = Animated.sequence([Animated.delay(delay + 130), Animated.timing(meter, { toValue: 1, duration: 720, useNativeDriver: false })]);
    animation.start();
    return () => animation.stop();
  }, [delay, meter, reducedMotion]);
  const beforePct = Math.round(progress.xpRatioBefore * 100);
  const afterPct = Math.round(progress.xpRatioAfter * 100);
  const width = progress.levelled
    ? meter.interpolate({ inputRange: [0, .54, .541, 1], outputRange: [`${beforePct}%`, "100%", "0%", `${afterPct}%`] })
    : meter.interpolate({ inputRange: [0, 1], outputRange: [`${beforePct}%`, `${afterPct}%`] });
  const hpRatio = outcome.currentHP / Math.max(1, outcome.maxHP);
  const hpColor = outcome.currentHP <= 0 ? colors.danger : hpRatio <= .3 ? colors.danger : hpRatio <= .6 ? colors.gold : colors.green;
  const levelText = progress.levelled ? `LV ${outcome.levelBefore} → ${outcome.levelAfter}` : `LV ${outcome.levelAfter}`;
  return <RewardStage delay={delay} reducedMotion={reducedMotion}>
    <Panel style={[styles.heroCard, progress.levelled && styles.levelUpCard, outcome.fellInBattle && styles.fallenCard]}>
      <View style={styles.heroHeader}>
        <HeroPortrait raceId={outcome.raceId} classId={outcome.classId} gender={outcome.gender} variant={outcome.portraitVariant} label={outcome.name} size={62} />
        <View style={styles.flex}>
          <Text style={[styles.heroName, { color: getRaceNameColor(outcome.raceId) }]}>{outcome.name}</Text>
          <Text style={styles.heroStatus}>{outcome.fellInBattle ? "FALLEN · RECOVERY REQUIRED" : outcome.conditionIds.length ? "WOUNDED · CONDITION ACTIVE" : "FIELD SURVIVOR"}</Text>
          <Text style={styles.heroHp}>HP {Math.round(outcome.currentHP)} / {Math.round(outcome.maxHP)}</Text>
          <MiniMeter value={outcome.currentHP} max={Math.max(1, outcome.maxHP)} color={hpColor} height={5} />
        </View>
        <View style={[styles.levelPlate, progress.levelled && styles.levelPlateUp]}><Text style={styles.levelPlateText}>{levelText}</Text></View>
      </View>
      <View style={styles.xpHeader}><Text style={styles.xpGain}>+{progress.xpEarned.toLocaleString()} XP</Text><Text style={styles.xpText}>{progress.bankedXp ? "XP BANKED AT CURRENT CAP" : `${Math.round(progress.xpAfter).toLocaleString()} / ${progress.xpRequired.toLocaleString()} TO NEXT LEVEL`}</Text></View>
      <View style={styles.xpTrack}><Animated.View style={[styles.xpFill, { width }]} /></View>
      {progress.levelled ? <View style={styles.levelUpBanner}><Text style={styles.levelUpStar}>★</Text><View style={styles.flex}><Text style={styles.levelUpTitle}>LEVEL UP!</Text><Text style={styles.levelUpDetail}>{progress.levelsGained === 1 ? `Reached Level ${outcome.levelAfter}` : `Gained ${progress.levelsGained} levels · now Level ${outcome.levelAfter}`}</Text></View></View> : null}
      {progress.milestoneLabels.map((label) => <View key={label} style={styles.milestone}><GameIcon id={label.includes("SKILL") ? "skill_codex" : "victory"} size={26} framed={false} /><Text style={styles.milestoneText}>{label}</Text></View>)}
      {progress.newSkillPoints > 0 ? <View style={styles.heroAction}><SecondaryButton label="SPEND SKILL POINT" onPress={openSkills} /></View> : null}
      {outcome.conditionIds.length > 0 ? <Text style={styles.injuryText}>⚠ {outcome.conditionIds.map((id) => CONDITIONS[id as keyof typeof CONDITIONS]?.name ?? formatGameId(id)).join(" · ")}</Text> : null}
    </Panel>
  </RewardStage>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rewardChest: { borderColor: colors.gold, borderWidth: 3, padding: 14 },
  lossChest: { borderColor: colors.danger },
  rewardChestHeader: { alignItems: "center", flexDirection: "row", gap: 11 },
  eyebrow: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.4 },
  rewardTitle: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 2 },
  rewardIntro: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  chapterSeal: { alignItems: "center", borderColor: colors.gold, borderWidth: 2, minWidth: 66, padding: 6 },
  chapterSealSmall: { color: colors.gold, fontSize: 7, fontWeight: "900", letterSpacing: .8 },
  chapterSealNumber: { color: colors.text, fontSize: 22, fontWeight: "900", lineHeight: 25 },
  resourceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 13 },
  resource: { alignItems: "center", backgroundColor: colors.panel2, borderWidth: 1, flexBasis: "47%", flexGrow: 1, minHeight: 72, padding: 8 },
  resourceValue: { fontSize: 18, fontWeight: "900", marginTop: 2 },
  resourceLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: .8, marginTop: 1 },
  guildmasterUnlock: { alignItems: "center", backgroundColor: "#17242b", borderColor: colors.blue, borderWidth: 2, flexDirection: "row", gap: 10, marginTop: 10, padding: 10 },
  guildmasterUnlockCopy: { flex: 1 },
  unlockEyebrow: { color: colors.blue, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  unlockTitle: { color: colors.text, fontSize: 13, fontWeight: "900", marginTop: 2 },
  unlockDetail: { color: colors.gold, fontSize: 10, fontWeight: "800", marginTop: 3 },
  unlockAction: { minWidth: 130 },
  lootCard: { alignItems: "center", borderWidth: 3, flexDirection: "row", gap: 11, marginBottom: 8, padding: 11 },
  legendaryLoot: { borderWidth: 4 },
  rarity: { fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  lootName: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 2 },
  lootMeta: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  inspectPlate: { borderColor: colors.border, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 5 },
  inspectText: { color: colors.gold, fontSize: 8, fontWeight: "900" },
  patternCard: { alignItems: "center", borderColor: colors.blue, borderWidth: 2, flexDirection: "row", gap: 11, marginBottom: 8 },
  patternStamp: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  materialPanel: { borderColor: colors.gold, gap: 4 },
  materialHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  materialRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 10, paddingVertical: 8 },
  materialName: { color: colors.text, fontSize: 13, fontWeight: "900" },
  materialAmount: { color: colors.gold, fontSize: 18, fontWeight: "900" },
  heroCard: { borderColor: colors.border, marginBottom: 9, overflow: "hidden" },
  levelUpCard: { borderColor: colors.gold, borderWidth: 3 },
  fallenCard: { borderColor: colors.danger },
  heroHeader: { alignItems: "center", flexDirection: "row", gap: 10 },
  heroName: { fontSize: 16, fontWeight: "900" },
  heroStatus: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: .7, marginTop: 2 },
  heroHp: { color: colors.text, fontSize: 9, marginBottom: 3, marginTop: 4 },
  levelPlate: { borderColor: colors.border, borderWidth: 2, minWidth: 68, paddingHorizontal: 7, paddingVertical: 6 },
  levelPlateUp: { backgroundColor: "#3a301b", borderColor: colors.gold },
  levelPlateText: { color: colors.text, fontSize: 10, fontWeight: "900", textAlign: "center" },
  xpHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 11 },
  xpGain: { color: colors.blue, fontSize: 12, fontWeight: "900" },
  xpText: { color: colors.muted, fontSize: 8, fontWeight: "800" },
  xpTrack: { backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, height: 9, marginTop: 5, overflow: "hidden" },
  xpFill: { backgroundColor: colors.blue, height: "100%" },
  levelUpBanner: { alignItems: "center", backgroundColor: "#332b18", borderColor: colors.gold, borderWidth: 2, flexDirection: "row", gap: 9, marginTop: 9, padding: 9 },
  levelUpStar: { color: colors.gold, fontSize: 22, fontWeight: "900" },
  levelUpTitle: { color: colors.gold, fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  levelUpDetail: { color: colors.text, fontSize: 10, marginTop: 2 },
  milestone: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderLeftWidth: 3, flexDirection: "row", gap: 8, marginTop: 7, padding: 8 },
  milestoneText: { color: colors.gold, flex: 1, fontSize: 10, fontWeight: "900", letterSpacing: .6 },
  heroAction: { alignSelf: "flex-start", marginTop: 8, minWidth: 170 },
  injuryText: { color: colors.danger, fontSize: 10, fontWeight: "800", marginTop: 8 },
});
