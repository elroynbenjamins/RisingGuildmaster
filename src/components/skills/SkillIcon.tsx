import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { GENERATED_SKILL_ICON_ART, SKILL_ICON_ALIASES } from "../../data/skills/generatedSkillIconArt";
import { SKILL_ICON_ART } from "../../data/skills/skillIconArt";
import type { SkillIconAtlasId } from "../../data/skills/skillArt";

interface SkillIconProps {
  skillId: string;
  atlasId?: SkillIconAtlasId;
  size?: number;
}

export function SkillIcon({ skillId, size = 44 }: SkillIconProps) {
  const resolvedSkillId = SKILL_ICON_ALIASES[skillId] ?? skillId;
  const source =
    SKILL_ICON_ART[resolvedSkillId] ??
    GENERATED_SKILL_ICON_ART[resolvedSkillId];

  if (!source) {
    return (
      <View
        accessibilityLabel={`Missing skill icon: ${skillId}`}
        style={[styles.frame, { width: size, height: size }]}
      />
    );
  }

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <Image source={source} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
