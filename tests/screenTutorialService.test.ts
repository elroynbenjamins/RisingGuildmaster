import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import {
  GUIDED_SCREEN_FLAGS,
  markGuidedScreenTipSeen,
  shouldShowGuidedScreenTip,
} from "../src/game/onboarding/screenTutorialService";

function guidedGuild() {
  const guild = createGuild();
  guild.tutorial = {
    ...guild.tutorial,
    active: false,
    completed: true,
    step: "complete",
    freeRefreshUsed: true,
  };
  return guild;
}

describe("screen-by-screen tutorial guidance", () => {
  it("does not show screen tips before guided recruitment is completed", () => {
    const guild = createGuild();
    expect(shouldShowGuidedScreenTip(guild, "guild_management")).toBe(false);
    expect(shouldShowGuidedScreenTip(guild, "temple")).toBe(false);
  });

  it("shows each uncovered sub-screen tip once for guided players", () => {
    let guild = guidedGuild();
    for (const id of ["guild_management", "temple", "crafting"] as const) {
      expect(shouldShowGuidedScreenTip(guild, id)).toBe(true);
      guild = markGuidedScreenTipSeen(guild, id);
      expect(shouldShowGuidedScreenTip(guild, id)).toBe(false);
      expect(guild.world.worldFlags[GUIDED_SCREEN_FLAGS[id]]).toBe(true);
    }
  });

  it("does not opt skipped tutorials into the follow-up screen tour", () => {
    const guild = createGuild();
    guild.tutorial = { ...guild.tutorial, active: false, completed: true, step: "complete", freeRefreshUsed: false };
    expect(shouldShowGuidedScreenTip(guild, "crafting")).toBe(false);
  });
});
