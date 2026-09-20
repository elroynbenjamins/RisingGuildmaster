import { SearchField } from "../../components/inputs/SearchField";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { EmptyState, Panel, SegmentedTabs, SecondaryButton } from "../../components/ui";
import { HeroRosterCard } from "../../components/heroes/HeroRosterCard";
import { CLASSES } from "../../data/classes/classes";
import { RACES } from "../../data/races/races";
import { RECRUITMENT_CONFIG } from "../../data/recruitment/recruitmentBalance";
import type { Hero } from "../../game/heroes/types";
import { getHeroLoyalty, getHeroLoyaltyBand } from "../../game/heroes/heroLoyaltyService";
import { getAvailableClassSkillPoints } from "../../game/progression/skills/skillProgressionService";
import { useGuild } from "../../state/GuildContext";
import { filterAndSortHeroes, type HeroFilter, type HeroSort } from "../../ui/heroList";
import { heroHasSkillChoice } from "../../ui/actionNotifications";
import { useTheme } from "../../theme/theme";

const FILTERS: HeroFilter[] = ["All", "Available", "Injured", "Fallen"];
const SORTS: HeroSort[] = ["Level", "Name", "Class", "Potential"];

function averageTopFour(heroes: readonly Hero[]): number {
  const top = [...heroes].sort((a, b) => b.level - a.level).slice(0, 4);
  return top.length ? top.reduce((sum, hero) => sum + hero.level, 0) / top.length : 0;
}

export function HeroesScreen({ openHero, recruit }: { openHero(hero: Hero): void; recruit(): void }) {
  const { guild } = useGuild();
  const { colors: themeColors } = useTheme();
  const [filter, setFilter] = useState<HeroFilter>("All");
  const [sort, setSort] = useState<HeroSort>("Level");
  const [showSort, setShowSort] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const heroes = filterAndSortHeroes(guild.heroes, filter, sort).filter((hero) =>
    !normalizedQuery || `${hero.name} ${RACES[hero.raceId].name} ${CLASSES[hero.classId].name}`.toLowerCase().includes(normalizedQuery)
  );

  const fallenCount = guild.heroes.filter((hero) => hero.currentHP <= 0).length;
  const availableCount = guild.heroes.filter((hero) => hero.currentHP > 0 && hero.isAvailable).length;
  const totalSkillChoices = guild.heroes.reduce((sum, hero) => sum + getAvailableClassSkillPoints(hero), 0);
  const topFourAverage = averageTopFour(guild.heroes);
  const contractByHeroId = useMemo(() => new Map(guild.heroContracts.map((contract) => [contract.heroId, contract])), [guild.heroContracts]);
  const trainingByHeroId = useMemo(() => new Map(guild.trainingGround.sessions.map((session) => [session.heroId, session])), [guild.trainingGround.sessions]);
  const attentionCount = guild.heroes.filter((hero) => {
    const loyalty = getHeroLoyalty(guild, hero.id).score;
    const contract = contractByHeroId.get(hero.id);
    return hero.currentHP <= 0
      || hero.conditions.some((entry) => entry.conditionId !== "inspired")
      || heroHasSkillChoice(hero)
      || getHeroLoyaltyBand(loyalty) === "unhappy"
      || getHeroLoyaltyBand(loyalty) === "resentful"
      || (!!contract && contract.endDay - guild.currentDay <= 14);
  }).length;
  const capacityReached = guild.heroes.length >= RECRUITMENT_CONFIG.heroCapacity;

  return <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: themeColors.background }} contentContainerStyle={styles.content}>
    <View style={styles.rosterBanner}>
      <Text style={[styles.title, { color: themeColors.text }]}>Adventurers</Text>
      <View style={styles.compactRow}>
        <Text style={[styles.count, { color: themeColors.muted, flex: 1 }]}>{guild.heroes.length} / {RECRUITMENT_CONFIG.heroCapacity} roster slots</Text>
        {capacityReached ? <Text style={{ color: themeColors.muted }}>Roster full</Text> : <SecondaryButton label="Recruit" onPress={recruit} />}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Roster summary" accessibilityState={{ expanded: showSummary }} aria-expanded={showSummary} onPress={() => setShowSummary(value => !value)} style={styles.summaryToggle}>
        <Text style={{ color: themeColors.muted }}>{availableCount} ready · {attentionCount} need attention</Text><Text style={{ color: themeColors.muted }}>{showSummary ? '−' : '+'}</Text>
      </Pressable>
    </View>

    {showSummary && <View style={styles.overview}>
      <View style={[styles.overviewItem, { backgroundColor: "transparent", borderColor: themeColors.green }]}><Text style={[styles.overviewValue, { color: themeColors.green }]}>{availableCount}</Text><Text style={[styles.overviewLabel, { color: themeColors.muted }]}>FIELD READY</Text></View>
      <View style={[styles.overviewItem, { backgroundColor: "transparent", borderColor: attentionCount ? themeColors.gold : themeColors.border }]}><Text style={[styles.overviewValue, { color: attentionCount ? themeColors.gold : themeColors.text }]}>{attentionCount}</Text><Text style={[styles.overviewLabel, { color: themeColors.muted }]}>ATTENTION</Text></View>
      <View style={[styles.overviewItem, { backgroundColor: "transparent", borderColor: themeColors.blue }]}><Text style={[styles.overviewValue, { color: themeColors.blue }]}>{topFourAverage.toFixed(1)}</Text><Text style={[styles.overviewLabel, { color: themeColors.muted }]}>TOP 4 AVG</Text></View>
      <View style={[styles.overviewItem, { backgroundColor: "transparent", borderColor: totalSkillChoices ? themeColors.gold : themeColors.border }]}><Text style={[styles.overviewValue, { color: totalSkillChoices ? themeColors.gold : themeColors.text }]}>{totalSkillChoices}</Text><Text style={[styles.overviewLabel, { color: themeColors.muted }]}>SKILL PTS</Text></View>
    </View>}

    {fallenCount > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Show fallen heroes" onPress={() => setFilter("Fallen")} style={[styles.memorial, { backgroundColor: themeColors.panel }]}><Text style={{ color: themeColors.danger }}>{fallenCount} fallen · View heroes needing revival ›</Text></Pressable>}

    <Panel style={styles.rosterTools}>
      <View style={styles.compactRow}>
        <SearchField label="Search hero roster" placeholder="Search heroes" value={query} onChangeText={setQuery} />
        <Pressable accessibilityRole="button" accessibilityLabel="Sort heroes" accessibilityState={{ expanded: showSort }} aria-expanded={showSort} onPress={() => setShowSort(value => !value)} style={styles.sortToggle}><Text style={{ color: themeColors.muted }}>Sort: {sort} {showSort ? '−' : '+'}</Text></Pressable>
      </View>
      <SegmentedTabs values={FILTERS} value={filter} onChange={setFilter} />
      {showSort && <SegmentedTabs values={SORTS} value={sort} onChange={value => { setSort(value); setShowSort(false); }} />}
    </Panel>
    <Text style={[styles.cardHeader, { color: themeColors.muted }]}>{heroes.length} {heroes.length === 1 ? "hero" : "heroes"} shown · Tap to inspect</Text>

    {heroes.map((hero) => {
      const skillPoints = getAvailableClassSkillPoints(hero);
      const loyalty = getHeroLoyalty(guild, hero.id).score;
      return <HeroRosterCard
        key={hero.id}
        hero={hero}
        loyaltyScore={loyalty}
        skillPoints={skillPoints}
        contract={contractByHeroId.get(hero.id)}
        trainingSession={trainingByHeroId.get(hero.id)}
        currentDay={guild.currentDay}
        onPress={() => openHero(hero)}
      />;
    })}

    {!heroes.length && <EmptyState title={filter === "Fallen" && !query ? "No fallen heroes" : guild.heroes.length ? "No matching heroes" : "Your roster is empty"} message={query ? "Try another hero name, race, or class." : filter === "Fallen" ? "Every guild member is still standing." : guild.heroes.length ? "Change the current roster filter." : "Recruit candidates to begin building your guild."} actionLabel={!guild.heroes.length ? "Open Recruitment" : "Clear filters"} onAction={!guild.heroes.length ? recruit : () => { setQuery(""); setFilter("All"); }} />}
  </ScrollView>;
}

const styles = StyleSheet.create({
  compactRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  summaryToggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 44 },
  sortToggle: { minHeight: 44, justifyContent: "center", paddingHorizontal: 6 },
  content: { padding: 14, paddingBottom: 38 },
  rosterBanner: {justifyContent: "space-between", borderWidth: 0, borderRadius: 12, flexDirection: "column", alignItems: "stretch", padding: 0, minHeight: 0, gap: 2, marginBottom: 4},
  title: {fontWeight: "900", letterSpacing: .4, marginTop: 2, fontSize: 25, lineHeight: 31},
  count: { fontSize: 10, fontWeight: "500", marginTop: 3 },
  overview: { flexDirection: "row", gap: 5, marginBottom: 10 },
  overviewItem: { alignItems: "center", flex: 1, minHeight: 61, paddingHorizontal: 3, paddingVertical: 8, borderWidth: 0, borderRadius: 12,  backgroundColor: "transparent", },
  overviewValue: { fontSize: 18, fontWeight: "900" },
  overviewLabel: { fontSize: 7, fontWeight: "500", letterSpacing: .3, marginTop: 2, textAlign: "center" },
  memorial: {borderWidth: 0, borderRadius: 12, minHeight: 44, justifyContent: "center", padding: 10, marginBottom: 8},
  rosterTools: { padding: 0, borderWidth: 0, backgroundColor: "transparent", marginBottom: 0},
  cardHeader: { marginBottom: 8, paddingHorizontal: 2 },
});
