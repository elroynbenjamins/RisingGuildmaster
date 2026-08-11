import React from "react";
import { StyleSheet, View } from "react-native";
import type { CombatUnit } from "../../game/combat/combatTypes";
import type { CombatBoardState, GridPosition } from "../../game/combat/grid/gridTypes";
import { positionKey } from "../../game/combat/grid/gridTypes";
import { CombatTile } from "./CombatTile";
import { CombatToken } from "./CombatToken";
export function CombatBoard({ board, units, labels, enemyPortraitIds = {}, reachableKeys = new Set(), targetableKeys = new Set(), affectedKeys = new Set(), selectedUnitId, selectedPosition, onTilePress }: { board: CombatBoardState; units: readonly CombatUnit[]; labels: Readonly<Record<string, string>>; enemyPortraitIds?: Readonly<Record<string, string>>; reachableKeys?: ReadonlySet<string>; targetableKeys?: ReadonlySet<string>; affectedKeys?: ReadonlySet<string>; selectedUnitId?: string; selectedPosition?: GridPosition; onTilePress(position: GridPosition, occupantId: string | null): void }) {
  const byId = new Map(units.map((unit) => [unit.combatantId, unit]));
  return <View accessibilityLabel={`${board.width} by ${board.height} tactical combat board`} style={styles.board}>{board.tiles.map((tile) => { const key = positionKey(tile.position); const occupant = tile.occupantId ? byId.get(tile.occupantId) : undefined; const unit = occupant?.isAlive ? occupant : undefined; return <CombatTile key={key} tile={tile} columns={board.width} reachable={reachableKeys.has(key)} targetable={targetableKeys.has(key)} affected={affectedKeys.has(key)} selected={selectedPosition ? positionKey(selectedPosition) === key : false} onPress={() => onTilePress(tile.position, unit?.combatantId ?? null)}>{unit && <CombatToken label={labels[unit.combatantId] ?? "?"} side={unit.side} enemyDefinitionId={enemyPortraitIds[unit.combatantId]} size={board.width >= 13 ? 20 : 27} selected={unit.combatantId === selectedUnitId} attackable={targetableKeys.has(key)} />}</CombatTile>; })}</View>;
}
const styles = StyleSheet.create({ board: { width: "100%", flexDirection: "row", flexWrap: "wrap", borderWidth: 2, borderColor: "#69758a", borderRadius: 8, overflow: "hidden", marginVertical: 12 } });
