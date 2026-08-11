import React from "react";
import { View, StyleSheet } from "react-native";
import type { GuildState } from "../../game/guild/types";
import type { MainTab } from "../../ui/navigation";
import { BottomNavigation } from "./BottomNavigation";
import { GlobalResourceHeader } from "./GlobalResourceHeader";
export function ManagementShell({ guild, active, onSelect, children }: React.PropsWithChildren<{ guild: GuildState; active: MainTab; onSelect(tab: MainTab): void }>) { return <View style={styles.root}><GlobalResourceHeader guild={guild} /><View style={styles.content}>{children}</View><BottomNavigation active={active} onSelect={onSelect} /></View>; }
const styles = StyleSheet.create({ root: { flex: 1 }, content: { flex: 1 } });
