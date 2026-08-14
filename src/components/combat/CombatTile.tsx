import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import type { CombatTile as CombatTileState, TerrainType } from "../../game/combat/grid/gridTypes";

const TERRAIN_ATLAS = require("../../../assets/combat/terrain-tiles-atlas-v1.png");
const TERRAIN_ART: Record<TerrainType, { column: number; row: number }> = {
  normal: { column: 0, row: 0 }, forest: { column: 1, row: 0 }, mountain: { column: 2, row: 0 }, shallow_water: { column: 3, row: 0 },
  snow: { column: 0, row: 1 }, cracked_ice: { column: 1, row: 1 }, sand: { column: 2, row: 1 }, ash: { column: 3, row: 1 },
  cave_wall: { column: 0, row: 2 }, barricade: { column: 1, row: 2 }, web: { column: 2, row: 2 }, egg_sac: { column: 3, row: 2 },
  caravan: { column: 0, row: 3 }, escort_npc: { column: 1, row: 3 }, obstacle: { column: 2, row: 3 }, trap: { column: 3, row: 3 },
};

export function CombatTile({ tile, columns, reachable, targetable, affected, selected, children, onPress }: { tile: CombatTileState; columns: number; reachable?: boolean; targetable?: boolean; affected?: boolean; selected?: boolean; children?: React.ReactNode; onPress(): void }) {
  const art = TERRAIN_ART[tile.terrainType];
  return <Pressable accessibilityRole="button" accessibilityLabel={`Tile ${tile.position.x},${tile.position.y}, ${tile.terrainType}${reachable ? ", reachable" : ""}${targetable ? ", targetable" : ""}`} onPress={onPress} style={[styles.tile, { width: `${100 / columns}%` }, reachable && styles.reachable, targetable && styles.targetable, affected && styles.affected, selected && styles.selected]}><View style={styles.contents}><Image fadeDuration={0} resizeMode="stretch" source={TERRAIN_ATLAS} style={{ position: "absolute", width: "400%", height: "400%", left: `${-art.column * 100}%`, top: `${-art.row * 100}%`, opacity: columns >= 13 ? .78 : .9 }} />{children && <View style={styles.tokenLayer}>{children}</View>}</View></Pressable>;
}

const styles = StyleSheet.create({
  tile: { aspectRatio: 1, borderWidth: 1, borderColor: "#3c485c", alignItems: "center", justifyContent: "center", backgroundColor: "#172033", overflow: "hidden" },
  contents: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  tokenLayer: { position: "absolute", alignItems: "center", justifyContent: "center" },
  reachable: { borderColor: "#55d6c2", borderWidth: 3 }, targetable: { borderColor: "#ff827a", borderWidth: 3, borderStyle: "dashed" }, affected: { borderColor: "#ffc466", borderWidth: 3 }, selected: { borderColor: "#ffe18a", borderWidth: 4 },
});
