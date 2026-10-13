import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getGuildHallPriority } from "../src/game/guild/guildManagementPriorityService";
import { createHeroContract } from "../src/game/recruitment/contractService";
import { testHero } from "./testHero";

const notices = { guildmaster: false, achievements: false, daily: false };

describe("Guild Hall contextual priorities", () => {
  it("starts with a usable roster destination and no fake urgency", () => {
    const priority = getGuildHallPriority(createGuild(), notices);
    expect(priority).toMatchObject({ destination: "roster", tone: "normal" });
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
    expect(getGuildHallPriority(guild, notices).destination).not.toBe("temple");
  });

  it("offers the first actual reward or leadership upgrade, not merely unspendable points", () => {
    const guild = createGuild();
    expect(getGuildHallPriority(guild, { ...notices, guildmaster: true })).toMatchObject({ destination: "guildmaster", tone: "ready" });
    expect(getGuildHallPriority(guild, { ...notices, achievements: true })).toMatchObject({ destination: "achievements", tone: "ready" });
    expect(getGuildHallPriority(guild, { ...notices, daily: true })).toMatchObject({ destination: "gems", tone: "ready" });
  });
});
