import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { MATERIAL_ART } from "../../data/crafting/materialArt";
import { MATERIALS } from "../../data/crafting/materials";
import type { MaterialId } from "../../game/crafting/craftingTypes";
import { colors } from "../ui";

export function MaterialIcon({ materialId, size = 44 }: { materialId: MaterialId; size?: number }) {
  return (
    <Image
      accessibilityLabel={`${MATERIALS[materialId].name} material`}
      fadeDuration={0}
      resizeMode="cover"
      source={MATERIAL_ART[materialId]}
      style={[styles.icon, { width: size, height: size, borderRadius: Math.max(6, size * 0.18) }]}
    />
  );
}

export function MaterialCostList({
  costs,
  inventory,
}: {
  costs: Partial<Record<MaterialId, number>>;
  inventory: Record<MaterialId, number>;
}) {
  return (
    <View style={styles.costs}>
      {(Object.entries(costs) as [MaterialId, number][]).map(([materialId, required]) => {
        const owned = inventory[materialId] ?? 0;
        return (
          <View key={materialId} style={[styles.costChip, owned < required && styles.missing]}>
            <MaterialIcon materialId={materialId} size={27} />
            <View>
              <Text numberOfLines={1} style={styles.costName}>{MATERIALS[materialId].name}</Text>
              <Text style={[styles.amount, owned < required && styles.missingText]}>{owned} / {required}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { backgroundColor: "#151b20", borderColor: colors.border, borderWidth: 1 },
  costs: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  costChip: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, borderRadius: 9, borderWidth: 1, flexDirection: "row", gap: 7, minWidth: 128, padding: 5 },
  missing: { borderColor: colors.danger },
  costName: { color: colors.text, fontSize: 10, fontWeight: "800", maxWidth: 96 },
  amount: { color: colors.green, fontSize: 10, fontWeight: "900", marginTop: 1 },
  missingText: { color: colors.danger },
});
