import React, { useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, Panel, colors } from "../../components/ui";
import { getRegionLocations } from "../../data/world/regionLocations";
import { REGIONS } from "../../data/world/regions";
import { SETTLEMENTS } from "../../data/world/settlements";
import { REGION_MAP_ART } from "../../data/world/worldArt";
import { REGION_LORE } from "../../data/world/regionLore";
import type { RegionLocationDefinition, RegionLocationType, RegionLoreDefinition } from "../../game/world/worldTypes";
import { useGuild } from "../../state/GuildContext";
import { mapChromeStyles } from "../../ui/worldMap";
import { GameIcon } from "../../components/icons/GameIcon";
import type { GameIconId } from "../../data/ui/gameIcons";
import { visitSettlement } from "../../game/world/travelService";

const LOCATION_MARKERS: Record<RegionLocationType, GameIconId> = {
  city: "settlement",
  town: "settlement",
  village: "settlement",
  homeland: "hero_codex",
  stronghold: "guild",
  landmark: "current",
  ruin: "defeat",
  dungeon: "boss",
};

export function RegionMapScreen({ regionId, onBack, openQuest }: { regionId: string; onBack(): void; openQuest(questId: string): void }) {
  const { guild, updateGuild } = useGuild();
  const region = REGIONS[regionId];
  const locations = useMemo(() => getRegionLocations(regionId), [regionId]);
  const [selectedId, setSelectedId] = useState(locations[0]?.id ?? "");
  const [showChronicle, setShowChronicle] = useState(false);
  const [travelMessage, setTravelMessage] = useState<string>();
  const selected = locations.find((entry) => entry.id === selectedId) ?? locations[0];
  if (!region || !REGION_MAP_ART[regionId]) return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.title}>Unknown Region</Text></ScrollView>;
  const regionUnlocked = guild.world.unlockedRegionIds.includes(regionId);
  const regionLore = REGION_LORE[regionId];
  const regionLoreDiscovered = guild.world.worldFlags[`lore_${regionId}`] === true;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={onBack} />
      <View style={styles.heading}>
        <View style={styles.flex}><Text style={styles.eyebrow}>REGIONAL MAP</Text><Text style={styles.title}>{region.name}</Text><Text style={styles.subtitle}>Recommended level {region.recommendedLevelMin}–{region.recommendedLevelMax} · {locations.length} mapped locations</Text></View>
        <Text style={regionUnlocked ? styles.open : styles.locked}>{regionUnlocked ? "OPEN" : "LOCKED"}</Text>
      </View>

      <View style={mapChromeStyles.frame}>
        <ImageBackground source={REGION_MAP_ART[regionId]} resizeMode="cover" style={mapChromeStyles.canvas} imageStyle={mapChromeStyles.image}>
          <View pointerEvents="none" style={styles.mapShade} />
          {locations.map((entry) => {
            const active = entry.id === selected?.id;
            const settlementKnown = entry.settlementId ? guild.world.discoveredSettlementIds.includes(entry.settlementId) : true;
            const completed = entry.questId ? guild.world.completedQuestIds.includes(entry.questId) : false;
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
                <GameIcon id={completed ? "complete" : LOCATION_MARKERS[entry.type]} size={18} framed={false} />
                <Text numberOfLines={2} style={[styles.markerName, active && styles.activeMarkerName]}>
                  {entry.name}
                </Text>
              </Pressable>
            );
          })}
          {!regionUnlocked && <View pointerEvents="none" style={styles.fog}><Text style={styles.fogText}>REGION LOCKED · MAP INFORMATION ONLY</Text></View>}
        </ImageBackground>
        <View style={mapChromeStyles.legend}><Text style={styles.legendText}>CITY</Text><Text style={styles.legendText}>HOMELAND</Text><Text style={styles.legendText}>DUNGEON</Text><Text style={styles.legendText}>LANDMARK</Text></View>
      </View>

      {selected && <LocationPanel location={selected} regionUnlocked={regionUnlocked} discoveredSettlementIds={guild.world.discoveredSettlementIds} completedQuestIds={guild.world.completedQuestIds} currentSettlementId={guild.world.currentSettlementId} openQuest={openQuest} onVisit={(settlementId) => { try { const partySize = Math.max(1, guild.recentPartyHeroIds.length || Math.min(4, guild.heroes.filter((hero) => hero.isAvailable).length)); updateGuild(visitSettlement(guild, settlementId, partySize)); setTravelMessage(`Reached ${SETTLEMENTS[settlementId]?.name}. 1 day passed.`); } catch (error) { setTravelMessage(error instanceof Error ? error.message : "Local travel failed"); } }} />}
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

function LocationPanel({ location, regionUnlocked, discoveredSettlementIds, completedQuestIds, currentSettlementId, openQuest, onVisit }: { location: RegionLocationDefinition; regionUnlocked: boolean; discoveredSettlementIds: string[]; completedQuestIds: string[]; currentSettlementId: string | null; openQuest(questId: string): void; onVisit(settlementId: string): void }) {
  const settlement = location.settlementId ? SETTLEMENTS[location.settlementId] : undefined;
  const discovered = settlement ? discoveredSettlementIds.includes(settlement.id) : true;
  const questComplete = location.questId ? completedQuestIds.includes(location.questId) : false;
  return (
    <Panel style={styles.panel}>
      <View style={styles.locationHeader}><GameIcon id={LOCATION_MARKERS[location.type]} size={34} /><View style={styles.flex}><Text style={styles.locationName}>{location.name}</Text><Text style={styles.locationType}>{location.type.toUpperCase()}{location.recommendedLevel ? ` · RECOMMENDED LEVEL ${location.recommendedLevel}` : ""}</Text></View><Text style={discovered ? styles.known : styles.unknown}>{discovered ? "KNOWN" : "UNDISCOVERED"}</Text></View>
      <Text style={styles.description}>{location.description}</Text>
      {settlement && <><Text style={styles.label}>SERVICES</Text><Text style={styles.services}>{settlement.serviceIds.map(pretty).join(" · ")}</Text></>}
      {settlement && regionUnlocked && <ActionButton label={currentSettlementId === settlement.id ? "Current Location" : "Walk Here · 1 day"} disabled={currentSettlementId === settlement.id} onPress={() => onVisit(settlement.id)} />}
      {settlement && settlement.questIds.length > 0 && <><Text style={styles.label}>LOCAL QUESTS</Text><Text style={styles.services}>{settlement.questIds.map(pretty).join(" · ")}</Text></>}
      {location.questId && <View style={styles.questRow}><View style={styles.flex}><Text style={styles.label}>ASSOCIATED QUEST</Text><Text style={questComplete ? styles.complete : styles.questName}>{pretty(location.questId)}{questComplete ? " · Complete" : ""}</Text></View><ActionButton label={questComplete ? "Review" : "Open Quest"} disabled={!regionUnlocked} onPress={() => openQuest(location.questId!)} /></View>}
      {!regionUnlocked && <Text style={styles.lockedNote}>Unlock and travel to this region before beginning its quests or using local services.</Text>}
    </Panel>
  );
}

function pretty(value: string): string { return value.split("_").map((word) => word[0]!.toUpperCase() + word.slice(1)).join(" "); }

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 50 },
  heading: { alignItems: "flex-start", flexDirection: "row", gap: 8, marginTop: 7 },
  flex: { flex: 1 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 2 },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  open: { color: colors.green, fontSize: 10, fontWeight: "900" },
  locked: { color: colors.danger, fontSize: 10, fontWeight: "900" },
  mapShade: { backgroundColor: "rgba(3, 9, 14, .08)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  // The coordinate is the center of the 18px map icon; the label flows below it.
  marker: { alignItems: "center", backgroundColor: "transparent", marginLeft: -36, marginTop: -9, minHeight: 40, paddingHorizontal: 3, position: "absolute", width: 72 },
  unknownMarker: { opacity: .78 },
  completedMarker: { opacity: 1 },
  activeMarker: { transform: [{ scale: 1.08 }] },
  pressedMarker: { opacity: .7 },
  markerIcon: { color: colors.gold, fontSize: 12, fontWeight: "900", lineHeight: 13 },
  markerName: { color: colors.text, fontSize: 7, fontWeight: "900", lineHeight: 9, textAlign: "center", textShadowColor: "#050707", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  activeMarkerName: { color: colors.gold },
  fog: { alignItems: "center", backgroundColor: "rgba(12, 17, 20, .34)", bottom: 0, justifyContent: "flex-end", left: 0, paddingBottom: 5, position: "absolute", right: 0, top: 0 },
  fogText: { backgroundColor: "rgba(12, 17, 20, .9)", color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: .6, padding: 4 },
  legendText: { color: colors.muted, fontSize: 7, fontWeight: "900" },
  panel: { borderColor: "#4a5857" },
  locationHeader: { alignItems: "center", flexDirection: "row", gap: 9 },
  locationIcon: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderRadius: 4, borderWidth: 1, height: 34, justifyContent: "center", width: 34 },
  locationIconText: { color: colors.gold, fontSize: 17, fontWeight: "900" },
  locationName: { color: colors.text, fontSize: 20, fontWeight: "900" },
  locationType: { color: colors.gold, fontSize: 9, fontWeight: "900", marginTop: 2 },
  known: { color: colors.green, fontSize: 8, fontWeight: "900" },
  unknown: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  description: { color: colors.muted, lineHeight: 20, marginTop: 10 },
  label: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 11 },
  services: { color: colors.text, fontSize: 11, lineHeight: 17, marginTop: 4 },
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
});
