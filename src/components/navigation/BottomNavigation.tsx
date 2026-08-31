import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../ui";
import { MAIN_TABS, type MainTab } from "../../ui/navigation";
import { GameIcon } from "../icons/GameIcon";
import type { GameIconId } from "../../data/ui/gameIcons";
import { useTheme } from "../../theme/theme";
const ICONS: Record<MainTab, GameIconId> = { Guild: "guild", Quests: "quests", World: "world", Heroes: "heroes", Inventory: "inventory" };
export function BottomNavigation({ active, onSelect }: { active: MainTab; onSelect(tab: MainTab): void }) { const{colors:c}=useTheme();return <View style={[styles.bar,{backgroundColor:c.panel,borderColor:c.border}]}>{MAIN_TABS.map((tab) => <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: active === tab }} onPress={() => onSelect(tab)} style={[styles.tab, active === tab && styles.selected]}><GameIcon id={ICONS[tab]} size={27} framed={false} /><Text style={[styles.label,{color:c.muted},active === tab && {color:c.gold}]}>{tab}</Text></Pressable>)}</View>; }
const styles = StyleSheet.create({ bar: { flexDirection: "row", borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, paddingTop: 5, paddingBottom: 6 }, tab: { flex: 1, alignItems: "center", minHeight: 50, justifyContent: "center", opacity: .66 }, selected: { opacity: 1 }, label: { color: colors.muted, fontSize: 9, fontWeight: "700", marginTop: 2 }, active: { color: colors.gold } });
