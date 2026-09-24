import React, { useContext, useLayoutEffect } from "react";
import { View, StyleSheet } from "react-native";
import type { GuildState } from "../../game/guild/types";
import type { MainTab } from "../../ui/navigation";
import type { QuestTab } from "../../ui/questList";
import type { GuildActivityDestination } from "../../ui/guildActivityPresentation";
import { BottomNavigation } from "./BottomNavigation";
import { GlobalResourceHeader } from "./GlobalResourceHeader";
import { GuildActivityStrip } from "./GuildActivityStrip";
import { useTheme } from "../../theme/theme";
import { GuidedTutorialContext } from '../tutorial/GuidedTutorialContext';

export function ManagementShell({ guild, active, onSelect, onOpenGems, onOpenActivity, children }: React.PropsWithChildren<{
  guild: GuildState;
  active: MainTab;
  onSelect(tab: MainTab, questTab?: QuestTab): void;
  onOpenGems(): void;
  onOpenActivity(destination: GuildActivityDestination): void;
}>) {
  const { colors } = useTheme();
  const enterMainTab = useContext(GuidedTutorialContext)?.enterMainTab;
  useLayoutEffect(() => enterMainTab?.(active), [active, enterMainTab]);
  return <View style={[styles.root, { backgroundColor: colors.background }]}>
    <GlobalResourceHeader onOpenGems={onOpenGems} guild={guild} />
    <GuildActivityStrip guild={guild} onOpen={onOpenActivity} />
    <View style={styles.content}>{children}</View>
    <BottomNavigation active={active} onSelect={onSelect} />
  </View>;
}
const styles = StyleSheet.create({ root: { flex: 1 }, content: { flex: 1 } });
