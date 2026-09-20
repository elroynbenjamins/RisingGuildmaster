import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { EQUIPMENT } from "../../data/equipment/equipment";
import { EQUIPMENT_ICON_ART } from "../../data/equipment/equipmentIconArt";
import { equipmentSlotIcon } from "../../data/ui/gameIcons";
import { parseEquipmentKey } from "../../game/equipment/equipmentResolver";
import { GameIcon } from "../icons/GameIcon";

interface EquipmentIconProps {
  equipmentKey?: string | null;
  slot?: string;
  label?: string;
  size?: number;
}

export function EquipmentIcon({
  equipmentKey,
  slot,
  label,
  size = 48,
}: EquipmentIconProps) {
  if (!equipmentKey) {
    return (
      <View
        accessibilityLabel="Empty equipment slot"
        style={[styles.empty, { width: size, height: size }]}
      >
        <Text style={{ color: "#d76565", fontSize: size * 0.45 }}>x</Text>
      </View>
    );
  }

  const equipmentId = parseEquipmentKey(equipmentKey).equipmentId;
  const definition = EQUIPMENT[equipmentId];
  const source = EQUIPMENT_ICON_ART[equipmentId];

  if (!source) {
    return (
      <GameIcon
        id={equipmentSlotIcon(definition?.slot ?? slot ?? "weapon")}
        size={size}
        framed={false}
      />
    );
  }

  return (
    <View
      accessibilityLabel={`${label ?? definition?.name ?? "Equipment"} icon`}
      style={[styles.frame, { width: size, height: size }]}
    >
      <Image source={source} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    borderRadius: 7,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
