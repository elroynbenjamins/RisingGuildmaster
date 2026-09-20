import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { testHero } from "./testHero";
import { createHeroContract, renewHeroContract, renewalSalaryForLength } from "../src/game/recruitment/contractService";
import { advanceGuildTime, dailyTavernIncome } from "../src/game/economy/guildCalendarService";
import { getTavernRecruitmentBonuses, startTavernUpgrade } from "../src/game/economy/tavernService";
import { applyBountyReward, getBountyOffers } from "../src/game/quests/bountyService";
import { craftPotion, usePersistentRemedy } from "../src/game/alchemy/potionService";
import { getMaterialMissionIds, getMaterialRecipeIds } from "../src/ui/materialGuidance";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";

describe("management expansion", () => {
  it("stores guild name and crest and migrates v3 saves into the v4 defaults", () => {
    const guild = createGuild("Moonwatch", "veteran", "moonstag");
    expect(guild).toMatchObject({ guildName:"Moonwatch", guildCrestId:"moonstag", bountyProgress:{ claimedOfferIds:[] } });
    const payload = JSON.parse(serializeGuild(guild));
    payload.saveVersion = 3;
    delete payload.guildCrestId;
    delete payload.bountyProgress;
    delete payload.finance.tavernUpgrade;
    payload.heroContracts = [];
    const migrated = deserializeGuild(JSON.stringify(payload));
    expect(migrated.guildCrestId).toBe("crownroad");
    expect(migrated.bountyProgress.claimedOfferIds).toEqual([]);
    expect(migrated.finance.tavernUpgrade).toBeNull();
  });

  it("renews expiring contracts and later returns gear when an expired hero leaves", () => {
    const hero = { ...testHero(), id:"contract-hero", equipment:{ ...testHero().equipment, weapon:"worn-sword" } };
    let guild = createGuild(); guild.heroes=[hero];
    const contract = createHeroContract(hero, 100, 12, guild.currentDay);
    guild.heroContracts=[{ ...contract, endDay:guild.currentDay+1, status:"expiring" }];
    const salary = renewalSalaryForLength(guild.heroContracts[0]!, hero.level, 8);
    const renewed = renewHeroContract(guild,hero.id,8);
    expect(renewed.heroContracts[0]).toMatchObject({ weeklySalary:salary, status:"active", renewalIntent:"undecided" });

    guild.heroContracts=[{ ...contract, endDay:guild.currentDay+1, status:"expiring" }];
    const departed=advanceGuildTime(guild,4).guild;
    expect(departed.heroes).toHaveLength(0);
    expect(departed.inventory).toContain("worn-sword");
    expect(departed.heroContracts).toHaveLength(0);
  });

  it("upgrades the Guild Hall with modest economy and recruitment bonuses", () => {
    let guild=createGuild(); guild.reputation=50; guild.gold=10_000;
    const baseIncome=dailyTavernIncome(guild);
    guild=startTavernUpgrade(guild);
    expect(guild.finance.tavernUpgrade).toMatchObject({targetLevel:2,completionDay:4});
    guild=advanceGuildTime(guild,3).guild;
    expect(guild.finance.tavernLevel).toBe(2);
    expect(dailyTavernIncome(guild)).toBeGreaterThan(baseIncome);
    expect(getTavernRecruitmentBonuses(guild)).toMatchObject({extraCandidates:1,reputationBonus:10});
  });

  it("rotates bounties and only pays each offer once", () => {
    const guild=createGuild(); guild.reputation=50;
    const offers=getBountyOffers(guild);
    expect(offers.length).toBeGreaterThan(0);
    const first=offers[0]!;
    const paid=applyBountyReward(guild,first.questId);
    expect(paid.offer?.id).toBe(first.id);
    expect(paid.guild.gold).toBe(guild.gold+first.bonusGold);
    expect(applyBountyReward(paid.guild,first.questId).offer).toBeNull();
  });

  it("unlocks regional Alchemy and cures persistent conditions with remedies", () => {
    let guild=createGuild(); guild.world.unlockedRegionIds.push("shadowfen");
    guild.materials.venom_gland=1; guild.materials.spider_silk=1; guild.materials.arcane_dust=1;
    guild=craftPotion(guild,"antitoxin");
    const hero={...testHero(),id:"poisoned",conditions:[{conditionId:"poisoned" as const,remainingDuration:3}]};
    guild.heroes=[hero];
    const cured=usePersistentRemedy(guild,hero.id,"antitoxin");
    expect(cured.heroes[0]?.conditions).toEqual([]);
    expect(cured.potions.antitoxin).toBe(0);
  });

  it("links crafting materials to both recipes and Idle Mission sources", () => {
    expect(getMaterialRecipeIds("iron_ore").length).toBeGreaterThan(0);
    expect(getMaterialMissionIds("iron_ore").length).toBeGreaterThan(0);
  });
});
