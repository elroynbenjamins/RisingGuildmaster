import React from "react";
import { View, StyleSheet } from "react-native";
import type { GridPosition } from "../../game/combat/grid/gridTypes";
import { getMovementPathDots } from "../../ui/combatBoardLayout";

export function MovementPath({
  path,
  columns,
  rows,
}: {
  path: readonly GridPosition[];
  columns: number;
  rows: number;
}) {
  const dots = getMovementPathDots(path, columns, rows);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {dots.map((dot, index) => (
        <View
          key={index}
          style={{
            position: "absolute",

            // Center on the same position as your old dot
            left: dot.left,
            top: dot.top,

            // Increase these depending on your grid tile size
            width: 28,
            height: 28,

            marginLeft: -14,
            marginTop: -14,

            backgroundColor: "rgba(255, 220, 70, 0.18)",

            borderWidth: 2,
            borderColor: "#FFE347",

            borderRadius: 4,
          }}
        />
      ))}
    </View>
  );
}
