import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { creditVerifiedGems } from "../src/game/monetization/gemService";
import { fullyTreatHero, getConditionTreatmentCost, getHealingCost, healHero, reviveHero, treatHeroConditions } from "../src/game/temple/templeService";
import { testHero } from "./testHero";

describe("Temple services", () => {
  it("heals a living hero with gold without changing base attributes", () => {
    const hero = { ...testHero(), currentHP: 100 };
    const guild = { ...createGuild(), heroes: [hero] };
    const cost = getHealingCost(hero);
    const result = healHero(guild, hero.id);
    expect(result.gold).toBe(guild.gold - cost);
    expect(result.heroes[0]?.currentHP).toBe(calculateHero(hero).stats.maxHP);
    expect(result.heroes[0]?.baseAttributes).toEqual(hero.baseAttributes);
  });

  it("charges only for treatable conditions and preserves Inspired", () => {
    const hero = { ...testHero(), conditions: [{ conditionId: "injured" as const, remainingDuration: 4 }, { conditionId: "inspired" as const, remainingDuration: 2 }] };
    const guild = { ...createGuild(), heroes: [hero] };
    expect(getConditionTreatmentCost(hero)).toBe(120);
    const result = treatHeroConditions(guild, hero.id);
    expect(result.gold).toBe(4_880);
    expect(result.heroes[0]?.conditions).toEqual([{ conditionId: "inspired", remainingDuration: 2 }]);
  });

  it("full treatment cures ailments and heals to the healthy maximum", () => {
    const hero = { ...testHero(), currentHP: 80, conditions: [{ conditionId: "poisoned" as const, remainingDuration: 2 }] };
    const result = fullyTreatHero({ ...createGuild(), heroes: [hero] }, hero.id);
    const treated = result.heroes[0]!;
    expect(treated.conditions).toEqual([]);
    expect(treated.currentHP).toBe(calculateHero(treated).stats.maxHP);
  });

  it("revives a fallen hero at 25% HP, spends gems, and records the transaction", () => {
    const fallen = { ...testHero(), currentHP: 0, isAvailable: false };
    const guild = { ...createGuild(), heroes: [fallen] };
    const result = reviveHero(guild, fallen.id);
    expect(result.gems).toBe(2);
    expect(result.heroes[0]).toMatchObject({ currentHP: 58, isAvailable: true });
    expect(result.heroes[0]?.conditions.some((item) => item.conditionId === "injured")).toBe(true);
    expect(result.gemTransactions[0]).toMatchObject({ type: "revival", amount: -3 });
  });

  it("rejects revival without enough gems", () => {
    const fallen = { ...testHero(), currentHP: 0, isAvailable: false };
    expect(() => reviveHero({ ...createGuild(), gems: 2, heroes: [fallen] }, fallen.id)).toThrow("Not enough gems");
  });

  it("preserves a named battle injury on revival instead of adding a duplicate general injury", () => {
    const fallen = { ...testHero(), currentHP: 0, isAvailable: false, conditions: [{ conditionId: "broken_arm" as const, remainingDuration: 8 }] };
    const result = reviveHero({ ...createGuild(), heroes: [fallen] }, fallen.id);
    expect(result.heroes[0]?.conditions).toEqual([{ conditionId: "broken_arm", remainingDuration: 8 }]);
  });
});

describe("verified gem credits", () => {
  it("credits a verified reward once even if the provider retries it", () => {
    const receipt = { transactionId: "reward-1", source: "rewarded_ad" as const, gems: 2, verified: true };
    const once = creditVerifiedGems(createGuild(), receipt);
    const retried = creditVerifiedGems(once, receipt);
    expect(once.gems).toBe(7);
    expect(retried).toBe(once);
    expect(retried.gemTransactions).toHaveLength(1);
  });

  it("rejects an unverified reward", () => {
    expect(() => creditVerifiedGems(createGuild(), { transactionId: "bad", source: "purchase", gems: 25, verified: false })).toThrow("could not be verified");
  });
});
