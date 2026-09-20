import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COMPANION_PORTRAITS, isCompanionPortraitId } from "../../data/companions/companionArt";
import { useTheme } from "../../theme/theme";
import { formatGameId } from "../../ui/textFormat";

export function CompanionPortrait({ companionId, size = 40 }: { companionId: string; size?: number }) {
  const { colors } = useTheme();
  if (!isCompanionPortraitId(companionId)) {
    return <View accessibilityLabel="Unknown companion portrait" style={[styles.fallback, { backgroundColor: colors.panel2, borderColor: colors.border, height: size, width: size }]}><Text style={[styles.question, { color: colors.muted, fontSize: size * .38 }]}>?</Text></View>;
  }
  const borderWidth = size < 28 ? 1 : 2;
  return <View accessibilityLabel={`${formatGameId(companionId)} portrait`} style={[styles.frame,{backgroundColor:colors.panel2,borderColor:colors.gold,borderWidth,height:size,width:size}]}><Image fadeDuration={0} resizeMode="cover" source={COMPANION_PORTRAITS[companionId]} style={styles.image}/></View>;
}

const styles = StyleSheet.create({
  frame: { borderRadius: 6, overflow: "hidden" },
  image: { height: "100%", width: "100%" },
  fallback: { alignItems: "center", borderRadius: 6, borderStyle: "dashed", borderWidth: 1, justifyContent: "center" },
  question: { fontWeight: "900" },
});
