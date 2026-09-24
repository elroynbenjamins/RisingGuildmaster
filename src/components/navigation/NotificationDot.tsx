import React from "react";
import { View } from "react-native";
import { useTheme } from "../../theme/theme";

export type NotificationDotTone = "urgent" | "warning" | "ready" | "info";

export function NotificationDot({ label = "Action available", tone = "warning" }: { label?: string; tone?: NotificationDotTone }) {
  const { colors } = useTheme();
  const backgroundColor = tone === "urgent" ? colors.danger : tone === "ready" ? colors.green : tone === "info" ? colors.blue : colors.gold;
  return <View accessible accessibilityLabel={label} style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: colors.background, backgroundColor, margin: 3 }} />;
}
