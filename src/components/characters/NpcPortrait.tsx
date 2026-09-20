import { ARTWORK_REVIEW_ENABLED } from "../../config/artworkReview";
import { ReviewArtwork } from "../art/ReviewArtwork";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { NPC_PORTRAITS } from "../../data/characters/npcPortraits";
import { resolveSpeakerPortrait } from "../../data/characters/speakerPortraits";
import { EnemyPortrait } from "../enemies/EnemyPortrait";
import { NPC_PORTRAIT_ART } from "../../data/characters/npcPortraitArt";
import { useTheme } from "../../theme/theme";

export function NpcPortrait({ portraitId, size = 52 }: { portraitId: string; size?: number }) {
  const {colors}=useTheme();
  if (ARTWORK_REVIEW_ENABLED) return <ReviewArtwork id={portraitId === "registrar_mara_voss" ? "npc" : undefined} label={NPC_PORTRAITS[portraitId]?.name ?? portraitId} size={size} />;
  const portrait = NPC_PORTRAITS[portraitId];
  const source = NPC_PORTRAIT_ART[portraitId];
  if (!portrait || !source) return <View style={[styles.frame,styles.missing,{backgroundColor:colors.panel2,borderColor:colors.gold,width:size,height:size}]}><Text style={[styles.question,{color:colors.muted}]}>?</Text></View>;
  const borderWidth = size < 30 ? 1 : 2;
  return <View accessibilityLabel={`${portrait.name} portrait`} style={[styles.frame,{backgroundColor:colors.panel2,borderColor:colors.gold,borderWidth,height:size,width:size}]}><Image fadeDuration={0} resizeMode="cover" source={source} style={styles.image}/></View>;
}

export function SpeakerPortrait({ speaker, size = 42, portraitId, enemyId }: { speaker: string; size?: number; portraitId?: string; enemyId?: string }) {
  const portrait = resolveSpeakerPortrait(speaker, { portraitId, enemyId });
  if (!portrait) return null;
  return portrait.kind === "enemy" ? <EnemyPortrait enemyId={portrait.id} size={size} /> : <NpcPortrait portraitId={portrait.id} size={size} />;
}

const styles = StyleSheet.create({ frame: { backgroundColor: "#082b32", borderColor: "#d8ad5c", borderRadius: 7, overflow: "hidden" }, image: { height: "100%", width: "100%" }, missing: { alignItems: "center", justifyContent: "center", borderWidth: 2 }, question: { color: "#a8b1ad", fontSize: 20, fontWeight: "900" } });
