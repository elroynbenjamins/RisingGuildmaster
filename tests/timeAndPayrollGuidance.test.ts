import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "../src/config/gameConfig";
import { createGuild } from "../src/game/guild/guildService";
import { acknowledgeTimeAdvanceGuidance, CALENDAR_BASICS_GUIDANCE_FLAG, getTimeAdvanceGuidance, PAYROLL_GUIDANCE_FLAG, payrollWarningLine } from "../src/game/onboarding/timeAndPayrollGuidanceService";
import { createHeroContract } from "../src/game/recruitment/contractService";
import { testHero } from "./testHero";

describe("time and payroll guidance", () => {
  it("finds every payroll crossed by a multi-day action", () => {
    const hero = { ...testHero(), id: "calendar-guide-hero" };
    const guild = createGuild();
    guild.heroes = [hero];
    guild.heroContracts = [createHeroContract(hero, 100, 12, guild.currentDay)];

    const guidance = getTimeAdvanceGuidance(guild, 15);

    expect(guidance.payroll).toEqual([{ day: 8, amount: 100 }, { day: 15, amount: 100 }]);
    expect(guidance.totalPayroll).toBe(200);
    expect(payrollWarningLine(guidance)).toContain("Day 8: 100 gold · Day 15: 100 gold");
  });

  it("projects unpaid wages after guaranteed daily tavern income", () => {
    const hero = { ...testHero(), id: "shortfall-guide-hero" };
    const guild = createGuild();
    guild.gold = 0;
    guild.heroes = [hero];
    guild.heroContracts = [createHeroContract(hero, 500, 12, guild.currentDay)];

    const guidance = getTimeAdvanceGuidance(guild, 7);

    expect(guidance.projectedShortfall).toBe(500 - GAME_CONFIG.dailyTavernIncome * 7);
  });

  it("records each lesson only when it is actually acknowledged", () => {
    const guild = createGuild();
    const first = getTimeAdvanceGuidance(guild, 1);
    const afterCalendar = acknowledgeTimeAdvanceGuidance(guild, first);
    expect(afterCalendar.world.worldFlags[CALENDAR_BASICS_GUIDANCE_FLAG]).toBe(true);
    expect(afterCalendar.world.worldFlags[PAYROLL_GUIDANCE_FLAG]).not.toBe(true);

    const hero = { ...testHero(), id: "ack-guide-hero" };
    afterCalendar.heroes = [hero];
    afterCalendar.heroContracts = [createHeroContract(hero, 100, 12, afterCalendar.currentDay - 6)];
    const payroll = getTimeAdvanceGuidance(afterCalendar, 1);
    const acknowledged = acknowledgeTimeAdvanceGuidance(afterCalendar, payroll);
    expect(acknowledged.world.worldFlags[PAYROLL_GUIDANCE_FLAG]).toBe(true);
  });
});
