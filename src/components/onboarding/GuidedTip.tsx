import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../ui";

export function GuidedTip({
  step,
  title,
  message,
  onDismiss,
}: {
  step: string;
  title: string;
  message: string;
  onDismiss(): void;
}) {
  return <View style={styles.tip}>
    <View style={styles.top}>
      <Text style={styles.step}>{step}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss tutorial tip" onPress={onDismiss} style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}>
        <Text style={styles.dismissText}>GOT IT</Text>
      </Pressable>
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>;
}

const styles = StyleSheet.create({
  tip: {
    backgroundColor: "#1d201e",
    borderColor: colors.gold,
    borderLeftWidth: 4,
    borderRadius: 9,
    gap: 3,
    marginBottom: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  top: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 10 },
  step: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  dismiss: { minHeight: 30, justifyContent: "center", paddingHorizontal: 5 },
  dismissText: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: .7 },
  pressed: { opacity: .65 },
  title: { color: colors.text, fontSize: 14, fontWeight: "900" },
  message: { color: colors.muted, fontSize: 11, lineHeight: 16 },
});
