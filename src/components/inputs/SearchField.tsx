import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../../theme/theme";
export function SearchField({ label, placeholder, value, onChangeText }: { label: string; placeholder: string; value: string; onChangeText(value: string): void }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return <View style={[styles.field, { backgroundColor: colors.panel2, borderColor: focused ? colors.gold : "transparent" }]}>
    <TextInput accessibilityLabel={label} placeholder={placeholder} value={value} onChangeText={onChangeText} autoCorrect={false} autoCapitalize="none" returnKeyType="done" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text }]} />
    {value.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel={"Clear " + label.toLowerCase()} onPress={() => onChangeText("")} style={styles.clear}><Text style={{ color: colors.muted, fontSize: 22 }}>×</Text></Pressable>}
  </View>;
}
const styles = StyleSheet.create({ field: { flex: 1, minWidth: 0, minHeight: 44, flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10 }, input: { outlineStyle: "solid", outlineWidth: 0, flex: 1, minWidth: 0, minHeight: 44, paddingHorizontal: 10, fontSize: 14 }, clear: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center" } });
