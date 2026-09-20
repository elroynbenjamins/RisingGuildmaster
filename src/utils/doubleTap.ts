export const DOUBLE_TAP_WINDOW_MS = 350;

export interface TapRecord {
  targetKey: string;
  timestamp: number;
}

export function isMatchingDoubleTap(previous: TapRecord | null, targetKey: string, timestamp: number, windowMs = DOUBLE_TAP_WINDOW_MS): boolean {
  if (!previous || previous.targetKey !== targetKey) return false;
  const elapsed = timestamp - previous.timestamp;
  return elapsed >= 0 && elapsed <= windowMs;
}
