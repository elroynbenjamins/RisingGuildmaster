import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { THEMES } from "../src/theme/theme";

describe("visual themes", () => {
  it("provides complete semantic palettes", () => {
    for (const theme of Object.values(THEMES)) {
      expect(Object.keys(theme.colors).sort()).toEqual(["background", "backdrop", "blue", "border", "buttonText", "danger", "gold", "green", "muted", "panel", "panel2", "text"].sort());
      expect(theme.colors.background).toMatch(/^#/);
      expect(theme.colors.text).toMatch(/^#/);
    }
  });

  it("persists the selected theme with the guild save", () => {
    const guild = createGuild();
    const themed = { ...guild, uiPreferences: { ...guild.uiPreferences, themeId: "oled_dark" as const } };
    expect(deserializeGuild(serializeGuild(themed)).uiPreferences.themeId).toBe("oled_dark");
  });
});
