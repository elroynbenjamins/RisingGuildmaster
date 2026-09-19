import { Platform, Vibration } from "react-native";

export type TactileFeedbackKind = "selection" | "confirm" | "warning";

export function triggerTactileFeedback(enabled: boolean, kind: TactileFeedbackKind = "selection"): void {
  if (!enabled || Platform.OS === "web") return;
  const duration = kind === "warning" ? 24 : kind === "confirm" ? 14 : 8;
  Vibration.vibrate(duration);
}
