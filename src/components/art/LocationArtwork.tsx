import React from "react";
import { Image, StyleSheet, View } from "react-native";
const ART = {
  guild: require("../../../assets-runtime/artwork-v2/locations/guild-hall-v1.webp"),
  tavern: require("../../../assets-runtime/artwork-v2/locations/tavern-v1.webp"),
};
/** Decorative location art; headings and controls remain on solid surfaces. */
export function LocationArtwork({ location }: { location: keyof typeof ART }) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.frame}>
    <Image source={ART[location]} resizeMode="cover" fadeDuration={0} style={styles.image} />
  </View>;
}
const styles = StyleSheet.create({
  frame: { width: "100%", aspectRatio: 3, maxHeight: 128, borderRadius: 12, overflow: "hidden", marginBottom: 12 },
  image: { width: "100%", height: "100%" },
});
