import React from "react";
import { Image, StyleSheet, View, type ImageSourcePropType } from "react-native";
import { getSkillIconArt, type SkillIconAtlasId } from "../../data/skills/skillArt";
import { ENEMY_SKILL_EXPANSION_A_URI, ENEMY_SKILL_EXPANSION_B_URI } from "../../data/skills/generatedEnemySkillAtlases";
import { colors } from "../ui";

const HERO_ATLAS = require("../../../assets/skills/skill-icons-atlas-v1.png");
const ENEMY_ATLAS = require("../../../assets/skills/enemy-ability-icons-atlas-v1.png");
const ASH_STORY_ATLAS = require("../../../assets/skills/ash-beneath-greenveil-skills-atlas-v1.png");
const ATLASES: Record<SkillIconAtlasId, ImageSourcePropType> = {
  hero: HERO_ATLAS,
  enemy: ENEMY_ATLAS,
  ashStory: ASH_STORY_ATLAS,
  enemyExpansionA: { uri: ENEMY_SKILL_EXPANSION_A_URI },
  enemyExpansionB: { uri: ENEMY_SKILL_EXPANSION_B_URI },
};
const ATLAS_GRID_SIZE: Record<SkillIconAtlasId, number> = { hero: 6, enemy: 6, ashStory: 3, enemyExpansionA: 6, enemyExpansionB: 6 };

export function SkillIcon({ skillId, size = 46 }: { skillId: string; size?: number }) {
  const coordinate = getSkillIconArt(skillId);
  const gridSize = ATLAS_GRID_SIZE[coordinate.atlas];
  return <View accessibilityLabel={`${skillId.replace(/_/g, " ")} skill icon`} style={[styles.frame, { width: size, height: size, borderRadius: Math.max(5, size * .14) }]}><Image fadeDuration={0} resizeMode="stretch" source={ATLASES[coordinate.atlas]} style={{ position: "absolute", width: size * gridSize, height: size * gridSize, left: -coordinate.column * size, top: -coordinate.row * size }} /></View>;
}

const styles = StyleSheet.create({ frame: { backgroundColor: "#090f19", borderColor: colors.gold, borderWidth: 1, overflow: "hidden" } });
