import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CombatTile as CombatTileState, TerrainType } from "../../game/combat/grid/gridTypes";

const terrainIcons: Partial<Record<TerrainType, string>> = { forest: "♣", mountain: "▲", shallow_water: "≈", snow: "✦", cracked_ice: "◇", sand: "∿", ash: "·", cave_wall: "▰", barricade: "╫", web: "⌘", egg_sac: "●", caravan: "▣", escort_npc: "◆", obstacle: "♦" };

export function CombatTile({ tile, columns, reachable, targetable, affected, selected, children, onPress }: { tile: CombatTileState; columns: number; reachable?: boolean; targetable?: boolean; affected?: boolean; selected?: boolean; children?: React.ReactNode; onPress(): void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Tile ${tile.position.x},${tile.position.y}, ${tile.terrainType}${reachable ? ", reachable" : ""}${targetable ? ", targetable" : ""}`} onPress={onPress} style={[styles.tile, { width: `${100 / columns}%` }, styles[tile.terrainType], reachable && styles.reachable, targetable && styles.targetable, affected && styles.affected, selected && styles.selected]}><View style={styles.contents}>{tile.terrainType !== "normal" && <Text style={[styles.terrainIcon, columns >= 13 && styles.compactTerrainIcon]}>{terrainIcons[tile.terrainType]}</Text>}{children && <View style={styles.tokenLayer}>{children}</View>}</View></Pressable>;
}

const styles = StyleSheet.create({
  tile: { aspectRatio: 1, borderWidth: 1, borderColor: "#3c485c", alignItems: "center", justifyContent: "center", backgroundColor: "#172033" },
  contents: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  tokenLayer: { position: "absolute", alignItems: "center", justifyContent: "center" },
  terrainIcon: { fontSize: 13, color: "#afbaa9", opacity: .85 }, compactTerrainIcon: { fontSize: 9 },
  normal: { backgroundColor: "#172033" }, forest: { backgroundColor: "#1d382d", borderColor: "#416c54" }, mountain: { backgroundColor: "#3d3d43", borderColor: "#777781" }, shallow_water: { backgroundColor: "#173b55", borderColor: "#3e82a8" },
  snow: { backgroundColor: "#b9cbd8", borderColor: "#eef8ff" }, cracked_ice: { backgroundColor: "#4e88aa", borderColor: "#bde9ff" },
  sand: { backgroundColor: "#8a6a3c", borderColor: "#c7a464" }, ash: { backgroundColor: "#443b3a", borderColor: "#7d6560" },
  cave_wall: { backgroundColor: "#29272b", borderColor: "#66616b" }, barricade: { backgroundColor: "#49351f", borderColor: "#9a7140" }, web: { backgroundColor: "#34313d", borderColor: "#9b91ad" }, egg_sac: { backgroundColor: "#4a4133", borderColor: "#c7b17a" }, caravan: { backgroundColor: "#5a3c22", borderColor: "#d7a35d" }, escort_npc: { backgroundColor: "#2f4b64", borderColor: "#7fc4e8" }, obstacle: { backgroundColor: "#3b3b43", borderColor: "#707079" },
  reachable: { backgroundColor: "#164f4e", borderColor: "#55d6c2", borderWidth: 2 }, targetable: { backgroundColor: "#4a272c", borderColor: "#ff827a", borderWidth: 2, borderStyle: "dashed" }, affected: { backgroundColor: "#60401f", borderColor: "#ffc466", borderWidth: 2 }, selected: { borderColor: "#ffe18a", borderWidth: 3 },
});
