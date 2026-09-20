import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { CURRENT_SAVE_VERSION } from "../src/game/save/saveVersion";
import { hasSeenContextualTutorial, markContextualTutorialSeen } from "../src/game/onboarding/tutorialService";
import { getDefaultTravelPartyHeroIds, normalizeTravelPartyHeroIds, toggleTravelPartyHeroId } from "../src/game/world/travelPartyService";
import { testHero } from "./testHero";

describe("cohesion polish", () => {
  it("stamps new saves and migrates legacy v1 saves sequentially", () => {
    const guild = createGuild();
    expect(guild.saveVersion).toBe(CURRENT_SAVE_VERSION);
    const legacy = JSON.parse(serializeGuild(guild));
    delete legacy.saveVersion;
    delete legacy.tutorial.contextualSeen;
    const migrated = deserializeGuild(JSON.stringify(legacy));
    expect(migrated.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(migrated.tutorial.contextualSeen).toEqual({});
  });

  it("rejects saves from a future schema instead of guessing", () => {
    const payload = JSON.parse(serializeGuild(createGuild()));
    payload.saveVersion = CURRENT_SAVE_VERSION + 10;
    expect(() => deserializeGuild(JSON.stringify(payload))).toThrow("newer than this build supports");
  });

  it("tracks contextual tutorials independently from the opening recruitment tutorial", () => {
    const guild = createGuild();
    expect(hasSeenContextualTutorial(guild, "combat_basics")).toBe(false);
    const updated = markContextualTutorialSeen(guild, "combat_basics");
    expect(hasSeenContextualTutorial(updated, "combat_basics")).toBe(true);
    expect(updated.tutorial.active).toBe(guild.tutorial.active);
  });

  it("builds an eligible four-hero travel party and respects manual toggles", () => {
    const guild = createGuild();
    guild.heroes = Array.from({ length: 5 }, (_, index) => ({ ...testHero(), id: `traveler-${index + 1}`, name: `Traveler ${index + 1}`, isAvailable: true, currentHP: 100 }));
    guild.recentPartyHeroIds = ["traveler-3", "traveler-1"];
    expect(getDefaultTravelPartyHeroIds(guild)).toEqual(["traveler-3", "traveler-1", "traveler-2", "traveler-4"]);
    const four = getDefaultTravelPartyHeroIds(guild);
    expect(toggleTravelPartyHeroId(guild, four, "traveler-5")).toEqual(four);
    const three = toggleTravelPartyHeroId(guild, four, "traveler-4");
    expect(toggleTravelPartyHeroId(guild, three, "traveler-5")).toContain("traveler-5");
  });

  it("removes unavailable and fallen heroes from travel selections", () => {
    const guild = createGuild();
    guild.heroes = [
      { ...testHero(), id: "ready", isAvailable: true, currentHP: 50 },
      { ...testHero(), id: "busy", isAvailable: false, currentHP: 50 },
      { ...testHero(), id: "fallen", isAvailable: true, currentHP: 0 },
    ];
    expect(normalizeTravelPartyHeroIds(guild, ["ready", "busy", "fallen"])).toEqual(["ready"]);
  });
});
