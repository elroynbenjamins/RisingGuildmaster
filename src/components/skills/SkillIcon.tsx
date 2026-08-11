import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { getSkillIconArt } from "../../data/skills/skillArt";
import { colors } from "../ui";

const HERO_ATLAS = require("../../../assets/skills/skill-icons-atlas-v1.png");
const ENEMY_ATLAS = require("../../../assets/skills/enemy-ability-icons-atlas-v1.png");

export function SkillIcon({ skillId, size = 46 }: { skillId: string; size?: number }) {
  const coordinate = getSkillIconArt(skillId);
  return <View accessibilityLabel={`${skillId.replace(/_/g, " ")} skill icon`} style={[styles.frame, { width: size, height: size, borderRadius: Math.max(5, size * .14) }]}><Image fadeDuration={0} resizeMode="stretch" source={coordinate.atlas === "hero" ? HERO_ATLAS : ENEMY_ATLAS} style={{ position: "absolute", width: size * 6, height: size * 6, left: -coordinate.column * size, top: -coordinate.row * size }} /></View>;
}

const styles = StyleSheet.create({ frame: { backgroundColor: "#090f19", borderColor: colors.gold, borderWidth: 1, overflow: "hidden" } });
