import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../ui";
import { MAIN_TABS, type MainTab } from "../../ui/navigation";
import type { QuestTab } from "../../ui/questList";
import { GameIcon } from "../icons/GameIcon";
import type { GameIconId } from "../../data/ui/gameIcons";
import { useTheme } from "../../theme/theme";
import { NotificationBadge } from "./NotificationBadge";
import { useActionNotifications } from "../../state/useActionNotifications";

const ICONS: Record<MainTab, GameIconId> = { Guild: "guild", Quests: "quests", World: "world", Heroes: "heroes", Inventory: "inventory" };

export function BottomNavigation({ active, onSelect }: { active: MainTab; onSelect(tab: MainTab, questTab?: QuestTab): void }) {
  const { colors: c } = useTheme();
  const notices = useActionNotifications();
  return <View style={[styles.bar, { backgroundColor: c.panel, borderColor: c.border }]}>{MAIN_TABS.map((tab) => {
    const selected = active === tab;
    const notice = notices.tabs[tab];
    return <Pressable key={tab} accessibilityRole="tab" accessibilityLabel={notice ? `${tab}. ${notice.label}` : tab} accessibilityState={{ selected }} aria-selected={selected} onPress={() => onSelect(tab, tab === "Quests" ? notice?.preferredQuestTab : undefined)} style={({ pressed }: { pressed: boolean }) => [styles.tab, { borderColor: selected ? c.gold : c.border, backgroundColor: selected ? c.panel2 : "transparent" }, pressed && styles.pressed]}>
      {selected ? <View style={[styles.selectedPlate, { backgroundColor: c.gold }]} /> : null}
      {notice ? <View style={styles.notice}><NotificationBadge count={notice.count} tone={notice.tone} label={`${tab}: ${notice.label}`} /></View> : null}
      <GameIcon id={ICONS[tab]} size={29} framed={false} />
      <Text style={[styles.label, { color: selected ? c.gold : c.muted }]}>{tab}</Text>

    </Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, paddingTop: 4, paddingBottom: 5, paddingHorizontal: 8, gap: 3 },
  tab: { flex: 1, alignItems: "center", minHeight: 61, justifyContent: "center", position: "relative", borderWidth: 0, borderRadius: 12, },
  pressed: { opacity: .65, transform: [{ translateY: 1 }] },
  selectedPlate: { height: 2, width: 18, borderRadius: 1, position: "absolute", bottom: 3 },
  notice: { position: "absolute", top: 1, right: 4, zIndex: 2 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0, marginTop: 2 },
});
