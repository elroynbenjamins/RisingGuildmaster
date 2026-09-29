import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { applyOfflineRecovery, formatOfflineDuration } from "../src/game/heroes/offlineRecoveryService";
import { testHero } from "./testHero";

const HOUR_MS = 60 * 60 * 1000;

describe("offline recovery", () => {
  it("heals living resting heroes by 10% max HP per hour and advances only injuries", () => {
    const hero = {
      ...testHero(),
      currentHP: 40,
      conditions: [
        { conditionId: "broken_arm" as const, remainingDuration: 8 },
        { conditionId: "poisoned" as const, remainingDuration: 3 },
      ],
    };
    const guild = { ...createGuild(), heroes: [hero] };

    const result = applyOfflineRecovery(guild, 6 * HOUR_MS);
    const recovered = result.guild.heroes[0]!;
    const brokenArm = recovered.conditions.find((condition) => condition.conditionId === "broken_arm");
    const poisoned = recovered.conditions.find((condition) => condition.conditionId === "poisoned");
    const maxHP = calculateHero(recovered).stats.maxHP;

    expect(brokenArm?.remainingDuration).toBeCloseTo(7);
    expect(poisoned?.remainingDuration).toBe(3);
    expect(recovered.currentHP).toBe(Math.min(maxHP, 40 + Math.round(maxHP * 0.6)));
    expect(result.summary.offlineHours).toBe(6);
    expect(result.summary.injuryDaysRecovered).toBe(1);
    expect(result.summary.injuryConditionsAdvanced).toBe(1);
  });

  it("keeps partial injury progress and caps recovery at 24 offline hours", () => {
    const hero = {
      ...testHero(),
      currentHP: 1,
      conditions: [{ conditionId: "broken_arm" as const, remainingDuration: 8 }],
    };
    const guild = { ...createGuild(), heroes: [hero] };

    const partial = applyOfflineRecovery(guild, 3 * HOUR_MS);
    expect(partial.guild.heroes[0]!.conditions[0]!.remainingDuration).toBeCloseTo(7.5);

    const capped = applyOfflineRecovery(guild, 48 * HOUR_MS);
    expect(capped.summary.capped).toBe(true);
    expect(capped.summary.offlineHours).toBe(24);
    expect(capped.summary.injuryDaysRecovered).toBe(4);
    expect(capped.guild.heroes[0]!.conditions[0]!.remainingDuration).toBeCloseTo(4);
  });

  it("does not recover fallen heroes or heroes in suspended combat", () => {
    const fallen = {
      ...testHero(),
      id: "fallen",
      currentHP: 0,
      conditions: [{ conditionId: "broken_arm" as const, remainingDuration: 8 }],
    };
    const fighting = {
      ...testHero(),
      id: "fighting",
      currentHP: 20,
      conditions: [{ conditionId: "sprained_ankle" as const, remainingDuration: 4 }],
    };
    const guild = {
      ...createGuild(),
      heroes: [fallen, fighting],
      activeQuestCombat: {
        questId: "test-quest",
        party: { id: "test-party", heroIds: ["fighting"] },
        randomState: 123,
        state: null,
      },
    };

    const result = applyOfflineRecovery(guild, 12 * HOUR_MS);
    expect(result.guild.heroes[0]).toEqual(fallen);
    expect(result.guild.heroes[1]).toEqual(fighting);
    expect(result.summary.healthRecovered).toBe(0);
    expect(result.summary.injuryConditionsAdvanced).toBe(0);
  });

  it("formats the away duration for the return summary", () => {
    expect(formatOfflineDuration((7 * 60 + 24) * 60_000)).toBe("7h 24m");
  });
});
