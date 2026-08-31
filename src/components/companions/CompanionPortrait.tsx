import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COMPANION_PORTRAITS, isCompanionPortraitId } from "../../data/companions/companionArt";
import { useTheme } from "../../theme/theme";
import { AtlasCrop } from "../art/AtlasCrop";

const COMPANION_ATLAS = require("../../../assets/portraits/companions-atlas-v1.png");

export function CompanionPortrait({ companionId, size = 40 }: { companionId: string; size?: number }) {
  const { colors } = useTheme();
  if (!isCompanionPortraitId(companionId)) {
    return <View accessibilityLabel="Unknown companion portrait" style={[styles.fallback, { backgroundColor: colors.panel2, borderColor: colors.border, height: size, width: size }]}><Text style={[styles.question, { color: colors.muted, fontSize: size * .38 }]}>?</Text></View>;
  }
  const crop = COMPANION_PORTRAITS[companionId];
  return <AtlasCrop accessibilityLabel={`${companionId.replace(/_/g, " ")} portrait`} source={COMPANION_ATLAS} columns={3} rows={1} column={crop.column} row={crop.row} size={size} borderWidth={size < 28 ? 1 : 2} frameStyle={[styles.frame, { backgroundColor: colors.panel2, borderColor: colors.gold }]} />;
}

const styles = StyleSheet.create({
  frame: { borderRadius: 6 },
  fallback: { alignItems: "center", borderRadius: 6, borderStyle: "dashed", borderWidth: 1, justifyContent: "center" },
  question: { fontWeight: "900" },
});
