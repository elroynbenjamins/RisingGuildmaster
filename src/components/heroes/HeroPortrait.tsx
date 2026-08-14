import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { getHeroPortraitCrop, type HeroGender } from "../../data/heroes/heroPortraits";
import type { ClassId, RaceId } from "../../game/heroes/types";

const ATLASES: Record<ClassId, number> = {
  warrior: require("../../../assets/portraits/heroes/warrior.png"),
  ranger: require("../../../assets/portraits/heroes/ranger.png"),
  mage: require("../../../assets/portraits/heroes/mage.png"),
  cleric: require("../../../assets/portraits/heroes/cleric.png"),
  paladin: require("../../../assets/portraits/heroes/paladin.png"),
  berserker: require("../../../assets/portraits/heroes/berserker.png"),
};

const VARIANT_ATLASES: Partial<Record<ClassId, number>> = {
  warrior: require("../../../assets/portraits/heroes/warrior-variants.png"),
  ranger: require("../../../assets/portraits/heroes/ranger-variants.png"),
  mage: require("../../../assets/portraits/heroes/mage-variants.png"),
  cleric: require("../../../assets/portraits/heroes/cleric-variants.png"),
  paladin: require("../../../assets/portraits/heroes/paladin-variants.png"),
  berserker: require("../../../assets/portraits/heroes/berserker-variants.png"),
};

export function HeroPortrait({ raceId, classId, gender, variant = 0, label, size = 84 }: { raceId: RaceId; classId: ClassId; gender: HeroGender; variant?: 0 | 1 | 2; label: string; size?: number }) {
  const crop = getHeroPortraitCrop(raceId, classId, gender);
  const variantAtlas = VARIANT_ATLASES[classId];
  const useVariant = variant > 0 && variantAtlas !== undefined;
  const row = useVariant ? (variant - 1) * 2 + (gender === "female" ? 0 : 1) : crop.row;
  const rows = useVariant ? 4 : 3;
  return <View accessibilityLabel={`${label} pixel portrait`} style={[styles.frame, { width: size, height: size, borderRadius: Math.max(6, size * .12) }]}>
    <Image source={useVariant ? variantAtlas : ATLASES[crop.atlasId]} resizeMode="stretch" style={{ position: "absolute", width: size * 4, height: size * rows, left: -crop.column * size, top: -row * size }} />
  </View>;
}

const styles = StyleSheet.create({ frame: { backgroundColor: "#082b32", borderColor: "#d8ad5c", borderWidth: 2, overflow: "hidden" } });
