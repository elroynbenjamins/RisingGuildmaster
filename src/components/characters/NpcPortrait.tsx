import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { getNpcPortraitForSpeaker, NPC_PORTRAITS, type NpcPortraitAtlasId } from "../../data/characters/npcPortraits";

const ATLASES: Record<NpcPortraitAtlasId, number> = {
  storyCast: require("../../../assets/portraits/npcs/story-cast-atlas-v1.png"),
  archetypes: require("../../../assets/portraits/npcs/npc-archetypes-atlas-v1.png"),
  regionalCast: require("../../../assets/portraits/npcs/regional-cast-atlas-v1.png"),
  settlementCast: require("../../../assets/portraits/npcs/settlement-cast-atlas-v1.png"),
  questCast: require("../../../assets/portraits/npcs/quest-cast-atlas-v1.png"),
  hiddenPowers: require("../../../assets/portraits/npcs/hidden-powers-atlas-v1.png"),
};

export function NpcPortrait({ portraitId, size = 52 }: { portraitId: string; size?: number }) {
  const portrait = NPC_PORTRAITS[portraitId];
  if (!portrait) return <View style={[styles.frame, styles.missing, { width: size, height: size }]}><Text style={styles.question}>?</Text></View>;
  return <View accessibilityLabel={`${portrait.name} bitmap portrait`} style={[styles.frame, { width: size, height: size }]}><Image source={ATLASES[portrait.atlasId]} resizeMode="stretch" style={{ position: "absolute", width: size * 4, height: size * 3, left: -portrait.column * size, top: -portrait.row * size }} /></View>;
}

export function SpeakerPortrait({ speaker, size = 42 }: { speaker: string; size?: number }) {
  const portrait = getNpcPortraitForSpeaker(speaker);
  return portrait ? <NpcPortrait portraitId={portrait.id} size={size} /> : null;
}

const styles = StyleSheet.create({ frame: { backgroundColor: "#082b32", borderColor: "#d8ad5c", borderRadius: 7, borderWidth: 2, overflow: "hidden" }, missing: { alignItems: "center", justifyContent: "center" }, question: { color: "#a8b1ad", fontSize: 20, fontWeight: "900" } });
