import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getGuildHallPriority } from "../src/game/guild/guildManagementPriorityService";
import { createHeroContract } from "../src/game/recruitment/contractService";
import { testHero } from "./testHero";

const notices = { guildmaster: false, achievements: false, daily: false };

describe("Guild Hall contextual priorities", () => {
  it("shows all clear when there are no actionable Guild Hall tasks", () => {
    expect(getGuildHallPriority(createGuild(), notices)).toBeNull();
  });

  it("routes fallen heroes to the Temple before optional rewards", () => {
    const guild = createGuild();
    guild.heroes = [{ ...testHero(), currentHP: 0 }];
    expect(getGuildHallPriority(guild, { ...notices, daily: true, guildmaster: true })).toMatchObject({ destination: "temple", tone: "urgent" });
  });

  it("directs unpaid wages to the calendar before routine achievements", () => {
    const guild = createGuild();
    const hero = { ...testHero(), id: "unpaid" };
    guild.heroes = [hero];
    guild.heroContracts = [createHeroContract(hero, 100, 12, guild.currentDay)];
    guild.finance.salaryArrearsByHeroId[hero.id] = 90;
    expect(getGuildHallPriority(guild, { ...notices, achievements: true })).toMatchObject({ destination: "finances", tone: "urgent" });
  });

  it("treats non-inspiring conditions but does not flag inspiration", () => {
    const guild = createGuild();
    guild.heroes = [{ ...testHero(), conditions: [{ conditionId: "injured", remainingDuration: 2 }] }];
    expect(getGuildHallPriority(guild, notices)).toMatchObject({ destination: "temple", tone: "warning" });
    guild.heroes = [{ ...testHero(), conditions: [{ conditionId: "inspired", remainingDuration: 2 }] }];
    expect(getGuildHallPriority(guild, notices)).toBeNull();
  });

  it("offers the first actual reward or leadership upgrade, not merely unspendable points", () => {
    const guild = createGuild();
    expect(getGuildHallPriority(guild, { ...notices, guildmaster: true })).toMatchObject({ destination: "guildmaster", tone: "ready" });
    expect(getGuildHallPriority(guild, { ...notices, achievements: true })).toMatchObject({ destination: "achievements", tone: "ready" });
    expect(getGuildHallPriority(guild, { ...notices, daily: true })).toMatchObject({ destination: "gems", tone: "ready" });
  });
  it("routes a genuine upcoming payroll warning to the ledger before daily gems", () => {
    const guild = createGuild();
    const hero = { ...testHero(), id: "payday" };
    guild.heroes = [hero];
    guild.heroContracts = [createHeroContract(hero, 150, 12, guild.currentDay)];
    guild.currentDay = 7;
    expect(getGuildHallPriority(guild, { ...notices, daily: true })).toMatchObject({ destination: "finances", tone: "warning" });
  });

  it("does not flag unspendable leadership points as urgent work", () => {
    const guild = createGuild();
    guild.guildmaster.skillPoints = 1;
    expect(getGuildHallPriority(guild, notices)).toBeNull();
  });

});
