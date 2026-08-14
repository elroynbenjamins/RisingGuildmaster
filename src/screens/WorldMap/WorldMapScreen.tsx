import React, { useState } from "react";
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
import { canTravel, travelToRegion } from "../../game/world/travelService";
import type { WorldEventDefinition } from "../../game/world/worldTypes";
import { WORLD_NAME } from "../../game/world/worldState";
import { mapChromeStyles } from "../../ui/worldMap";
import type { RandomSource } from "../../utils/random";
import { GameIcon } from "../../components/icons/GameIcon";

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
  const selected = REGIONS[selectedId]!;
  const unlocked = guild.world.unlockedRegionIds.includes(selectedId);
  const current = guild.world.currentRegionId === selectedId;
  const travelAllowed = canTravel(guild.world, selectedId);
  const homelandContacts = Object.values(RACE_HOMELANDS).filter((homeland) => homeland.regionId === selectedId);
  const averageLevel = guild.heroes.length ? guild.heroes.reduce((sum, hero) => sum + hero.level, 0) / guild.heroes.length : 0;

  const travel = () => {
    try {
      const result = travelToRegion(guild.world, selectedId, random);
      const world = discoverRegionSettlements(result.state, selectedId);
      updateGuild({ ...guild, world });
      setMessage(`Arrived in ${selected.name}.`);
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
                accessibilityLabel={`${region.name}, ${status.toLowerCase()}`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedRegion }}
                key={region.id}
                onPress={() => setSelectedId(region.id)}
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
                {settlementDiscovered && <View style={styles.settlementRow}><GameIcon id="settlement" size={13} framed={false} /><Text style={styles.settlement}>{SETTLEMENTS[region.settlementIds[0]!]?.name}</Text></View>}
              </Pressable>
            );
          })}
        </ImageBackground>
        <View style={mapChromeStyles.legend}>
          <Text style={styles.legendText}>CURRENT</Text><Text style={styles.legendText}>BOSS</Text><Text style={styles.legendText}>LOCKED</Text>
        </View>
      </View>

      <Panel>
        <View style={styles.panelHeader}>
          <View style={styles.flex}><Text style={styles.regionName}>{selected.name}</Text><Text style={styles.level}>Recommended level {selected.recommendedLevelMin}–{selected.recommendedLevelMax}</Text></View>
          <Text style={styles.state}>{!unlocked ? "Locked" : current ? "Current" : "Unlocked"}</Text>
        </View>
        <Text style={styles.description}>{selected.description}</Text>
        {unlocked && averageLevel > 0 && averageLevel < selected.recommendedLevelMin && <Text style={styles.danger}>⚠ DANGER: Party level below recommended range.</Text>}
        <Text style={styles.detail}>Enemy factions: {selected.enemyFactionIds.join(", ") || "Unknown"}</Text>
        <Text style={styles.detail}>Settlement: {selected.settlementIds.map((id) => SETTLEMENTS[id]!.name).join(", ")}</Text>
        {homelandContacts.length > 0 && <Text style={styles.detail}>Recruitment homeland: {homelandContacts.map((homeland) => `${RACES[homeland.raceId].name} · ${homeland.locationName}`).join(", ")}</Text>}
        <Text style={styles.detail}>Available contracts: {selected.questPoolIds.length}</Text>
        {selected.bossQuestId && <Text style={styles.boss}>! Regional boss: {guild.world.completedQuestIds.includes(selected.bossQuestId) ? "Defeated" : "Available through campaign"}</Text>}
        {!current && unlocked && !travelAllowed && <Text style={styles.routeWarning}>No direct road from your current region. Travel through a connected region first.</Text>}
        <View style={styles.buttons}>
          <ActionButton label="Open Region Map" onPress={() => openRegion(selectedId)} />
          {!current && unlocked && <ActionButton label="Travel" disabled={!travelAllowed} onPress={travel} />}
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
  mapShade: { backgroundColor: "rgba(4, 11, 17, 0.10)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  node: { alignItems: "center", backgroundColor: "rgba(25, 34, 36, 0.92)", borderColor: "#9b9278", borderRadius: 4, borderWidth: 2, marginLeft: -50, marginTop: -34, minHeight: 67, padding: 5, position: "absolute", width: 100 },
  lockedNode: { backgroundColor: "rgba(25, 29, 31, 0.88)", borderColor: "#666b69", opacity: 0.82 },
  currentNode: { borderColor: colors.green, borderWidth: 3 },
  selectedNode: { backgroundColor: "rgba(72, 57, 29, 0.96)", borderColor: colors.gold, borderWidth: 3 },
  pressedNode: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  marker: { alignItems: "center", backgroundColor: "#374449", borderColor: "#d4c59d", borderRadius: 2, borderWidth: 1, height: 18, justifyContent: "center", marginTop: -14, width: 18 },
  currentMarker: { backgroundColor: "#27633e", borderColor: colors.green },
  bossMarker: { backgroundColor: "#762f29", borderColor: colors.danger },
  markerText: { color: colors.text, fontSize: 11, fontWeight: "900", lineHeight: 14 },
  nodeName: { color: colors.text, fontSize: 11, fontWeight: "900", marginTop: 3, textAlign: "center" },
  nodeState: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 0.7, marginTop: 2 },
  settlementRow: { alignItems: "center", flexDirection: "row", gap: 2, marginTop: 2 },
  settlement: { color: colors.muted, fontSize: 7 },
  legendText: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  panelHeader: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  flex: { flex: 1 },
  regionName: { color: colors.text, fontSize: 23, fontWeight: "900" },
  level: { color: colors.gold, marginTop: 2 },
  state: { color: colors.text, fontWeight: "800" },
  description: { color: colors.muted, lineHeight: 20, marginVertical: 9 },
  detail: { color: colors.text, marginTop: 6 },
  danger: { color: colors.danger, fontWeight: "800", marginTop: 8 },
  boss: { color: colors.gold, fontWeight: "700", marginTop: 8 },
  routeWarning: { color: colors.danger, fontSize: 12, lineHeight: 17, marginTop: 9 },
  buttons: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 13 },
  message: { color: colors.green, marginTop: 9 },
});
