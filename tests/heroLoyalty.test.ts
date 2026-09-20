import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { advanceGuildTime, paySalaryArrears } from "../src/game/economy/guildCalendarService";
import { createGuild } from "../src/game/guild/guildService";
import { applyQuestLoyaltyConsequences, createHeroLoyaltyState, getHeroLoyalty, getHeroLoyaltyBand, getRenewalSalaryForGuild, renewHeroContract } from "../src/game/heroes/heroLoyaltyService";
import { createHeroContract } from "../src/game/recruitment/contractService";
import { testHero } from "./testHero";

describe("hero loyalty and contracts", () => {
  it("starts recruited heroes steady and changes loyalty through real guild outcomes", () => {
    const hero = { ...testHero(), id: "loyalty-hero", name: "Mira" };
    let guild = createGuild();
    guild.heroes = [hero];
    guild.heroLoyaltyByHeroId[hero.id] = createHeroLoyaltyState();

    guild = applyQuestLoyaltyConsequences(guild, "victory", [{ heroId: hero.id, fellInBattle: false, newlyInjured: false }], QUESTS.goblin_patrol!);
    expect(getHeroLoyalty(guild, hero.id).score).toBe(61);
    expect(getHeroLoyaltyBand(61)).toBe("steady");

    guild = applyQuestLoyaltyConsequences(guild, "defeat", [{ heroId: hero.id, fellInBattle: true, newlyInjured: false }], QUESTS.goblin_patrol!);
    expect(getHeroLoyalty(guild, hero.id).score).toBe(56);
  });

  it("rewards full payroll, punishes salary debt, and recovers some trust after arrears are settled", () => {
    const paidHero = { ...testHero(), id: "paid", name: "Paid" };
    let paidGuild = createGuild(); paidGuild.heroes = [paidHero]; paidGuild.heroLoyaltyByHeroId[paidHero.id] = createHeroLoyaltyState(); paidGuild.heroContracts = [createHeroContract(paidHero, 100, 12, 1)];
    paidGuild = advanceGuildTime(paidGuild, 7).guild;
    expect(getHeroLoyalty(paidGuild, paidHero.id).score).toBe(61);

    const owedHero = { ...testHero(), id: "owed", name: "Owed" };
    let owedGuild = createGuild(); owedGuild.gold = 0; owedGuild.heroes = [owedHero]; owedGuild.heroLoyaltyByHeroId[owedHero.id] = createHeroLoyaltyState(); owedGuild.heroContracts = [createHeroContract(owedHero, 9999, 12, 1)];
    owedGuild = advanceGuildTime(owedGuild, 7).guild;
    expect(getHeroLoyalty(owedGuild, owedHero.id).score).toBeLessThan(60);
    const afterDebtScore = getHeroLoyalty(owedGuild, owedHero.id).score;
    owedGuild = paySalaryArrears({ ...owedGuild, gold: 20000 }, owedHero.id);
    expect(getHeroLoyalty(owedGuild, owedHero.id).score).toBe(afterDebtScore + 2);
  });

  it("makes loyal heroes cheaper to renew and unhappy heroes more expensive", () => {
    const hero = { ...testHero(), id: "contract-hero", level: 6 };
    const contract = { ...createHeroContract(hero, 100, 12, 1), status: "expired" as const };
    const guild = createGuild(); guild.heroes = [hero]; guild.heroContracts = [contract];

    guild.heroLoyaltyByHeroId[hero.id] = createHeroLoyaltyState(90);
    const devoted = getRenewalSalaryForGuild(guild, contract, hero.level);
    guild.heroLoyaltyByHeroId[hero.id] = createHeroLoyaltyState(15);
    const resentful = getRenewalSalaryForGuild(guild, contract, hero.level);
    expect(devoted).toBeLessThan(resentful);

    const renewed = renewHeroContract(guild, hero.id, 12);
    expect(renewed.heroContracts[0]).toMatchObject({ status: "active", weeklySalary: resentful, renewalIntent: "undecided" });
    expect(renewed.heroes[0]?.salary).toBe(resentful);
    expect(getHeroLoyalty(renewed, hero.id).score).toBe(18);
  });

  it("preserves short renewal terms and blocks renewal while salary is owed", () => {
    const hero = testHero(); const guild = createGuild(); guild.heroes = [hero];
    guild.heroContracts = [{...createHeroContract(hero, 100, 12, 1), status: "expiring", renewalIntent: "depart"}];
    const renewed = renewHeroContract(guild, hero.id, 4);
    expect(renewed.heroContracts[0]).toMatchObject({endDay: guild.currentDay + 28, renewalIntent: "undecided"});
    expect(renewed.heroes[0]?.salary).toBe(renewed.heroContracts[0]?.weeklySalary);
    guild.finance.salaryArrearsByHeroId[hero.id] = 20;
    expect(() => renewHeroContract(guild, hero.id, 8)).toThrow(/arrears/);
  });
});
