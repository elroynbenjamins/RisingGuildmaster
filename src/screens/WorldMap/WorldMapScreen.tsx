import React, { useRef, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, Panel, SectionTitle, colors } from "../../components/ui";
import { REGIONS } from "../../data/world/regions";
import { SETTLEMENTS } from "../../data/world/settlements";
import { WORLD_ART } from "../../data/world/worldArt";
import { RACE_HOMELANDS } from "../../data/recruitment/raceHomelands";
import { RACES } from "../../data/races/races";
import type { GuildState } from "../../game/guild/types";
import { isBossAvailable, isRegionCompleted } from "../../game/world/regionService";
import { discoverRegionSettlements } from "../../game/world/worldService";
import { buyRations, canTravel, getRationBundleAmount, getRegionalTravelDays, getTravelRationCost, travelGuildToRegion } from "../../game/world/travelService";
import type { WorldEventDefinition } from "../../game/world/worldTypes";
import { WORLD_NAME } from "../../game/world/worldState";
import { mapChromeStyles } from "../../ui/worldMap";
import type { RandomSource } from "../../utils/random";
import { GameIcon } from "../../components/icons/GameIcon";
import { isMatchingDoubleTap, type TapRecord } from "../../utils/doubleTap";
import { GAME_CONFIG } from "../../config/gameConfig";

interface WorldMapProps {
  guild: GuildState;
  random: RandomSource;
  onBack?: () => void;
  updateGuild(guild: GuildState): void;
  openQuest(id: string): void;
  openRegion(id: string): void;
  openCampaign(): void;
  openEvent(event: WorldEventDefinition): void;
}

export function WorldMapScreen({ guild, random, onBack, updateGuild, openQuest, openRegion, openCampaign, openEvent }: WorldMapProps) {
  const [selectedId, setSelectedId] = useState(guild.world.currentRegionId);
  const [message, setMessage] = useState<string>();
  const [showRegionIntel, setShowRegionIntel] = useState(false);
  const lastRegionTap = useRef<TapRecord | null>(null);
  const selected = REGIONS[selectedId]!;
  const unlocked = guild.world.unlockedRegionIds.includes(selectedId);
  const current = guild.world.currentRegionId === selectedId;
  const travelAllowed = canTravel(guild.world, selectedId);
  const homelandContacts = Object.values(RACE_HOMELANDS).filter((homeland) => homeland.regionId === selectedId);
  const averageLevel = guild.heroes.length ? guild.heroes.reduce((sum, hero) => sum + hero.level, 0) / guild.heroes.length : 0;
  const completedRegionQuests = selected.questPoolIds.filter((id) => guild.world.completedQuestIds.includes(id)).length;
  const selectedThreat = guild.world.regionThreat?.[selectedId] ?? 0;
  const availableHeroes = guild.heroes.filter((hero) => hero.isAvailable);
  const recentAvailable = guild.recentPartyHeroIds.filter((id) => availableHeroes.some((hero) => hero.id === id));
  const travelPartySize = Math.max(1, recentAvailable.length || Math.min(4, availableHeroes.length));
  const travelDays = current ? 0 : getRegionalTravelDays(guild.world.currentRegionId, selectedId);
  const rationCost = current ? 0 : getTravelRationCost(travelDays, travelPartySize, guild.guildmaster);
  const travelBlocker = current ? null : !unlocked ? "Region locked by campaign progress." : !travelAllowed ? "No direct unlocked road from the current region." : !availableHeroes.length ? "No living, available heroes can form a travel party." : guild.rations < rationCost ? `Need ${rationCost-guild.rations} more rations.` : null;

  const selectRegion = (regionId: string) => {
    const timestamp = Date.now();
    const doubleTapped = isMatchingDoubleTap(lastRegionTap.current, regionId, timestamp);
    lastRegionTap.current = doubleTapped ? null : { targetKey: regionId, timestamp };
    setSelectedId(regionId);
    if (regionId !== selectedId) setShowRegionIntel(false);
    setMessage(undefined);
    if (doubleTapped) openRegion(regionId);
  };

  const travel = () => {
    try {
      const result = travelGuildToRegion(guild, selectedId, travelPartySize, random);
      const world = discoverRegionSettlements(result.guild.world, selectedId);
      updateGuild({ ...result.guild, world });
      setMessage(`Arrived in ${selected.name} after ${result.days} days. Used ${result.rationCost} rations. d100: ${result.d100Roll}${result.tier ? ` · ${result.tier.toUpperCase()} event` : " · quiet journey"}.`);
      if (result.event) openEvent(result.event);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Travel failed");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {onBack && <BackButton onPress={onBack} />}
      <Text style={styles.title}>{WORLD_NAME}</Text>
      <Text style={styles.subtitle}>Campaign Chapter {guild.world.campaignChapter} · Current: {REGIONS[guild.world.currentRegionId]!.name}</Text>

      <View style={styles.overview}>
        <View style={styles.overviewStat}><Text style={styles.overviewValue}>{guild.world.unlockedRegionIds.length}/{Object.keys(REGIONS).length}</Text><Text style={styles.overviewLabel}>REGIONS OPEN</Text></View>
        <View style={styles.overviewStat}><Text style={styles.overviewValue}>{guild.world.discoveredSettlementIds.length}/{Object.keys(SETTLEMENTS).length}</Text><Text style={styles.overviewLabel}>SETTLEMENTS</Text></View>
        <View style={styles.overviewStat}><Text style={styles.overviewValue}>{guild.rations}</Text><Text style={styles.overviewLabel}>RATIONS</Text></View>
      </View>

      <View style={mapChromeStyles.frame}>
        <ImageBackground source={WORLD_ART.eldoria} resizeMode="cover" style={mapChromeStyles.canvas} imageStyle={mapChromeStyles.image}>
          <View pointerEvents="none" style={styles.mapShade} />

          {Object.values(REGIONS).map((region) => {
            const isUnlocked = guild.world.unlockedRegionIds.includes(region.id);
            const isCurrent = guild.world.currentRegionId === region.id;
            const completed = isRegionCompleted(region.id, guild.world);
            const boss = isBossAvailable(region.id, guild.world);
            const selectedRegion = selectedId === region.id;
            const status = !isUnlocked ? "LOCKED" : isCurrent ? "CURRENT" : completed ? "COMPLETE" : boss ? "BOSS" : "OPEN";
            const markerIcon = !isUnlocked ? "locked" : isCurrent ? "current" : completed ? "complete" : boss ? "boss" : "region_open";
            const settlementDiscovered = region.settlementIds.some((id) => guild.world.discoveredSettlementIds.includes(id));

            return (
              <Pressable
                accessibilityHint="Tap once to inspect. Tap twice quickly to open the regional map."
                accessibilityLabel={`${region.name}, ${status.toLowerCase()}`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedRegion }}
                key={region.id}
                onPress={() => selectRegion(region.id)}
                style={({ pressed }) => [
                  styles.node,
                  { left: `${region.mapPosition.x * 100}%`, top: `${region.mapPosition.y * 100}%` },
                  !isUnlocked && styles.lockedNode,
                  isCurrent && styles.currentNode,
                  selectedRegion && styles.selectedNode,
                  pressed && styles.pressedNode,
                ]}
              >
                <View style={[styles.marker, isCurrent && styles.currentMarker, boss && styles.bossMarker]}><GameIcon id={markerIcon} size={28} framed={false} /></View>
                <Text numberOfLines={1} style={styles.nodeName}>{region.name}</Text>
                <Text style={styles.nodeState}>{status}</Text>
                {selectedRegion && <Text style={styles.nodeHint}>DOUBLE TAP · OPEN</Text>}
                {(guild.world.regionThreat?.[region.id] ?? 0) > 0 && <Text style={styles.threatBadge}>THREAT {guild.world.regionThreat?.[region.id]}</Text>}
                {settlementDiscovered && (selectedRegion || isCurrent) && <View style={styles.settlementRow}><GameIcon id="settlement" size={13} framed={false} /><Text style={styles.settlement}>{SETTLEMENTS[region.settlementIds[0]!]?.name}</Text></View>}
              </Pressable>
            );
          })}
        </ImageBackground>
        <View style={mapChromeStyles.legend}>
          <View style={styles.legendItem}><GameIcon id="current" size={14} framed={false}/><Text style={styles.legendText}>CURRENT</Text></View>
          <View style={styles.legendItem}><GameIcon id="boss" size={14} framed={false}/><Text style={styles.legendText}>BOSS</Text></View>
          <View style={styles.legendItem}><GameIcon id="locked" size={14} framed={false}/><Text style={styles.legendText}>LOCKED</Text></View>
        </View>
      </View>

      <Text style={styles.gestureHint}>Tap a flag to inspect · Double tap the same flag to open its regional map</Text>

      <Panel>
        <View style={styles.panelHeader}>
          <View style={styles.flex}><Text style={styles.regionName}>{selected.name}</Text><Text style={styles.level}>Recommended level {selected.recommendedLevelMin}–{selected.recommendedLevelMax}</Text></View>
          <Text style={styles.state}>{!unlocked ? "Locked" : current ? "Current" : "Unlocked"}</Text>
        </View>
        <Text style={styles.description}>{selected.description}</Text>
        {unlocked && averageLevel > 0 && averageLevel < selected.recommendedLevelMin && <Text style={styles.danger}>⚠ DANGER: Party level below recommended range.</Text>}
        <Text style={styles.detail}>Settlement: {selected.settlementIds.map((id) => SETTLEMENTS[id]!.name).join(", ")}</Text>
        <Text style={styles.detail}>Travel party: {travelPartySize} · Supplies are consumed per hero per day.</Text>
        {!current&&<View style={[styles.travelReadiness,travelBlocker?styles.travelBlocked:styles.travelReady]}><Text style={travelBlocker?styles.routeWarning:styles.travelReadyText}>{travelBlocker?`TRAVEL BLOCKED · ${travelBlocker}`:`TRAVEL READY · ${travelDays} day${travelDays===1?"":"s"} · ${rationCost} rations · ${travelPartySize} heroes`}</Text></View>}
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showRegionIntel }} onPress={() => setShowRegionIntel((value) => !value)} style={styles.intelButton}><Text style={styles.intelLabel}>{showRegionIntel ? "− HIDE" : "+ SHOW"} REGIONAL INTELLIGENCE</Text></Pressable>
        {showRegionIntel && <View style={styles.intelBlock}>
          <Text style={styles.detail}>Enemy factions: {selected.enemyFactionIds.join(", ") || "Unknown"}</Text>
          {homelandContacts.length > 0 && <Text style={styles.detail}>Recruitment homeland: {homelandContacts.map((homeland) => `${RACES[homeland.raceId].name} · ${homeland.locationName}`).join(", ")}</Text>}
          <Text style={styles.detail}>Possible quests and road encounters: {selected.questPoolIds.length}</Text>
          <Text style={styles.detail}>Regional progress: {completedRegionQuests}/{selected.questPoolIds.length} listed quests complete</Text>
          {selectedThreat > 0 && <Text style={styles.threat}>Regional threat {selectedThreat}/4 · Delaying unresolved dangers can strengthen enemies and disrupt settlements.</Text>}
          {selected.bossQuestId && <Text style={styles.boss}>! Regional boss: {guild.world.completedQuestIds.includes(selected.bossQuestId) ? "Defeated" : "Available through campaign"}</Text>}
          <Text style={styles.roadTitle}>DIRECT ROADS</Text>
          <View style={styles.roads}>{selected.connectedRegionIds.map((regionId) => { const destination = REGIONS[regionId]!; const destinationUnlocked = guild.world.unlockedRegionIds.includes(regionId); return <Pressable accessibilityRole="button" key={regionId} onPress={() => { setSelectedId(regionId); setShowRegionIntel(false); }} style={[styles.road, !destinationUnlocked && styles.roadLocked]}><GameIcon id={destinationUnlocked ? "region_open" : "locked"} size={18} framed={false}/><Text style={destinationUnlocked ? styles.roadName : styles.roadNameLocked}>{destination.name}</Text></Pressable>; })}</View>
        </View>}
        <View style={styles.buttons}>
          <ActionButton label="Open Region Map" onPress={() => openRegion(selectedId)} />
          {!current && unlocked && <ActionButton label={`Travel · ${travelDays}d · ${rationCost} rations`} disabled={Boolean(travelBlocker)} onPress={travel} />}
          {current && guild.world.currentSettlementId && <ActionButton label={`Buy ${getRationBundleAmount(guild)} rations · ${GAME_CONFIG.rationBundleGoldCost}g`} onPress={() => { try { const before = guild.rations; const next = buyRations(guild); updateGuild(next); setMessage(`Bought ${next.rations - before} rations.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Purchase failed"); } }} />}
          {unlocked && selected.questPoolIds[0] && <ActionButton label="View Contract" onPress={() => openQuest(selected.questPoolIds[0]!)} />}
          <ActionButton label="Campaign" onPress={openCampaign} />
        </View>
        {message && <Text style={styles.message}>{message}</Text>}
      </Panel>

      <SectionTitle>DISCOVERED SETTLEMENTS</SectionTitle>
      <Text style={styles.description}>{guild.world.discoveredSettlementIds.map((id) => SETTLEMENTS[id]?.name ?? id).join("  ·  ")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 50 },
  title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 8 },
  subtitle: { color: colors.gold, marginTop: 3 },
  overview: { flexDirection: "row", gap: 7, marginTop: 13 },
  overviewStat: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flex: 1, paddingHorizontal: 4, paddingVertical: 9 },
  overviewValue: { color: colors.text, fontSize: 18, fontWeight: "900" },
  overviewLabel: { color: colors.gold, fontSize: 7, fontWeight: "900", letterSpacing: .6, marginTop: 2, textAlign: "center" },
  mapShade: { backgroundColor: "rgba(4, 11, 17, 0.10)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  // mapPosition identifies the center of the flag, not the top-left of its label.
  node: { alignItems: "center", backgroundColor: "transparent", borderWidth: 0, marginLeft: -50, marginTop: -15, minHeight: 67, paddingHorizontal: 5, position: "absolute", width: 100 },
  lockedNode: { opacity: 0.78 },
  currentNode: { opacity: 1 },
  selectedNode: { transform: [{ scale: 1.05 }] },
  pressedNode: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  marker: { alignItems: "center", backgroundColor: "#374449", borderColor: "#d4c59d", borderRadius: 4, borderWidth: 1, height: 30, justifyContent: "center", width: 30 },
  currentMarker: { backgroundColor: "#27633e", borderColor: colors.green },
  bossMarker: { backgroundColor: "#762f29", borderColor: colors.danger },
  markerText: { color: colors.text, fontSize: 11, fontWeight: "900", lineHeight: 14 },
  nodeName: { color: colors.text, fontSize: 11, fontWeight: "900", marginTop: 3, textAlign: "center", textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  nodeState: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 0.7, marginTop: 2, textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  nodeHint: { color: colors.green, fontSize: 6, fontWeight: "900", letterSpacing: .4, marginTop: 2 },
  threatBadge: { backgroundColor: "rgba(113, 38, 34, .95)", borderRadius: 3, color: "#ffb0a8", fontSize: 6, fontWeight: "900", marginTop: 2, overflow: "hidden", paddingHorizontal: 3, paddingVertical: 1 },
  settlementRow: { alignItems: "center", flexDirection: "row", gap: 2, marginTop: 2 },
  settlement: { color: colors.muted, fontSize: 7 },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 3 },
  legendText: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  gestureHint: { color: colors.gold, fontSize: 9, fontWeight: "800", marginBottom: 12, marginTop: -7, textAlign: "center" },
  panelHeader: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  flex: { flex: 1 },
  regionName: { color: colors.text, fontSize: 23, fontWeight: "900" },
  level: { color: colors.gold, marginTop: 2 },
  state: { color: colors.text, fontWeight: "800" },
  description: { color: colors.muted, lineHeight: 20, marginVertical: 9 },
  detail: { color: colors.text, marginTop: 6 },
  threat: { backgroundColor: "rgba(78, 30, 29, .72)", borderColor: colors.danger, borderRadius: 7, borderWidth: 1, color: "#ffc0b8", fontSize: 11, lineHeight: 16, marginTop: 9, padding: 8 },
  danger: { color: colors.danger, fontWeight: "800", marginTop: 8 },
  boss: { color: colors.gold, fontWeight: "700", marginTop: 8 },
  routeWarning: { color: colors.danger, fontSize: 12, lineHeight: 17, marginTop: 9 },
  travelReadiness: { borderRadius: 8, borderWidth: 1, marginTop: 10, padding: 9 },
  travelBlocked: { backgroundColor: "#25191a", borderColor: colors.danger },
  travelReady: { backgroundColor: "#16241c", borderColor: colors.green },
  travelReadyText: { color: colors.green, fontSize: 11, fontWeight: "900" },
  intelButton: { alignItems: "center", borderColor: colors.border, borderTopWidth: 1, marginTop: 12, paddingVertical: 11 },
  intelLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: .9 },
  intelBlock: { backgroundColor: colors.panel2, borderRadius: 8, marginTop: 2, padding: 9 },
  roadTitle: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 13 },
  roads: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  road: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 7, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  roadLocked: { opacity: .56 },
  roadName: { color: colors.text, fontSize: 10, fontWeight: "800" },
  roadNameLocked: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  buttons: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 13 },
  message: { color: colors.green, marginTop: 9 },
});
