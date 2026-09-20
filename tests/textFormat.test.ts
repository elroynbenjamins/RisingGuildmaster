import { describe, expect, it } from "vitest";
import { formatGameId, formatGameIdUpper } from "../src/ui/textFormat";

describe("player-facing identifier formatting", () => {
  it("formats underscored, hyphenated, and camel-case IDs", () => {
    expect(formatGameId("sprained_ankle")).toBe("Sprained Ankle");
    expect(formatGameId("seven-bells-quarterstaff")).toBe("Seven Bells Quarterstaff");
    expect(formatGameId("magicDefenseScore")).toBe("Magic Defense Score");
  });

  it("preserves common game acronyms", () => {
    expect(formatGameId("max_hp_xp")).toBe("Max HP XP");
    expect(formatGameId("accessory1")).toBe("Accessory 1");
    expect(formatGameIdUpper("close_friend")).toBe("CLOSE FRIEND");
  });
});
