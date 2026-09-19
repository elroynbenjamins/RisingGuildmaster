import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { EmptyState, HeroCard, SegmentedTabs, colors } from "../../components/ui";
import { GAME_CONFIG } from "../../config/gameConfig";
import { CLASSES } from "../../data/classes/classes";
import { RACES } from "../../data/races/races";
import { calculateHero } from "../../game/heroes/heroCalculator";
import type { Hero } from "../../game/heroes/types";
import { getAvailableClassSkillPoints } from "../../game/progression/skills/skillProgressionService";
import { useGuild } from "../../state/GuildContext";
import { filterAndSortHeroes, type HeroFilter, type HeroSort } from "../../ui/heroList";
import { useTheme } from "../../theme/theme";

import { heroHasSkillChoice } from "../../ui/actionNotifications";
import { getHeroAttention } from "../../ui/heroAttention";
const FILTERS: HeroFilter[] = ["All", "Attention", "Available", "Injured", "Fallen"];
const SORTS: HeroSort[] = ["Level", "Attention", "Name", "Class", "Potential"];

export function HeroesScreen({ openHero, recruit }: { openHero(hero: Hero): void; recruit(): void }) {
  const { guild } = useGuild();
  const { colors: themeColors } = useTheme();
  const [filter, setFilter] = useState<HeroFilter>("All");
  const [sort, setSort] = useState<HeroSort>("Level");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const heroes = filterAndSortHeroes(guild.heroes, filter, sort, (hero) => getHeroAttention(guild, hero).score).filter((hero) =>
    !normalizedQuery || `${hero.name} ${RACES[hero.raceId].name} ${CLASSES[hero.classId].name}`.toLowerCase().includes(normalizedQuery)
  );
  const fallenCount = guild.heroes.filter((hero) => hero.currentHP <= 0).length;
  const injuredCount = guild.heroes.filter((hero) => hero.currentHP > 0 && hero.conditions.length > 0).length;
  const availableCount = guild.heroes.filter((hero) => hero.currentHP > 0 && hero.isAvailable).length;
  const attentionCount = guild.heroes.filter((hero) => getHeroAttention(guild, hero).issues.length > 0).length;

  return <ScrollView style={{ backgroundColor: themeColors.background }} contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Text style={styles.title}>Heroes</Text><Text style={styles.count}>{guild.heroes.length} / {GAME_CONFIG.baseHeroCapacity} roster slots</Text></View></View>
    <View style={styles.overview}>
      <View style={[styles.overviewItem, attentionCount > 0 && styles.attentionOverview]}><Text style={styles.overviewValue}>{attentionCount}</Text><Text style={styles.overviewLabel}>ATTENTION</Text></View>
      <View style={styles.overviewItem}><Text style={styles.overviewValue}>{availableCount}</Text><Text style={styles.overviewLabel}>READY</Text></View>
      <View style={styles.overviewItem}><Text style={styles.overviewValue}>{injuredCount}</Text><Text style={styles.overviewLabel}>CONDITIONS</Text></View>
      <View style={styles.overviewItem}><Text style={styles.overviewValue}>{fallenCount}</Text><Text style={styles.overviewLabel}>FALLEN</Text></View>
    </View>
    {fallenCount > 0 && <View style={styles.memorial}><Text style={styles.memorialTitle}>FALLEN HEROES</Text><Text style={styles.memorialText}>{fallenCount} guild member{fallenCount === 1 ? " awaits" : "s await"} revival at the Temple. Select Fallen below to review them.</Text></View>}
    <TextInput accessibilityLabel="Search hero roster" value={query} onChangeText={setQuery} placeholder="Search hero, race, or class" placeholderTextColor={colors.muted} style={styles.search} />
    <SegmentedTabs values={FILTERS} value={filter} onChange={setFilter} />
    <View style={styles.sortHeading}><Text style={styles.label}>SORT</Text><Text style={styles.resultCount}>{heroes.length} SHOWN</Text></View>
    <SegmentedTabs values={SORTS} value={sort} onChange={setSort} />
    {heroes.map((hero) => {
      const stats = calculateHero(hero); const skillPoints = getAvailableClassSkillPoints(hero); const attention = getHeroAttention(guild, hero);
      return <View key={hero.id}>{attention.issues.length ? <Text style={styles.attentionLine}>⚠ {attention.label}</Text> : null}<HeroCard notification={heroHasSkillChoice(hero)} hero={hero} onPress={() => openHero(hero)} subtitle={`${hero.currentHP <= 0 ? "FALLEN" : hero.conditions.length ? "CONDITIONED" : hero.isAvailable ? "READY" : "BUSY"} • ${RACES[hero.raceId].name} ${CLASSES[hero.classId].name} • Lv ${hero.level} • HP ${Math.round(hero.currentHP)}/${Math.round(stats.stats.maxHP)} • Potential ${hero.potentialEstimateMin}–${hero.potentialEstimateMax}${skillPoints ? ` • ★ ${skillPoints} skill point${skillPoints === 1 ? "" : "s"}` : ""}`} /></View>;
    })}
    {!heroes.length && <EmptyState title={filter === "Fallen" && !query ? "No fallen heroes" : guild.heroes.length ? "No matching heroes" : "Your roster is empty"} message={query ? "Try another hero name, race, or class." : filter === "Fallen" ? "Every guild member is still standing." : guild.heroes.length ? "Change the current roster filter." : "Recruit candidates to begin building your guild."} actionLabel={!guild.heroes.length ? "Open Recruitment" : undefined} onAction={!guild.heroes.length ? recruit : undefined} />}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 35 }, header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }, title: { color: colors.text, fontSize: 30, fontWeight: "900" }, count: { color: colors.gold, marginTop: 3 },
  label: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: "900" }, overview: { flexDirection: "row", gap: 7, marginBottom: 12 }, overviewItem: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flex: 1, padding: 8 }, attentionOverview: { borderColor: colors.gold }, overviewValue: { color: colors.text, fontSize: 20, fontWeight: "900" }, overviewLabel: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: .7, marginTop: 2 },
  memorial: { backgroundColor: "#211722", borderColor: "#9e637b", borderRadius: 10, borderWidth: 1, marginBottom: 12, padding: 12 }, memorialTitle: { color: "#e7a9bd", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 }, memorialText: { color: colors.text, fontSize: 12, lineHeight: 17, marginTop: 4 },
  search: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, marginBottom: 11, minHeight: 46, paddingHorizontal: 13 }, attentionLine: { color: "#efb46f", fontSize: 9, fontWeight: "800", lineHeight: 14, marginBottom: 3, marginLeft: 4 }, sortHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 5 }, resultCount: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: .7 },
});
