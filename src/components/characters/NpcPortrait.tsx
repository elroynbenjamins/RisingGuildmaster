import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getNpcPortraitForSpeaker, NPC_PORTRAITS, type NpcPortraitAtlasId } from "../../data/characters/npcPortraits";
import { AtlasCrop } from "../art/AtlasCrop";
import { useTheme } from "../../theme/theme";

const ATLASES: Record<NpcPortraitAtlasId, number> = {
  storyCast: require("../../../assets/portraits/npcs/story-cast-atlas-v1.png"),
  archetypes: require("../../../assets/portraits/npcs/npc-archetypes-atlas-v1.png"),
  regionalCast: require("../../../assets/portraits/npcs/regional-cast-atlas-v1.png"),
  settlementCast: require("../../../assets/portraits/npcs/settlement-cast-atlas-v1.png"),
  questCast: require("../../../assets/portraits/npcs/quest-cast-atlas-v1.png"),
  hiddenPowers: require("../../../assets/portraits/npcs/hidden-powers-atlas-v1.png"),
};

export function NpcPortrait({ portraitId, size = 52 }: { portraitId: string; size?: number }) {
  const {colors}=useTheme();
  const portrait = NPC_PORTRAITS[portraitId];
  if (!portrait) return <View style={[styles.frame,styles.missing,{backgroundColor:colors.panel2,borderColor:colors.gold,width:size,height:size}]}><Text style={[styles.question,{color:colors.muted}]}>?</Text></View>;
  const borderWidth = size < 30 ? 1 : 2;
  return <AtlasCrop accessibilityLabel={`${portrait.name} bitmap portrait`} source={ATLASES[portrait.atlasId]} columns={4} rows={3} column={portrait.column} row={portrait.row} size={size} borderWidth={borderWidth} frameStyle={[styles.frame,{backgroundColor:colors.panel2,borderColor:colors.gold}]} />;
}

export function SpeakerPortrait({ speaker, size = 42 }: { speaker: string; size?: number }) {
  const portrait = getNpcPortraitForSpeaker(speaker);
  return portrait ? <NpcPortrait portraitId={portrait.id} size={size} /> : null;
}

const styles = StyleSheet.create({ frame: { backgroundColor: "#082b32", borderColor: "#d8ad5c", borderRadius: 7 }, missing: { alignItems: "center", justifyContent: "center", borderWidth: 2, overflow: "hidden" }, question: { color: "#a8b1ad", fontSize: 20, fontWeight: "900" } });
