import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, Panel, colors } from "../../components/ui";
import { getRegionLocations } from "../../data/world/regionLocations";
import { REGIONS } from "../../data/world/regions";
import { SETTLEMENTS } from "../../data/world/settlements";
import { REGION_MAP_ART } from "../../data/world/worldArt";
import { REGION_LORE } from "../../data/world/regionLore";
import type { RegionLocationDefinition, RegionLoreDefinition, WorldState } from "../../game/world/worldTypes";
import { useGuild } from "../../state/GuildContext";
import { mapChromeStyles } from "../../ui/worldMap";
import { LocationMarkerIcon, WorldServiceIcon } from "../../components/world/MapMarkerIcon";
import { getAvailableCampaignNodes } from "../../game/campaign/campaignService";
import { getCampaignNodeLocationRequirement } from "../../game/campaign/campaignLocationService";
import { visitSettlementWithEvent } from "../../game/world/travelService";
import { QUESTS } from "../../data/quests/quests";
import { CAMPAIGN_NODES } from "../../data/campaign/chapter1";
import type { RandomSource } from "../../utils/random";
import type { WorldEventDefinition } from "../../game/world/worldTypes";
import { isSettlementAvailable } from "../../game/world/regionalThreatService";
import { needsStarterRoadEncounter, starterBramblewayEvent } from "../../game/onboarding/starterJourneyService";

export function RegionMapScreen({ regionId, focusQuestId, focusSettlementId, focusCampaignNodeId, onBack, openQuest, openCampaign, openService, random, openEvent }: { regionId: string; focusQuestId?: string; focusSettlementId?: string; focusCampaignNodeId?: string; onBack(): void; openQuest(questId: string): void; openCampaign(): void; openService(serviceId: string): void; random: RandomSource; openEvent(event: WorldEventDefinition): void }) {
  const { guild, updateGuild } = useGuild();
  const region = REGIONS[regionId];
  const locations = useMemo(() => getRegionLocations(regionId), [regionId]);
  const focusedQuest = focusQuestId ? QUESTS[focusQuestId] : undefined;
  const campaignFocusQuestId = focusCampaignNodeId ? CAMPAIGN_NODES[focusCampaignNodeId]?.questId : undefined;
  const focusedLocation = locations.find((entry) => Boolean((focusQuestId && entry.questId === focusQuestId) || (campaignFocusQuestId && entry.questId === campaignFocusQuestId)))
    ?? locations.find((entry) => Boolean(entry.settlementId && (entry.settlementId === focusSettlementId || focusedQuest?.settlementIds?.includes(entry.settlementId))));
  const [selectedId, setSelectedId] = useState(focusedLocation?.id ?? locations[0]?.id ?? "");
  useEffect(() => { setSelectedId(focusedLocation?.id ?? locations[0]?.id ?? ""); }, [regionId, focusQuestId, focusSettlementId, focusCampaignNodeId]);
  const [showChronicle, setShowChronicle] = useState(false);
  const [travelMessage, setTravelMessage] = useState<string>();
  const selected = locations.find((entry) => entry.id === selectedId) ?? locations[0];
  const nextCampaignNode = getAvailableCampaignNodes(guild.world)[0];
  const campaignRequirement = nextCampaignNode ? getCampaignNodeLocationRequirement(nextCampaignNode.id) : null;
  const campaignTargetsRegion = campaignRequirement?.regionId === regionId;
  const isCampaignTargetLocation = (entry: RegionLocationDefinition) => Boolean(campaignTargetsRegion && (campaignRequirement?.settlementIds.length ? entry.settlementId && campaignRequirement.settlementIds.includes(entry.settlementId) : nextCampaignNode?.questId && entry.questId === nextCampaignNode.questId));
  const campaignDestination = campaignTargetsRegion ? (campaignRequirement?.settlementIds.length ? campaignRequirement.settlementIds.map((id) => SETTLEMENTS[id]?.name ?? id.replace(/_/g, " ")).join(" / ") : "This region") : null;
  const regionUnlocked = guild.world.unlockedRegionIds.includes(regionId);
  const caravanAlarmPending = regionId === "greenveil" && needsStarterRoadEncounter(guild);
  const guidedQuest = Boolean(focusedQuest && focusedQuest.regionId === regionId && !guild.world.completedQuestIds.includes(focusedQuest.id) && regionUnlocked);
  const questPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!guidedQuest) { questPulse.setValue(1); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(questPulse, { toValue: .5, duration: 680, useNativeDriver: true }),
      Animated.timing(questPulse, { toValue: 1, duration: 680, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [guidedQuest, questPulse]);
  const visitLocation = (settlementId: string) => {
    try {
      const partySize = Math.max(1, guild.recentPartyHeroIds.length || Math.min(4, guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0).length));
      const result = visitSettlementWithEvent(guild, settlementId, partySize, random);
      updateGuild(result.guild);
      setTravelMessage(`Reached ${SETTLEMENTS[settlementId]?.name}. 1 day passed.${result.event ? " A road encounter was discovered." : ""}`);
      if (result.event) openEvent(result.event);
    } catch (error) { setTravelMessage(error instanceof Error ? error.message : "Local travel failed"); }
  };
  if (!region || !REGION_MAP_ART[regionId]) return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.title}>Unknown Region</Text></ScrollView>;
  const regionLore = REGION_LORE[regionId];
  const regionLoreDiscovered = guild.world.worldFlags[`lore_${regionId}`] === true;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={onBack} />
      <View style={styles.heading}>
        <View style={styles.flex}><Text style={styles.eyebrow}>REGIONAL MAP</Text><Text style={styles.title}>{region.name}</Text><Text style={styles.subtitle}>Recommended level {region.recommendedLevelMin}–{region.recommendedLevelMax} · {locations.length} mapped locations</Text></View>
        <Text style={regionUnlocked ? styles.open : styles.locked}>{regionUnlocked ? "OPEN" : "LOCKED"}</Text>
      </View>

      {caravanAlarmPending ? <Panel style={styles.focusGuide}>
        <Text style={styles.focusGuideLabel}>URGENT OBJECTIVE · BRAMBLEFORD</Text>
        <Text style={styles.focusGuideTitle}>Caravan Under Attack</Text>
        <Text style={styles.focusGuideNote}>The Brambleway alarm is still active. Resume the encounter here without another travel day or ration cost.</Text>
        <ActionButton label="Defend Caravan" onPress={() => openEvent(starterBramblewayEvent())} />
      </Panel> : null}
      {focusedQuest && focusedQuest.regionId === regionId && focusedLocation ? <Panel style={styles.focusGuide}>
        <Text style={styles.focusGuideLabel}>NEXT STEP · {focusedLocation.name.toUpperCase()}</Text>
        <Text style={styles.focusGuideTitle}>{focusedQuest.name}</Text>
        <Text style={styles.focusGuideNote}>{guild.world.currentSettlementId === focusedLocation.settlementId ? "You are at the quest location. Open the quest to prepare your heroes." : "The correct location is selected on the map. Open the quest for its requirements, or travel to the settlement first."}</Text>
        <Animated.View style={{ opacity: guidedQuest ? questPulse : 1 }}><ActionButton label={guild.world.completedQuestIds.includes(focusedQuest.id) ? "Review Quest" : "Open Quest"} disabled={!regionUnlocked} onPress={() => openQuest(focusedQuest.id)} /></Animated.View>
        {focusedLocation.settlementId && guild.world.currentRegionId === regionId && guild.world.currentSettlementId !== focusedLocation.settlementId && regionUnlocked ? <ActionButton label={`Walk to ${focusedLocation.name} · 1 day`} onPress={() => visitLocation(focusedLocation.settlementId!)} /> : null}
      </Panel> : null}
      {focusCampaignNodeId && !focusedQuest && focusedLocation ? <Panel style={styles.focusGuide}>
        <Text style={styles.focusGuideLabel}>CAMPAIGN DESTINATION · {focusedLocation.name.toUpperCase()}</Text>
        <Text style={styles.focusGuideNote}>{!focusedLocation.settlementId ? "The campaign landmark is selected. Return to the campaign to continue the story." : guild.world.currentSettlementId === focusedLocation.settlementId ? "Destination reached. Return to the campaign to continue the story." : "The required location is selected. Travel to this settlement before continuing the story."}</Text>
        {focusedLocation.settlementId && guild.world.currentRegionId === regionId && guild.world.currentSettlementId !== focusedLocation.settlementId && regionUnlocked ? <ActionButton label={`Walk to ${focusedLocation.name} · 1 day`} onPress={() => visitLocation(focusedLocation.settlementId!)} /> : <ActionButton label="Return to Campaign" onPress={openCampaign} />}
      </Panel> : null}

      {campaignTargetsRegion && nextCampaignNode ? <Panel style={styles.campaignGuide}><Text style={styles.campaignGuideLabel}>CAMPAIGN DESTINATION</Text><Text style={styles.campaignGuideTitle}>{nextCampaignNode.title}</Text><Text style={styles.campaignGuideDestination}>{campaignDestination}</Text></Panel> : null}

      <View style={mapChromeStyles.frame}>
        <ImageBackground source={REGION_MAP_ART[regionId]} resizeMode="cover" style={mapChromeStyles.canvas} imageStyle={mapChromeStyles.image}>
          <View pointerEvents="none" style={styles.mapShade} />
          {locations.map((entry) => {
            const active = entry.id === selected?.id;
            const settlementKnown = entry.settlementId ? guild.world.discoveredSettlementIds.includes(entry.settlementId) : true;
            const completed = entry.questId ? guild.world.completedQuestIds.includes(entry.questId) : false;
            const campaignTarget = isCampaignTargetLocation(entry);
            return (
              <Pressable
                accessibilityLabel={`${entry.name}, ${entry.type}`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={entry.id}
                onPress={() => setSelectedId(entry.id)}
                style={({ pressed }) => [
                  styles.marker,
                  { left: `${entry.mapPosition.x * 100}%`, top: `${entry.mapPosition.y * 100}%` },
                  !settlementKnown && styles.unknownMarker,
                  completed && styles.completedMarker,
                  active && styles.activeMarker,
                  pressed && styles.pressedMarker,
                ]}
              >
                <LocationMarkerIcon type={entry.type} size={24} completed={completed} campaign={campaignTarget || entry.id === focusedLocation?.id} />
                <Text numberOfLines={2} style={[styles.markerName, active && styles.activeMarkerName]}>
                  {entry.name}
                </Text>{campaignTarget ? <Text style={styles.campaignMarkerText}>CAMPAIGN</Text> : entry.id === focusedLocation?.id ? <Text style={styles.campaignMarkerText}>OBJECTIVE</Text> : null}
              </Pressable>
            );
          })}
          {!regionUnlocked && <View pointerEvents="none" style={styles.fog}><Text style={styles.fogText}>REGION LOCKED · MAP INFORMATION ONLY</Text></View>}
        </ImageBackground>
        <View style={mapChromeStyles.legend}>
          <View style={styles.legendItem}><LocationMarkerIcon type="city" size={17}/><Text style={styles.legendText}>CITY</Text></View>
          <View style={styles.legendItem}><LocationMarkerIcon type="homeland" size={17}/><Text style={styles.legendText}>HOMELAND</Text></View>
          <View style={styles.legendItem}><LocationMarkerIcon type="dungeon" size={17}/><Text style={styles.legendText}>DUNGEON</Text></View>
          <View style={styles.legendItem}><LocationMarkerIcon type="landmark" size={17}/><Text style={styles.legendText}>LANDMARK</Text></View>
        </View>
      </View>

      {selected && <LocationPanel campaignTarget={isCampaignTargetLocation(selected)} focusQuestId={focusQuestId} location={selected} regionUnlocked={regionUnlocked} discoveredSettlementIds={guild.world.discoveredSettlementIds} completedQuestIds={guild.world.completedQuestIds} currentSettlementId={guild.world.currentSettlementId} world={guild.world} openQuest={openQuest} openService={openService} onVisit={visitLocation} />}
      {travelMessage && <Text style={styles.travelMessage}>{travelMessage}</Text>}
      {regionLore && <RegionChronicle lore={regionLore} unlocked={regionLoreDiscovered} expanded={showChronicle} toggle={() => setShowChronicle((value) => !value)} />}
    </ScrollView>
  );
}

function RegionChronicle({ lore, unlocked, expanded, toggle }: { lore: RegionLoreDefinition; unlocked: boolean; expanded: boolean; toggle(): void }) {
  return (
    <Panel style={styles.chronicle}>
      <Text style={styles.chronicleEyebrow}>REGIONAL CHRONICLE</Text>
      <Text style={styles.chronicleTitle}>{lore.epithet}</Text>
      <Text style={styles.chronicleText}>{lore.overview}</Text>
      {!unlocked && <Text style={styles.lockedNote}>Travel to this region to unlock its complete history, culture, customs, and Wardstone records.</Text>}
      {unlocked && <ActionButton label={expanded ? "Close Chronicle" : "Read Full Chronicle"} onPress={toggle} />}
      {unlocked && expanded && <View style={styles.chronicleBody}>
        <LoreSection title="HISTORY" text={lore.history} />
        <LoreSection title="PEOPLE & CULTURE" text={lore.peopleAndCulture} />
        <LoreSection title="TRADE & CRAFT" text={lore.tradeAndCraft} />
        <LoreSection title="WARDSTONE LEGACY" text={lore.wardstoneLegacy} />
        <LoreSection title="TRAVELER'S NOTES" text={lore.travelNotes} />
        <Text style={styles.loreHeading}>CUSTOMS</Text>
        {lore.customs.map((custom) => <Text key={custom} style={styles.loreList}>◆ {custom}</Text>)}
        <Text style={styles.loreHeading}>LOCAL SAYINGS</Text>
        {lore.sayings.map((saying) => <Text key={saying} style={styles.saying}>“{saying}”</Text>)}
      </View>}
    </Panel>
  );
}

function LoreSection({ title, text }: { title: string; text: string }) {
  return <View><Text style={styles.loreHeading}>{title}</Text><Text style={styles.chronicleText}>{text}</Text></View>;
}

function LocationPanel({ location, campaignTarget, focusQuestId, regionUnlocked, discoveredSettlementIds, completedQuestIds, currentSettlementId, world, openQuest, openService, onVisit }: { location: RegionLocationDefinition; campaignTarget: boolean; focusQuestId?: string; regionUnlocked: boolean; discoveredSettlementIds: string[]; completedQuestIds: string[]; currentSettlementId: string | null; world: WorldState; openQuest(questId: string): void; openService(serviceId: string): void; onVisit(settlementId: string): void }) {
  const settlement = location.settlementId ? SETTLEMENTS[location.settlementId] : undefined;
  const localQuestIds = settlement?.questIds.filter((questId) => QUESTS[questId]?.questType !== "contract") ?? [];
  const associatedQuestId = focusQuestId && (location.questId === focusQuestId || settlement?.questIds.includes(focusQuestId)) ? focusQuestId : location.questId;
  const associatedQuest = associatedQuestId ? QUESTS[associatedQuestId] : undefined;
  const isTravelOnlyEncounter = associatedQuest?.questType === "contract";
  const discovered = settlement ? discoveredSettlementIds.includes(settlement.id) : true;
  const questComplete = associatedQuestId ? completedQuestIds.includes(associatedQuestId) : false;
  const interactiveServiceIds = new Set(["temple", "healer", "training_grounds", "recruitment", "quest_board", "guild_hall", "guild_registry"]);
  const settlementAvailable = !settlement || isSettlementAvailable(world, settlement.id);
  const localServicesActive = Boolean(settlement && currentSettlementId === settlement.id && regionUnlocked && settlementAvailable);
  return (
    <Panel style={styles.panel}>
      <View style={styles.locationHeader}><LocationMarkerIcon type={location.type} size={42} campaign={campaignTarget} /><View style={styles.flex}><Text style={styles.locationName}>{location.name}</Text><Text style={styles.locationType}>{location.type.toUpperCase()}{location.recommendedLevel ? ` · RECOMMENDED LEVEL ${location.recommendedLevel}` : ""}</Text></View><Text style={discovered ? styles.known : styles.unknown}>{discovered ? "KNOWN" : "UNDISCOVERED"}</Text></View>
      {campaignTarget ? <Text style={styles.campaignLocationBadge}>NEXT CAMPAIGN LOCATION</Text> : null}<Text style={styles.description}>{location.description}</Text>
      {settlement && <><Text style={styles.label}>SERVICES</Text><View style={styles.serviceGrid}>{settlement.serviceIds.map((serviceId) => { const interactive = localServicesActive && interactiveServiceIds.has(serviceId); const chip = <View style={[styles.serviceChip, interactive && styles.serviceChipActive, !localServicesActive && styles.serviceChipRemote]}><WorldServiceIcon serviceId={serviceId} size={24}/><Text style={styles.serviceName}>{pretty(serviceId)}</Text>{interactive ? <Text style={styles.serviceOpen}>OPEN</Text> : null}</View>; return interactive ? <Pressable accessibilityRole="button" key={serviceId} onPress={() => openService(serviceId)} style={({pressed})=>pressed&&styles.pressedControl}>{chip}</Pressable> : <View key={serviceId}>{chip}</View>; })}</View>{!settlementAvailable ? <Text style={styles.lockedNote}>CRISIS CLOSED · Local services are unavailable until the regional threat is resolved.</Text> : !localServicesActive ? <Text style={styles.serviceHint}>Travel to this settlement to use its local services.</Text> : null}</>}
      {settlement && regionUnlocked && <ActionButton label={!settlementAvailable ? "Crisis Closed" : currentSettlementId === settlement.id ? "Current Location" : "Walk Here · 1 day"} disabled={!settlementAvailable || currentSettlementId === settlement.id} onPress={() => onVisit(settlement.id)} />}
      {settlement && localQuestIds.length > 0 && <><Text style={styles.label}>LOCAL QUESTS</Text><Text style={styles.services}>{localQuestIds.map(pretty).join(" · ")}</Text></>}
      {associatedQuestId && !isTravelOnlyEncounter && <View style={styles.questRow}><View style={styles.flex}><Text style={styles.label}>ASSOCIATED QUEST</Text><Text style={questComplete ? styles.complete : styles.questName}>{associatedQuest?.name ?? pretty(associatedQuestId)}{questComplete ? " · Complete" : ""}</Text></View><ActionButton label={questComplete ? "Review" : "Open Quest"} disabled={!regionUnlocked} onPress={() => openQuest(associatedQuestId!)} /></View>}
      {isTravelOnlyEncounter && <Text style={styles.lockedNote}>ROAD ENCOUNTER · This opportunity can be discovered while travelling through the region.</Text>}
      {!regionUnlocked && <Text style={styles.lockedNote}>Unlock and travel to this region before beginning its quests or using local services.</Text>}
    </Panel>
  );
}

function pretty(value: string): string { return value.split("_").map((word) => word[0]!.toUpperCase() + word.slice(1)).join(" "); }

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 44 },
  heading: { alignItems: "flex-start", flexDirection: "row", gap: 8, marginTop: 7 },
  flex: { flex: 1 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginTop: 2 },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  open: { color: colors.green, fontSize: 10, fontWeight: "900" },
  locked: { color: colors.danger, fontSize: 10, fontWeight: "900" },
  mapShade: { backgroundColor: "rgba(3, 9, 14, .08)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  // The coordinate is the center of the 18px map icon; the label flows below it.
  marker: { alignItems: "center", backgroundColor: "transparent", marginLeft: -36, marginTop: -12, minHeight: 46, paddingHorizontal: 3, position: "absolute", width: 72 },
  unknownMarker: { opacity: .78 },
  completedMarker: { opacity: 1 },
  activeMarker: { backgroundColor:"rgba(216,173,92,.16)", borderColor:colors.gold, borderRadius:8, borderWidth:1, transform: [{ scale: 1.08 }] },
  pressedMarker: { opacity: .7 },
  markerIcon: { color: colors.gold, fontSize: 12, fontWeight: "900", lineHeight: 13 },
  markerName: { color: colors.text, fontSize: 7, fontWeight: "900", lineHeight: 9, textAlign: "center", textShadowColor: "#050707", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }, campaignMarkerText: { backgroundColor: "rgba(79,57,17,.92)", borderRadius: 2, color: "#f0cd79", fontSize: 5, fontWeight: "900", marginTop: 1, overflow: "hidden", paddingHorizontal: 2 },
  activeMarkerName: { color: colors.gold },
  fog: { alignItems: "center", backgroundColor: "rgba(12, 17, 20, .34)", bottom: 0, justifyContent: "flex-end", left: 0, paddingBottom: 5, position: "absolute", right: 0, top: 0 },
  fogText: { backgroundColor: "rgba(12, 17, 20, .9)", color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: .6, padding: 4 },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 3 }, legendText: { color: colors.muted, fontSize: 7, fontWeight: "900" },
  focusGuide: { borderColor: colors.gold, gap: 6, marginBottom: 10 }, focusGuideLabel: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: .9 }, focusGuideTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, focusGuideNote: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  campaignGuide: { borderColor: colors.gold, gap: 5, marginBottom: 10 }, campaignGuideLabel: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 }, campaignGuideTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, campaignGuideDestination: { color: colors.muted, fontSize: 11 }, panel: { borderColor: "#4a5857" },
  locationHeader: { alignItems: "center", flexDirection: "row", gap: 9 },
  locationIcon: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderRadius: 4, borderWidth: 1, height: 34, justifyContent: "center", width: 34 },
  locationIconText: { color: colors.gold, fontSize: 17, fontWeight: "900" },
  locationName: { color: colors.text, fontSize: 20, fontWeight: "900" },
  locationType: { color: colors.gold, fontSize: 9, fontWeight: "900", marginTop: 2 },
  known: { color: colors.green, fontSize: 8, fontWeight: "900" },
  unknown: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  campaignLocationBadge: { alignSelf: "flex-start", backgroundColor: "#49391e", borderColor: colors.gold, borderRadius: 5, borderWidth: 1, color: "#f0cf83", fontSize: 8, fontWeight: "900", letterSpacing: .7, marginTop: 10, overflow: "hidden", paddingHorizontal: 6, paddingVertical: 3 }, description: { color: colors.muted, lineHeight: 20, marginTop: 10 },
  label: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 11 },
  services: { color: colors.text, fontSize: 11, lineHeight: 17, marginTop: 4 },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }, serviceChip: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 5, minHeight: 36, paddingHorizontal: 7, paddingVertical: 5 }, serviceChipActive: { backgroundColor:"rgba(121,184,135,.12)", borderColor: colors.green }, serviceChipRemote: { opacity: .58 }, serviceName: { color: colors.text, fontSize: 9, fontWeight: "800" }, serviceOpen: { color: colors.green, fontSize: 7, fontWeight: "900", letterSpacing: .6 }, serviceHint: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 5 },
  questRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: 10, marginTop: 12, paddingTop: 3 },
  questName: { color: colors.text, fontSize: 12, fontWeight: "800", marginTop: 3 },
  complete: { color: colors.green, fontSize: 12, fontWeight: "800", marginTop: 3 },
  lockedNote: { color: colors.danger, fontSize: 11, lineHeight: 16, marginTop: 10 },
  travelMessage: { color: colors.green, fontSize: 11, marginTop: 8 },
  chronicle: { borderColor: colors.gold, marginTop: 12 },
  chronicleEyebrow: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  chronicleTitle: { color: colors.text, fontSize: 20, fontWeight: "900", marginBottom: 7, marginTop: 3 },
  chronicleText: { color: colors.muted, lineHeight: 20, marginBottom: 10 },
  chronicleBody: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 12, paddingTop: 2 },
  loreHeading: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.2, marginBottom: 5, marginTop: 13 },
  loreList: { color: colors.text, fontSize: 11, lineHeight: 17, marginBottom: 5 },
  saying: { borderLeftColor: colors.gold, borderLeftWidth: 2, color: colors.text, fontStyle: "italic", lineHeight: 19, marginBottom: 7, paddingLeft: 8 },
  pressedControl:{opacity:.76,transform:[{translateY:1}]}
});
