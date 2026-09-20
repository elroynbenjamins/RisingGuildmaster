import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getLocalTravelPreview, getRegionProgressSummary, getRegionTravelPreview, getTravelPartyAverageLevel, getTravelPartySize } from "../src/game/world/worldMapPresentationService";
import { testHero } from "./testHero";

describe("world map presentation", () => {
  it("uses the recent available field party for travel planning", () => {
    const guild = createGuild();
    const a = { ...testHero(), id: "a", level: 4, isAvailable: true };
    const b = { ...testHero(), id: "b", level: 6, isAvailable: true };
    const c = { ...testHero(), id: "c", level: 9, isAvailable: true };
    guild.heroes = [a, b, c];
    guild.recentPartyHeroIds = [b.id, a.id];
    expect(getTravelPartySize(guild)).toBe(2);
    expect(getTravelPartyAverageLevel(guild)).toBe(5);
  });

  it("summarizes regional discovery and quest completion", () => {
    const guild = createGuild();
    guild.world.completedQuestIds = ["goblin_patrol", "spider_nest"];
    guild.world.discoveredSettlementIds = ["guildhaven", "brambleford"];
    const progress = getRegionProgressSummary(guild, "greenveil");
    expect(progress.completedQuests).toBe(2);
    expect(progress.discoveredSettlements).toBe(2);
    expect(progress.totalSettlements).toBeGreaterThan(2);
  });

  it("shows locked, underlevelled and ready routes without mutating the guild", () => {
    const guild = createGuild();
    const before = JSON.stringify(guild);
    expect(getRegionTravelPreview(guild, "iron_hills").state).toBe("locked");
    guild.world.unlockedRegionIds.push("iron_hills");
    guild.heroes = [{ ...testHero(), level: 2, isAvailable: true }];
    expect(getRegionTravelPreview(guild, "iron_hills").state).toBe("underlevelled");
    guild.heroes[0] = { ...guild.heroes[0]!, level: 8 };
    expect(getRegionTravelPreview(guild, "iron_hills").state).toBe("ready");
    expect(before).toBe(JSON.stringify(createGuild()));
  });

  it("previews local walking cost and arrival day", () => {
    const guild = createGuild();
    guild.heroes = [{ ...testHero(), isAvailable: true }, { ...testHero(), id: "b", isAvailable: true }];
    guild.recentPartyHeroIds = guild.heroes.map((hero) => hero.id);
    const preview = getLocalTravelPreview(guild, "brambleford");
    expect(preview.partySize).toBe(2);
    expect(preview.rationCost).toBe(2);
    expect(preview.arrivalDay).toBe(guild.currentDay + 1);
  });
});
