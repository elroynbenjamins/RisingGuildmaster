import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/theme";

/** Keep the tree's scroll position while inspecting any node. */
export function SkillDetailsModal({ visible, onClose, children }: React.PropsWithChildren<{ visible: boolean; onClose(): void }>) {
  const { colors } = useTheme();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={[styles.backdrop, { backgroundColor: colors.backdrop }]}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Close skill details" onPress={onClose} />
      <View accessibilityViewIsModal style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.gold }]}>
        <View style={styles.header}><Text accessibilityRole="header" style={{ color: colors.gold, fontWeight: "900" }}>SKILL DETAILS</Text><Pressable accessibilityRole="button" accessibilityLabel="Close skill details" onPress={onClose} style={styles.close}><Text style={{ color: colors.text, fontWeight: "800" }}>Close ✕</Text></Pressable></View>
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      </View>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  card: { width: "100%", maxWidth: 480, maxHeight: "90%", borderWidth: 2, borderRadius: 16, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingLeft: 16, paddingRight: 6 },
  close: { minHeight: 48, minWidth: 72, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 12, paddingBottom: 16 },
});
