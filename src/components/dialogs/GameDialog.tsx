import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../ui";
import { useTheme } from "../../theme/theme";

export type GameDialogTone = "default" | "success" | "danger";
export type GameDialogActionTone = "primary" | "secondary" | "danger";

export interface GameDialogAction {
  label: string;
  onPress?(): void;
  tone?: GameDialogActionTone;
}

export interface GameDialogOptions {
  title: string;
  message: string;
  eyebrow?: string;
  tone?: GameDialogTone;
  actions?: GameDialogAction[];
}

interface GameDialogContextValue {
  isDialogOpen: boolean;
  canDismissDialog: boolean;
  showDialog(options: GameDialogOptions): void;
  dismissDialog(): void;
}

const GameDialogContext = createContext<GameDialogContextValue | null>(null);

export function GameDialogProvider({ children }: React.PropsWithChildren) {
  const {colors:themeColors}=useTheme();
  const [dialog, setDialog] = useState<GameDialogOptions | null>(null);
  const choosingRef = useRef(false);
  const dismissDialog = useCallback(() => setDialog(null), []);
  const showDialog = useCallback((options: GameDialogOptions) => { choosingRef.current = false; setDialog(options); }, []);
  const actions = dialog?.actions?.length ? dialog.actions : [{ label: "Continue", tone: "primary" as const }];
  const canDismiss = actions.some((action) => action.tone === "secondary");
  const value = useMemo(() => ({ showDialog, dismissDialog, isDialogOpen: dialog !== null, canDismissDialog: canDismiss }), [dismissDialog, showDialog, dialog, canDismiss]);

  const choose = (action: GameDialogAction) => {
    if (choosingRef.current) return;
    choosingRef.current = true;
    setDialog(null);
    action.onPress?.();
  };

  return <GameDialogContext.Provider value={value}>
    {children}
    <Modal visible={dialog !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={() => { if (canDismiss) dismissDialog(); }}>
      <View style={[styles.backdrop,{backgroundColor:themeColors.backdrop}]} accessibilityViewIsModal>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => { if (canDismiss) dismissDialog(); }} accessibilityLabel={canDismiss ? "Close dialog" : undefined} />
        {dialog && <View style={[styles.card,{backgroundColor:themeColors.panel,borderColor:themeColors.gold}, dialog.tone === "danger" && styles.dangerCard, dialog.tone === "success" && styles.successCard]}>
          <View style={styles.crest}><Text style={styles.crestText}>{dialog.tone === "danger" ? "!" : dialog.tone === "success" ? "✓" : "◆"}</Text></View>
          <Text style={[styles.eyebrow, dialog.tone === "danger" && styles.dangerText, dialog.tone === "success" && styles.successText]}>{dialog.eyebrow ?? (dialog.tone === "danger" ? "GUILD WARNING" : dialog.tone === "success" ? "GUILD RECORD" : "GUILD NOTICE")}</Text>
          <Text style={[styles.title,{color:themeColors.text}]}>{dialog.title}</Text>
          <View style={styles.rule} />
          <Text style={[styles.message,{color:themeColors.muted}]}>{dialog.message}</Text>
          <View style={[styles.actions,actions.length>2&&styles.actionStack]}>{actions.map((action) => <Pressable key={action.label} accessibilityRole="button" onPress={() => choose(action)} style={({ pressed }) => [styles.action,{borderColor:themeColors.border}, action.tone === "primary" && {backgroundColor:themeColors.gold,borderColor:themeColors.gold}, action.tone === "danger" && styles.dangerAction, pressed && styles.pressed]}><Text style={[styles.actionText,{color:themeColors.text}, action.tone === "primary" && {color:themeColors.buttonText}, action.tone === "danger" && styles.dangerActionText]}>{action.label}</Text></Pressable>)}</View>
        </View>}
      </View>
    </Modal>
  </GameDialogContext.Provider>;
}

export function useGameDialog() {
  const value = useContext(GameDialogContext);
  if (!value) throw new Error("useGameDialog must be used within GameDialogProvider");
  return value;
}

const styles = StyleSheet.create({
  backdrop: { alignItems: "center", backgroundColor: "rgba(3, 7, 8, 0.82)", flex: 1, justifyContent: "center", padding: 22 },
  card: { backgroundColor: colors.panel, borderColor: colors.gold, borderRadius: 14, borderWidth: 2, elevation: 18, maxWidth: 440, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.55, shadowRadius: 18, width: "100%" },
  dangerCard: { borderColor: colors.danger }, successCard: { borderColor: colors.green },
  crest: { alignItems: "center", alignSelf: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderRadius: 10, borderWidth: 2, height: 44, justifyContent: "center", marginBottom: 10, width: 44 },
  crestText: { color: colors.gold, fontSize: 21, fontWeight: "900" },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 2, textAlign: "center" },
  dangerText: { color: colors.danger }, successText: { color: colors.green },
  title: { color: colors.text, fontSize: 23, fontWeight: "900", marginTop: 5, textAlign: "center" },
  rule: { alignSelf: "center", backgroundColor: colors.gold, height: 1, marginVertical: 14, opacity: 0.55, width: 72 },
  message: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center" },
  actions: { flexDirection: "row", gap: 9, marginTop: 20 },
  actionStack: { flexDirection: "column" },
  action: { alignItems: "center", borderColor: colors.border, borderRadius: 10, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 46, paddingHorizontal: 10 }, dangerAction: { backgroundColor: "#492725", borderColor: colors.danger },
  actionText: { color: colors.text, fontSize: 13, fontWeight: "900" }, dangerActionText: { color: "#ffd8d4" }, pressed: { opacity: 0.65 },
});
