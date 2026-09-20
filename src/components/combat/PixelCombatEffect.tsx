import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from "react-native";
import type { CombatVisualEvent } from "../../game/combat/combatTypes";
import { useGuild } from "../../state/GuildContext";

export type TileCombatEffect = CombatVisualEvent["effects"][number] & {
  eventId: number;
  damageType?: CombatVisualEvent["damageType"];
  defeated?: boolean;
  targetSide?: "heroes" | "enemies";
};

export function PixelCombatEffect({ effect }: { effect: TileCombatEffect }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: reduced ? 220 : effect.defeated || effect.critical ? 820 : 650, useNativeDriver: true }).start();
  }, [effect.eventId, effect.critical, effect.defeated, progress, reduced]);

  const color = effect.healing > 0 ? "#78f0a5" : effect.damageType === "magic" ? "#b58cff" : effect.damageType === "true" ? "#fff2ac" : "#ff765f";
  const amount = effect.healing > 0 ? `+${effect.healing}` : effect.hit ? `-${effect.damage}` : "MISS";
  const headline = effect.defeated ? (effect.targetSide === "heroes" ? "DOWN" : "DEFEATED") : effect.critical ? "CRIT" : null;
  const conditionColor = effect.conditionIds.includes("burning") ? "#ff7a3d" : effect.conditionIds.includes("poisoned") ? "#6bdb66" : effect.conditionIds.some((id) => id.includes("frozen") || id.includes("rooted")) ? "#74d8f2" : effect.conditionIds.length ? "#efb060" : null;

  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Animated.View style={[styles.flash, { borderColor: color, borderWidth: effect.defeated || effect.critical ? 3 : 2, opacity: progress.interpolate({ inputRange: [0, .12, .62, 1], outputRange: [0, 1, .55, 0] }), transform: [{ scale: progress.interpolate({ inputRange: [0, .35, 1], outputRange: [.45, effect.defeated ? 1.24 : 1.15, 1.35] }) }] }] }>
      {!reduced && effect.hit && <>
        <View style={[styles.pixel, { backgroundColor: color, left: "12%", top: "18%" }]} />
        <View style={[styles.pixel, { backgroundColor: color, right: "10%", top: "36%" }]} />
        <View style={[styles.pixelSmall, { backgroundColor: color, bottom: "12%", left: "35%" }]} />
        {effect.damageType === "physical" && <View style={[styles.slash, { backgroundColor: color }]} />}
      </>}
      {conditionColor && <Animated.View style={[styles.conditionRing, { borderColor: conditionColor, opacity: progress.interpolate({ inputRange: [0, .35, 1], outputRange: [0, 1, 0] }) }]} />}
      <Animated.View style={[styles.numberPlate, { opacity: progress.interpolate({ inputRange: [0, .08, .78, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [2, reduced ? -5 : effect.defeated ? -27 : -20] }) }, { scale: progress.interpolate({ inputRange: [0, .15, 1], outputRange: [.78, effect.critical || effect.defeated ? 1.15 : 1, 1] }) }] }] }>
        {headline ? <Text style={[styles.headline, { color }]}>{headline}</Text> : null}
        <Text style={[styles.number, { color }, (effect.critical || effect.defeated) && styles.strongNumber]}>{amount}</Text>
      </Animated.View>
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  flash: { bottom: 0, left: 0, right: 0, top: 0, position: "absolute", alignItems: "center", borderWidth: 2, justifyContent: "center", zIndex: 20 },
  numberPlate: { alignItems: "center", backgroundColor: "rgba(8,10,14,.90)", borderColor: "rgba(255,255,255,.16)", borderWidth: 1, flexDirection: "row", gap: 3, paddingHorizontal: 3, paddingVertical: 1, position: "absolute", top: -12, zIndex: 24 },
  headline: { fontSize: 7, fontWeight: "900", letterSpacing: .5 },
  number: { fontSize: 9, fontWeight: "900" },
  strongNumber: { fontSize: 11 },
  pixel: { height: 4, position: "absolute", width: 4 },
  pixelSmall: { height: 3, position: "absolute", width: 3 },
  slash: { height: 3, position: "absolute", transform: [{ rotate: "-35deg" }], width: "72%" },
  conditionRing: { borderRadius: 999, borderWidth: 2, height: "82%", position: "absolute", width: "82%" },
});
