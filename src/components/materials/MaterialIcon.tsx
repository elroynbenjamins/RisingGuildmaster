import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MATERIAL_ART } from "../../data/crafting/materialArt";
import { MATERIALS } from "../../data/crafting/materials";
import type { MaterialId } from "../../game/crafting/craftingTypes";
import { colors } from "../ui";
import { AtlasCrop } from "../art/AtlasCrop";
import { useTheme } from "../../theme/theme";

export function MaterialIcon({ materialId, size = 44 }: { materialId: MaterialId; size?: number }) {
  const {colors:themeColors}=useTheme();
  const art = MATERIAL_ART[materialId];
  return <AtlasCrop accessibilityLabel={`${MATERIALS[materialId].name} material`} source={art.source} columns={art.columns} rows={art.rows} column={art.column} row={art.row} size={size} borderWidth={1} frameStyle={[styles.icon,{backgroundColor:themeColors.panel2,borderColor:themeColors.border,borderRadius:Math.max(6,size*.18)}]} />;
}

export function MaterialCostList({
  costs,
  inventory,
}: {
  costs: Partial<Record<MaterialId, number>>;
  inventory: Record<MaterialId, number>;
}) {
  const {colors:themeColors}=useTheme();
  return (
    <View style={styles.costs}>
      {(Object.entries(costs) as [MaterialId, number][]).map(([materialId, required]) => {
        const owned = inventory[materialId] ?? 0;
        return (
          <View key={materialId} style={[styles.costChip,{backgroundColor:themeColors.panel2,borderColor:themeColors.border},owned<required&&{borderColor:themeColors.danger}]}>
            <MaterialIcon materialId={materialId} size={27} />
            <View>
              <Text numberOfLines={1} style={[styles.costName,{color:themeColors.text}]}>{MATERIALS[materialId].name}</Text>
              <Text style={[styles.amount,{color:owned<required?themeColors.danger:themeColors.green}]}>{owned} / {required}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { backgroundColor: "#151b20", borderColor: colors.border },
  costs: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  costChip: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 9, borderWidth: 1, flexDirection: "row", gap: 7, minWidth: 128, padding: 5 },
  missing: { borderColor: colors.danger },
  costName: { color: colors.text, fontSize: 10, fontWeight: "800", maxWidth: 96 },
  amount: { color: colors.green, fontSize: 10, fontWeight: "900", marginTop: 1 },
  missingText: { color: colors.danger },
});
