import React from "react";
import { View } from "react-native";
import { useTheme } from "../../theme/theme";
export function NotificationDot({ label = "Action available" }: { label?: string }) {
  const { colors } = useTheme();
  return <View accessible accessibilityLabel={label} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, margin: 3 }} />;
}
