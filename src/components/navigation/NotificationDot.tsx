import React from "react";
import { View } from "react-native";
import { useTheme } from "../../theme/theme";
export function NotificationDot({ label = "Action available" }: { label?: string }) {
  const { colors } = useTheme();
  return <View accessible accessibilityLabel={label} style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: colors.background, backgroundColor: colors.danger, margin: 3 }} />;
}
