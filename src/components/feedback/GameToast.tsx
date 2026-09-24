import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/theme";

export type GameToastTone = "success" | "danger" | "info" | "gold";
export interface GameToastOptions {
  title: string;
  message?: string;
  tone?: GameToastTone;
  durationMs?: number;
}
interface GameToastContextValue {
  showToast(options: GameToastOptions): void;
  dismissToast(): void;
}

const GameToastContext = createContext<GameToastContextValue | null>(null);

export function GameToastProvider({ children }: React.PropsWithChildren) {
  const { colors } = useTheme();
  const [toast, setToast] = useState<GameToastOptions | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback((options: GameToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(options);
    void AccessibilityInfo.announceForAccessibility([options.title, options.message].filter(Boolean).join(". "));
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setToast(null);
    }, options.durationMs ?? 3000);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const tone = toast?.tone ?? "success";
  const accent = tone === "danger" ? colors.danger : tone === "info" ? colors.blue : tone === "gold" ? colors.gold : colors.green;
  const symbol = tone === "danger" ? "!" : tone === "info" ? "i" : tone === "gold" ? "◆" : "✓";

  return <GameToastContext.Provider value={{ showToast, dismissToast }}>
    <View style={styles.root}>
      {children}
      {toast ? <View pointerEvents="box-none" style={styles.layer}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notification" onPress={dismissToast} style={({ pressed }) => [styles.toast, { backgroundColor: colors.panel, borderColor: colors.border }, pressed && styles.pressed]}>
          <View style={[styles.rail, { backgroundColor: accent }]} />
          <View style={[styles.symbolPlate, { backgroundColor: colors.panel2, borderColor: accent }]}><Text style={[styles.symbol, { color: accent }]}>{symbol}</Text></View>
          <View style={styles.copy}><Text numberOfLines={1} style={[styles.title, { color: accent }]}>{toast.title}</Text>{toast.message ? <Text numberOfLines={2} style={[styles.message, { color: colors.text }]}>{toast.message}</Text> : null}</View>
        </Pressable>
      </View> : null}
    </View>
  </GameToastContext.Provider>;
}

export function useGameToast() {
  const value = useContext(GameToastContext);
  if (!value) throw new Error("useGameToast must be used within GameToastProvider");
  return value;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  layer: { bottom: 74, left: 12, position: "absolute", right: 12, zIndex: 80 },
  toast: { alignItems: "center", borderRadius: 12, borderWidth: 1, elevation: 12, flexDirection: "row", gap: 9, minHeight: 58, overflow: "hidden", paddingHorizontal: 11, paddingVertical: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: .3, shadowRadius: 10 },
  rail: { bottom: 0, left: 0, position: "absolute", top: 0, width: 4 },
  symbolPlate: { alignItems: "center", borderRadius: 9, borderWidth: 1, height: 34, justifyContent: "center", width: 34 },
  symbol: { fontSize: 15, fontWeight: "900" },
  copy: { flex: 1, minWidth: 0 },
  title: { fontSize: 10, fontWeight: "900", letterSpacing: .7, textTransform: "uppercase" },
  message: { fontSize: 11, fontWeight: "700", lineHeight: 16, marginTop: 2 },
  pressed: { opacity: .78, transform: [{ translateY: 1 }] },
});
