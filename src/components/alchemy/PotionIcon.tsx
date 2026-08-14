import React from "react";
import { Image, StyleSheet } from "react-native";
import { POTION_ART } from "../../data/alchemy/potionArt";
import { POTIONS } from "../../data/alchemy/potions";
import type { PotionId } from "../../game/alchemy/potionTypes";
import { colors } from "../ui";
export function PotionIcon({ potionId, size = 48 }: { potionId: PotionId; size?: number }) { return <Image accessibilityLabel={`${POTIONS[potionId].name} potion`} fadeDuration={0} resizeMode="cover" source={POTION_ART[potionId]} style={[styles.icon, { width: size, height: size, borderRadius: Math.max(6, size * .16) }]} />; }
const styles = StyleSheet.create({ icon: { backgroundColor: "#07121d", borderColor: colors.gold, borderWidth: 1 } });
