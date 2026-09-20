import { describe, expect, it } from "vitest";
import { DOUBLE_TAP_WINDOW_MS, isMatchingDoubleTap } from "../src/game/combat/doubleTap";

describe("combat double tap detection", () => {
  it("accepts a second tap on the same target within the window", () => {
    expect(isMatchingDoubleTap({ targetKey: "3,2", timestamp: 1_000 }, "3,2", 1_000 + DOUBLE_TAP_WINDOW_MS)).toBe(true);
  });

  it("rejects a different target", () => {
    expect(isMatchingDoubleTap({ targetKey: "3,2", timestamp: 1_000 }, "4,2", 1_100)).toBe(false);
  });

  it("rejects taps outside the window", () => {
    expect(isMatchingDoubleTap({ targetKey: "3,2", timestamp: 1_000 }, "3,2", 1_000 + DOUBLE_TAP_WINDOW_MS + 1)).toBe(false);
  });
});
