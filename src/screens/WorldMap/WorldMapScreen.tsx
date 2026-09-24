import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, Panel, Portrait, SectionTitle, colors } from "../../components/ui";
import { REGIONS } from "../../data/world/regions";
import { SETTLEMENTS } from "../../data/world/settlements";
import { WORLD_ART } from "../../data/world/worldArt";
import { RACE_HOMELANDS } from "../../data/recruitment/raceHomelands";
import { RACES } from "../../data/races/races";
import type { GuildState } from "../../game/guild/types";
import { isBossAvailable, isRegionCompleted } from "../../game/world/regionService";
import { areRegionalThreatsUnlocked } from "../../game/world/regionalThreatService";
import { discoverRegionSettlements } from "../../game/world/worldService";
import { buyRations, canTravel, getRationBundleAmount, getRegionalTravelDays, getTravelRationCost } from "../../game/world/travelService";
import type { WorldEventDefinition } from "../../game/world/worldTypes";
import { WORLD_NAME } from "../../game/world/worldState";
import { mapChromeStyles } from "../../ui/worldMap";
import type { RandomSource } from "../../utils/random";
import { RegionEmblem, WorldServiceIcon, WorldStatusIcon } from "../../components/world/MapMarkerIcon";
import { isMatchingDoubleTap, type TapRecord } from "../../utils/doubleTap";
import { GAME_CONFIG } from "../../config/gameConfig";
import { getAvailableCampaignNodes } from "../../game/campaign/campaignService";
import { getCampaignNodeLocationRequirement, isAtCampaignLocation } from "../../game/campaign/campaignLocationService";
import { getCampaignTravelStep } from "../../game/campaign/campaignTravelService";
import { getDefaultTravelPartyHeroIds, getEligibleTravelHeroes, normalizeTravelPartyHeroIds, toggleTravelPartyHeroId, travelGuildPartyToRegion } from "../../game/world/travelPartyService";
import { QUESTS } from "../../data/quests/quests";
import { isQuestAvailableForGuild, isQuestBoardCategoryUnlocked } from "../../game/quests/questAvailability";
import { triggerTactileFeedback } from "../../ui/tactileFeedback";

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
  const [showTravelParty, setShowTravelParty] = useState(false);
  const [travelPartyIds, setTravelPartyIds] = useState<string[]>(() => getDefaultTravelPartyHeroIds(guild));
  const lastRegionTap = useRef<TapRecord | null>(null);
  const selected = REGIONS[selectedId]!;
  const unlocked = guild.world.unlockedRegionIds.includes(selectedId);
  const current = guild.world.currentRegionId === selectedId;
  const travelAllowed = canTravel(guild.world, selectedId);
  const homelandContacts = Object.values(RACE_HOMELANDS).filter((homeland) => homeland.regionId === selectedId);
  const averageLevel = guild.heroes.length ? guild.heroes.reduce((sum, hero) => sum + hero.level, 0) / guild.heroes.length : 0;
  const highestHeroLevel = Math.max(1, ...guild.heroes.map((hero) => hero.level));
  const regionalQuestIds = selected.questPoolIds.filter((id) => QUESTS[id]?.regionId === selectedId);
  const completedRegionQuests = regionalQuestIds.filter((id) => guild.world.completedQuestIds.includes(id)).length;
  const availableRegionalQuestId = regionalQuestIds.find((id) => {
    const quest = QUESTS[id];
    return Boolean(quest
      && !quest.hiddenFromQuestBoard
      && (quest.repeatable || !guild.world.completedQuestIds.includes(id))
      && isQuestBoardCategoryUnlocked(quest.questType, guild.world, highestHeroLevel)
      && isQuestAvailableForGuild(quest, guild.world, guild.heroes));
  });
  const threatsUnlocked = areRegionalThreatsUnlocked(guild.world);
  const selectedThreat = threatsUnlocked ? guild.world.regionThreat?.[selectedId] ?? 0 : 0;
  const nextCampaignNode = getAvailableCampaignNodes(guild.world)[0];
  const campaignRequirement = nextCampaignNode ? getCampaignNodeLocationRequirement(nextCampaignNode.id) : null;
  const campaignAtLocation = isAtCampaignLocation(guild.world, campaignRequirement);
  const campaignDestination = campaignRequirement ? ((campaignRequirement.settlementIds.length ? campaignRequirement.settlementIds.map((id) => SETTLEMENTS[id]?.name ?? id.replace(/_/g, " ")).join(" / ") + " · " : "") + (REGIONS[campaignRequirement.regionId]?.name ?? campaignRequirement.regionId.replace(/_/g, " "))) : null;
  const availableHeroes = getEligibleTravelHeroes(guild);
  const travelPartySize = travelPartyIds.length;
  useEffect(() => {
    setTravelPartyIds((currentIds) => {
      const normalized = normalizeTravelPartyHeroIds(guild, currentIds);
      return normalized.length ? normalized : getDefaultTravelPartyHeroIds(guild);
    });
  }, [guild.heroes]);
  let campaignTravelStep: ReturnType<typeof getCampaignTravelStep> | null = null;
  if (nextCampaignNode && travelPartySize > 0 && !campaignAtLocation) {
    try { campaignTravelStep = getCampaignTravelStep(guild, nextCampaignNode.id, travelPartySize); } catch { campaignTravelStep = null; }
  }
  const campaignRouteRegionId = campaignTravelStep?.kind === "region" ? campaignTravelStep.destinationRegionId : campaignRequirement?.regionId;
  const travelDays = current ? 0 : getRegionalTravelDays(guild.world.currentRegionId, selectedId);
  const rationCost = current || travelPartySize === 0 ? 0 : getTravelRationCost(travelDays, travelPartySize, guild.guildmaster);
  const travelBlocker = current ? null : !unlocked ? "Region locked by campaign progress." : !travelAllowed ? "No direct unlocked road from the current region." : !availableHeroes.length ? "No living, available heroes can form a travel party." : !travelPartySize ? "Select at least one hero for the journey." : guild.rations < rationCost ? `Need ${rationCost-guild.rations} more rations.` : null;

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
      const result = travelGuildPartyToRegion(guild, selectedId, travelPartyIds, random);
      const world = discoverRegionSettlements(result.guild.world, selectedId);
      updateGuild({ ...result.guild, world, recentPartyHeroIds: travelPartyIds });
      triggerTactileFeedback(guild.uiPreferences.tactileFeedback,"confirm");
      setMessage(`ARRIVED · ${selected.name} · Day ${guild.currentDay} → ${result.guild.currentDay} · Rations -${result.rationCost}${result.tier ? ` · ${result.tier.toUpperCase()} road event` : " · Safe journey"}`);
      if (result.event) openEvent(result.event);
    } catch (error) {
      triggerTactileFeedback(guild.uiPreferences.tactileFeedback,"warning");
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

      {nextCampaignNode && campaignRequirement ? <Panel style={[styles.campaignRoute, campaignAtLocation && styles.campaignRouteReady]}><Text style={campaignAtLocation ? styles.campaignRouteReadyLabel : styles.campaignRouteLabel}>{campaignAtLocation ? "✓ CAMPAIGN LOCATION REACHED" : "NEXT CAMPAIGN STOP"}</Text><Text style={styles.campaignRouteTitle}>{nextCampaignNode.title}</Text><Text style={styles.campaignRouteDestination}>{campaignDestination}</Text>{campaignTravelStep ? <View style={styles.nextLeg}><WorldStatusIcon id="campaign" size={24}/><Text style={styles.nextLegText}>NEXT LEG · {campaignTravelStep.label.toUpperCase()} · {campaignTravelStep.days}d · {campaignTravelStep.rationCost} rations</Text></View> : null}{!campaignAtLocation ? <ActionButton label={guild.world.currentRegionId === campaignRequirement.regionId ? "Open Target Region" : "Focus Next Leg on Map"} onPress={() => guild.world.currentRegionId === campaignRequirement.regionId ? openRegion(campaignRequirement.regionId) : setSelectedId(campaignRouteRegionId ?? campaignRequirement.regionId)} /> : null}</Panel> : null}

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
            const markerStatus = !isUnlocked ? "locked" : isCurrent ? "current" : completed ? "complete" : boss ? "boss" : "open";
            const campaignTarget = campaignRouteRegionId === region.id;
            const settlementDiscovered = region.settlementIds.some((id) => guild.world.discoveredSettlementIds.includes(id));
            const threatLevel = threatsUnlocked ? guild.world.regionThreat?.[region.id] ?? 0 : 0;
            const threatLabel = ["", "UNREST", "DANGER", "SEVERE", "CRISIS"][Math.max(0, Math.min(4, threatLevel))] ?? "";

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
                <View style={[styles.marker, isCurrent && styles.currentMarker, boss && styles.bossMarker]}><RegionEmblem regionId={region.id} status={markerStatus} size={38} campaign={campaignTarget} threat={threatLevel} /></View>
                <Text numberOfLines={1} style={styles.nodeName}>{region.name}</Text>
                <Text style={styles.nodeState}>{status}</Text>
                {campaignTarget && <Text style={styles.campaignBadge}>CAMPAIGN</Text>}{selectedRegion && <Text style={styles.nodeHint}>DOUBLE TAP · OPEN</Text>}
                {threatLevel > 0 && <Text style={[styles.threatBadge, threatLevel >= 4 && styles.threatCrisis]}>THREAT {threatLevel} · {threatLabel}</Text>}
                {settlementDiscovered && (selectedRegion || isCurrent) && <View style={styles.settlementRow}><WorldServiceIcon serviceId="settlement" size={14} /><Text style={styles.settlement}>{SETTLEMENTS[region.settlementIds[0]!]?.name}</Text></View>}
              </Pressable>
            );
          })}
        </ImageBackground>
        <View style={mapChromeStyles.legend}>
          <View style={styles.legendItem}><WorldStatusIcon id="current" size={16}/><Text style={styles.legendText}>CURRENT</Text></View>
          <View style={styles.legendItem}><WorldStatusIcon id="campaign" size={16}/><Text style={styles.legendText}>CAMPAIGN</Text></View>
          <View style={styles.legendItem}><WorldStatusIcon id="boss" size={16}/><Text style={styles.legendText}>BOSS</Text></View>
          <View style={styles.legendItem}><WorldStatusIcon id="locked" size={16}/><Text style={styles.legendText}>LOCKED</Text></View>
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
        <View style={styles.travelPartyHeader}><Text style={styles.roadTitle}>TRAVEL PARTY · {travelPartySize}/4</Text><Pressable accessibilityRole="button" accessibilityState={{expanded:showTravelParty}} style={({pressed})=>[styles.travelPartyEditButton,pressed&&styles.pressedControl]} onPress={() => setShowTravelParty((value) => !value)}><Text style={styles.travelPartyEdit}>{showTravelParty ? "DONE" : "EDIT"}</Text></Pressable></View>
        <Text style={styles.travelPartyNames}>{travelPartyIds.length ? travelPartyIds.map((id) => guild.heroes.find((hero) => hero.id === id)?.name).filter(Boolean).join(" · ") : "No heroes selected"}</Text>
        {showTravelParty && <View style={styles.travelPartyGrid}>{availableHeroes.map((hero) => { const selectedHero = travelPartyIds.includes(hero.id); const full = travelPartyIds.length >= 4 && !selectedHero; return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selectedHero, disabled: full }} disabled={full} key={hero.id} onPress={() => setTravelPartyIds((ids) => toggleTravelPartyHeroId(guild, ids, hero.id))} style={({pressed})=>[styles.travelHero, selectedHero && styles.travelHeroSelected, full && styles.travelHeroDisabled,pressed&&!full&&styles.pressedControl]}><Portrait hero={hero} size={30}/><View style={styles.flex}><Text numberOfLines={1} style={styles.travelHeroName}>{hero.name}</Text><Text style={styles.travelHeroMeta}>Lv {hero.level} · {hero.classId}</Text></View><Text style={selectedHero ? styles.travelHeroCheck : styles.travelHeroPlus}>{selectedHero ? "✓" : "+"}</Text></Pressable>; })}</View>}
        <Text style={styles.travelPartyNote}>Selected heroes determine ration cost and become the remembered party for road encounters.</Text>
        {!current&&<View style={[styles.travelReadiness,travelBlocker?styles.travelBlocked:styles.travelReady]}><Text style={travelBlocker?styles.routeWarning:styles.travelReadyText}>{travelBlocker?`TRAVEL BLOCKED · ${travelBlocker}`:`TRAVEL READY · ${travelDays} day${travelDays===1?"":"s"} · ${rationCost} rations · ${travelPartySize} heroes`}</Text></View>}
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showRegionIntel }} onPress={() => setShowRegionIntel((value) => !value)} style={({pressed})=>[styles.intelButton,pressed&&styles.pressedControl]}><Text style={styles.intelLabel}>{showRegionIntel ? "− HIDE" : "+ SHOW"} REGIONAL INTELLIGENCE</Text></Pressable>
        {showRegionIntel && <View style={styles.intelBlock}>
          <Text style={styles.detail}>Enemy factions: {selected.enemyFactionIds.join(", ") || "Unknown"}</Text>
          {homelandContacts.length > 0 && <Text style={styles.detail}>Recruitment homeland: {homelandContacts.map((homeland) => `${RACES[homeland.raceId].name} · ${homeland.locationName}`).join(", ")}</Text>}
          <Text style={styles.detail}>Possible quests and road encounters: {regionalQuestIds.length}</Text>
          <Text style={styles.detail}>Regional progress: {completedRegionQuests}/{regionalQuestIds.length} listed quests complete</Text>
          {selectedThreat > 0 && <Text style={styles.threat}>Regional threat {selectedThreat}/4 · {["", "Unrest", "Danger", "Severe", "Crisis"][selectedThreat] ?? "Danger"} · Delaying unresolved dangers can strengthen enemies and disrupt settlements.</Text>}
          {selected.bossQuestId && <Text style={styles.boss}>! Regional boss: {guild.world.completedQuestIds.includes(selected.bossQuestId) ? "Defeated" : "Available through campaign"}</Text>}
          <Text style={styles.roadTitle}>DIRECT ROADS</Text>
          <View style={styles.roads}>{selected.connectedRegionIds.map((regionId) => { const destination = REGIONS[regionId]!; const destinationUnlocked = guild.world.unlockedRegionIds.includes(regionId); return <Pressable accessibilityRole="button" key={regionId} onPress={() => { setSelectedId(regionId); setShowRegionIntel(false); }} style={({pressed})=>[styles.road, !destinationUnlocked && styles.roadLocked,pressed&&styles.pressedControl]}><RegionEmblem regionId={regionId} status={destinationUnlocked ? "open" : "locked"} size={22}/><Text style={destinationUnlocked ? styles.roadName : styles.roadNameLocked}>{destination.name}</Text></Pressable>; })}</View>
        </View>}
        <View style={styles.buttons}>
          <ActionButton label="Open Region Map" onPress={() => openRegion(selectedId)} />
          {!current && unlocked && <ActionButton guardMs={700} label={`Travel · ${travelDays}d · ${rationCost} rations`} disabled={Boolean(travelBlocker)} onPress={travel} />}
          {current && guild.world.currentSettlementId && <ActionButton guardMs={500} label={`Buy ${getRationBundleAmount(guild)} rations · ${GAME_CONFIG.rationBundleGoldCost}g`} onPress={() => { try { const before = guild.rations; const next = buyRations(guild); updateGuild(next); triggerTactileFeedback(guild.uiPreferences.tactileFeedback,"confirm"); setMessage(`Bought ${next.rations - before} rations.`); } catch (error) { triggerTactileFeedback(guild.uiPreferences.tactileFeedback,"warning"); setMessage(error instanceof Error ? error.message : "Purchase failed"); } }} />}
          {unlocked && availableRegionalQuestId && <ActionButton label="View Regional Quest" onPress={() => openQuest(availableRegionalQuestId)} />}
          <ActionButton label="Campaign" onPress={openCampaign} />
        </View>
        {message && <Text style={styles.message}>{message}</Text>}
      </Panel>

      <SectionTitle>DISCOVERED SETTLEMENTS</SectionTitle>
      <View style={styles.settlementList}>{guild.world.discoveredSettlementIds.map((id) => <View key={id} style={styles.settlementChip}><WorldServiceIcon serviceId="settlement" size={22}/><Text style={styles.settlementChipText}>{SETTLEMENTS[id]?.name ?? id}</Text></View>)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 44 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginTop: 7 },
  subtitle: { color: colors.gold, marginTop: 3 },
  overview: { flexDirection: "row", gap: 7, marginTop: 13 },
  overviewStat: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flex: 1, paddingHorizontal: 4, paddingVertical: 9 },
  overviewValue: { color: colors.text, fontSize: 18, fontWeight: "900" },
  overviewLabel: { color: colors.gold, fontSize: 7, fontWeight: "900", letterSpacing: .6, marginTop: 2, textAlign: "center" },
  mapShade: { backgroundColor: "rgba(4, 11, 17, 0.10)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  // mapPosition identifies the center of the flag, not the top-left of its label.
  node: { alignItems: "center", backgroundColor: "transparent", borderWidth: 0, marginLeft: -50, marginTop: -19, minHeight: 75, paddingHorizontal: 5, position: "absolute", width: 100 },
  lockedNode: { opacity: 0.78 },
  currentNode: { opacity: 1 },
  selectedNode: { transform: [{ scale: 1.05 }] },
  pressedNode: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  marker: { alignItems: "center", backgroundColor: "#374449", borderColor: "#d4c59d", borderRadius: 4, borderWidth: 1, height: 38, justifyContent: "center", width: 38 },
  currentMarker: { backgroundColor: "#27633e", borderColor: colors.green },
  bossMarker: { backgroundColor: "#762f29", borderColor: colors.danger },
  markerText: { color: colors.text, fontSize: 11, fontWeight: "900", lineHeight: 14 },
  nodeName: { color: colors.text, fontSize: 11, fontWeight: "900", marginTop: 3, textAlign: "center", textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  nodeState: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 0.7, marginTop: 2, textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  nodeHint: { color: colors.green, fontSize: 6, fontWeight: "900", letterSpacing: .4, marginTop: 2 },
  threatBadge: { backgroundColor: "rgba(113, 38, 34, .95)", borderRadius: 3, color: "#ffb0a8", fontSize: 6, fontWeight: "900", marginTop: 2, overflow: "hidden", paddingHorizontal: 3, paddingVertical: 1 }, threatCrisis: { backgroundColor: "rgba(135, 22, 22, .98)", borderColor: "#ff6b5f", borderWidth: 1 }, campaignBadge: { backgroundColor: "rgba(76,55,19,.96)", borderColor: "#e8c06b", borderRadius: 3, borderWidth: 1, color: "#f4d78e", fontSize: 6, fontWeight: "900", marginTop: 2, overflow: "hidden", paddingHorizontal: 4, paddingVertical: 1 },
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
  campaignRoute: { borderColor: colors.gold, gap: 6, marginBottom: 12 }, nextLeg: { alignItems: "center", backgroundColor: colors.panel2, borderRadius: 7, flexDirection: "row", gap: 7, padding: 7 }, nextLegText: { color: colors.gold, flex: 1, fontSize: 9, fontWeight: "900", lineHeight: 14 }, campaignRouteReady: { borderColor: colors.green }, campaignRouteLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, campaignRouteReadyLabel: { color: colors.green, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, campaignRouteTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, campaignRouteDestination: { color: colors.muted, fontSize: 12, marginBottom: 4 }, description: { color: colors.muted, lineHeight: 20, marginVertical: 9 },
  detail: { color: colors.text, marginTop: 6 },
  threat: { backgroundColor: "rgba(78, 30, 29, .72)", borderColor: colors.danger, borderRadius: 7, borderWidth: 1, color: "#ffc0b8", fontSize: 11, lineHeight: 16, marginTop: 9, padding: 8 },
  danger: { color: colors.danger, fontWeight: "800", marginTop: 8 },
  boss: { color: colors.gold, fontWeight: "700", marginTop: 8 },
  routeWarning: { color: colors.danger, fontSize: 12, lineHeight: 17, marginTop: 9 },
  travelPartyHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 }, travelPartyEditButton:{alignItems:"center",justifyContent:"center",minHeight:44,paddingHorizontal:4}, travelPartyEdit: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: .7 }, travelPartyNames: { color: colors.text, fontSize: 11, lineHeight: 16, marginTop: 5 }, travelPartyNote: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 5 }, travelPartyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }, travelHero: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 6, minHeight:44, padding: 6, width: "48%" }, travelHeroSelected: { borderColor: colors.gold }, travelHeroDisabled: { opacity: .42 }, travelHeroName: { color: colors.text, fontSize: 10, fontWeight: "900" }, travelHeroMeta: { color: colors.muted, fontSize: 8, marginTop: 1 }, travelHeroCheck: { color: colors.green, fontSize: 15, fontWeight: "900" }, travelHeroPlus: { color: colors.gold, fontSize: 15, fontWeight: "900" },
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
  settlementList: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 6 }, settlementChip: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 7, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 7, paddingVertical: 5 }, settlementChipText: { color: colors.text, fontSize: 9, fontWeight: "800" },
  pressedControl:{opacity:.76,transform:[{translateY:1}]}
});
