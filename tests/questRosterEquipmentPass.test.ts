import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getQuestTravelStep } from "../src/game/quests/questTravelService";
import { suggestPartyForQuest, getPartyCompositionSummary } from "../src/game/party/partyRecommendationService";
import { QUESTS } from "../src/data/quests/quests";
import { getHeroAttention } from "../src/ui/heroAttention";
import { getGuildNotifications } from "../src/ui/guildStatus";
import { testHero } from "./testHero";

describe("quest, roster, and equipment polish", () => {
  it("previews the next legal travel leg for remote quests", () => {
    const guild = createGuild();
    guild.world.unlockedRegionIds = ["greenveil", "iron_hills"];
    const step = getQuestTravelStep(guild, "troll_hunt", 3);
    expect(step.kind).toBe("region");
    expect(step.destinationRegionId).toBe("iron_hills");
    expect(step.label).toBe("Iron Hills");
    expect(step.days).toBeGreaterThan(0);
    expect(step.rationCost).toBeGreaterThan(0);
  });

  it("suggests only living, available heroes with enough readiness", () => {
    const guild = createGuild();
    const readyA = { ...testHero(), id: "ready-a", name: "Ready A", classId: "warrior" as const, level: 3, currentHP: 100, isAvailable: true, adventureStamina: 100 };
    const readyB = { ...testHero(), id: "ready-b", name: "Ready B", classId: "cleric" as const, level: 3, currentHP: 100, isAvailable: true, adventureStamina: 100 };
    const readyC = { ...testHero(), id: "ready-c", name: "Ready C", classId: "ranger" as const, level: 3, currentHP: 100, isAvailable: true, adventureStamina: 100 };
    const busy = { ...testHero(), id: "busy", name: "Busy", level: 10, currentHP: 100, isAvailable: false, adventureStamina: 100 };
    guild.heroes = [readyA, readyB, readyC, busy];
    const ids = suggestPartyForQuest(guild, QUESTS.goblin_patrol!);
    expect(ids).toContain("ready-a");
    expect(ids).toContain("ready-b");
    expect(ids).toContain("ready-c");
    expect(ids).not.toContain("busy");
    const summary = getPartyCompositionSummary(QUESTS.goblin_patrol!, guild.heroes.filter((hero) => ids.includes(hero.id)));
    expect(summary.frontline).toBeGreaterThan(0);
    expect(summary.support).toBeGreaterThan(0);
    expect(summary.ranged).toBeGreaterThan(0);
  });

  it("aggregates hero attention and exposes an actionable guild alert", () => {
    const guild = createGuild();
    const hero = { ...testHero(), id: "attention-hero", adventureStamina: 20, currentHP: 100, equipment: { weapon: null, armor: null, helmet: null, boots: null, accessory1: null, accessory2: null } };
    guild.heroes = [hero];
    guild.heroContracts = [{ heroId: hero.id, weeklySalary: 50, startDay: 1, endDay: 5, startLevel: 1, status: "expiring", renewalIntent: "undecided" }];
    const attention = getHeroAttention(guild, hero);
    expect(attention.issues.some((issue) => issue.kind === "gear_empty")).toBe(true);
    expect(attention.issues.some((issue) => issue.kind === "readiness")).toBe(true);
    expect(attention.issues.some((issue) => issue.kind === "contract")).toBe(true);
    const alert = getGuildNotifications(guild).find((entry) => entry.id === "hero_attention");
    expect(alert).toMatchObject({ destination: "heroes", actionLabel: "Review" });
  });
});
