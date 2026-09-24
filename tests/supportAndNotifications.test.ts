import { describe, expect, it, vi, beforeEach } from "vitest";
const storage = vi.hoisted(() => new Map<string, string>());
vi.mock("@react-native-async-storage/async-storage", () => ({ default: {
  getItem: async (key: string) => storage.get(key) ?? null,
  setItem: async (key: string, value: string) => { storage.set(key, value); },
  removeItem: async (key: string) => { storage.delete(key); },
} }));
import { createGuild } from "../src/game/guild/guildService";
import { testHero } from "./testHero";
import { createHeroContract } from "../src/game/recruitment/contractService";
import { advanceGuildTime, payrollDueOnDay } from "../src/game/economy/guildCalendarService";
import { canUseFreeDailyRevive, reviveHero } from "../src/game/temple/templeService";
import { claimDailyLogin, applyContentEntitlements, getDailyLoginGemReward, unlockPremiumContent } from "../src/game/monetization/contentUnlockService";
import { loadAccountContentEntitlements, saveAccountContentEntitlements } from "../src/game/monetization/accountEntitlementService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { fulfillStorePurchase } from "../src/game/monetization/storePurchaseService";
import { REMOVE_ADS_PRODUCT_ID } from "../src/game/monetization/supportProducts";
import { guildActionNotifications, heroHasSkillChoice } from "../src/ui/actionNotifications";
import { CLASS_SKILL_TREES } from "../src/data/skills/classSkillTrees";
import { GUILDMASTER_SKILLS } from "../src/data/guildmaster/guildmasterSkills";
import { creditVerifiedGems } from "../src/game/monetization/gemService";
beforeEach(() => storage.clear());
describe("fallen hero payroll", () => {
  it("charges only living heroes without erasing pre-death debts", () => {
    const fallen = { ...testHero(), currentHP: 0 }, alive = { ...testHero(), id: "alive" }, base = createGuild();
    const guild = { ...base, heroes: [fallen, alive], heroContracts: [createHeroContract(fallen, 100, 12, 1), createHeroContract(alive, 75, 12, 1)], finance: { ...base.finance, salaryArrearsByHeroId: { [fallen.id]: 20 } } };
    expect(payrollDueOnDay(guild, 8)).toBe(75);
    const result = advanceGuildTime(guild, 7);
    expect(result.guild.finance.totalSalaryPaid).toBe(75);
    expect(result.guild.finance.salaryArrearsByHeroId[fallen.id]).toBe(20);
    expect(result.days[6]?.arrearsAdded).toBe(0);
  });
  it("resumes regular payroll on revival with no back-pay for dead weeks", () => {
    const fallen = { ...testHero(), currentHP: 0, isAvailable: false };
    const deadWeek = advanceGuildTime({ ...createGuild(), heroes: [fallen], heroContracts: [createHeroContract(fallen, 100, 12, 1)] }, 7).guild;
    expect(deadWeek.finance.totalSalaryPaid).toBe(0);
    const revived = reviveHero(deadWeek, fallen.id);
    expect(payrollDueOnDay(revived, 15)).toBe(100);
    expect(advanceGuildTime(revived, 7).guild.finance.totalSalaryPaid).toBe(100);
  });
});
describe("permanent ad removal", () => {
  const purchase = { productId: REMOVE_ADS_PRODUCT_ID, purchaseState: "purchased", transactionId: "owned" };
  it("persists before acknowledgment and never consumes Remove Ads", async () => {
    const events: string[] = [], creditGems = vi.fn();
    expect(await fulfillStorePurchase(purchase, {
      creditGems,
      removeAds: async () => { await saveAccountContentEntitlements({ ...createGuild().entitlements, adsRemoved: true }); events.push("saved"); },
      finish: async (consume) => { expect(consume).toBe(false); events.push("acknowledged"); },
    })).toBe(true);
    expect(events).toEqual(["saved", "acknowledged"]);
    expect(creditGems).not.toHaveBeenCalled();
    expect((await loadAccountContentEntitlements()).adsRemoved).toBe(true);
  });
  it("rejects pending, unknown and invalid purchases", async () => {
    const handlers = { creditGems: vi.fn(), removeAds: vi.fn(), finish: vi.fn() };
    for (const invalid of [{ ...purchase, purchaseState: "pending" }, { ...purchase, productId: "unknown" }, { ...purchase, transactionId: "" }])
      expect(await fulfillStorePurchase(invalid, handlers)).toBe(false);
    expect(handlers.removeAds).not.toHaveBeenCalled();
    expect(handlers.finish).not.toHaveBeenCalled();
  });
  it("does not acknowledge after failed persistence", async () => {
    const finish = vi.fn();
    await expect(fulfillStorePurchase(purchase, { creditGems: vi.fn(), removeAds: async () => { throw Error("Storage failed"); }, finish })).rejects.toThrow("Storage failed");
    expect(finish).not.toHaveBeenCalled();
  });
  it("still consumes gem packs without double credit", async () => {
    let guild = createGuild(); const starting = guild.gems;
    const handlers = { creditGems: (credit: Parameters<typeof creditVerifiedGems>[1]) => { guild = creditVerifiedGems(guild, credit); }, finish: vi.fn(async () => undefined) };
    const gems = { ...purchase, productId: "guildmaster_gems_50" };
    await fulfillStorePurchase(gems, handlers); await fulfillStorePurchase(gems, handlers);
    expect(guild.gems).toBe(starting + 50);
    expect(handlers.finish).toHaveBeenCalledWith(true);
  });
  it("survives concurrent autosaves, new saves and other content unlocks", async () => {
    const base = createGuild();
    await Promise.all([saveAccountContentEntitlements({ ...base.entitlements, adsRemoved: true }), saveAccountContentEntitlements(base.entitlements)]);
    const fresh = applyContentEntitlements({ ...createGuild("Fresh"), gems: 100 }, await loadAccountContentEntitlements());
    expect(unlockPremiumContent(fresh, "monk").entitlements.adsRemoved).toBe(true);
    expect(deserializeGuild(serializeGuild(fresh)).entitlements.adsRemoved).toBe(true);
  });
});

  it("adds 5 daily gems for Remove Ads owners", () => {
    const today = new Date(2026, 8, 4, 10);
    const base = createGuild();
    const owned = { ...base, entitlements: { ...base.entitlements, adsRemoved: true } };
    expect(getDailyLoginGemReward(base)).toBe(10);
    expect(getDailyLoginGemReward(owned)).toBe(15);
    expect(claimDailyLogin(owned, today).gems - owned.gems).toBe(15);
  });
  it("grants one non-stacking free revive per real-world day", () => {
    const today = new Date(2026, 8, 4, 10), tomorrow = new Date(2026, 8, 5, 10);
    const fallenA = { ...testHero(), id: "fallen-a", currentHP: 0, isAvailable: false };
    const fallenB = { ...testHero(), id: "fallen-b", currentHP: 0, isAvailable: false };
    const base = createGuild();
    const owned = { ...base, entitlements: { ...base.entitlements, adsRemoved: true }, heroes: [fallenA, fallenB] };
    expect(canUseFreeDailyRevive(owned, today)).toBe(true);
    const first = reviveHero(owned, fallenA.id, today);
    expect(first.gems).toBe(owned.gems);
    expect(canUseFreeDailyRevive(first, today)).toBe(false);
    expect(canUseFreeDailyRevive(first, tomorrow)).toBe(true);
    const second = reviveHero(first, fallenB.id, today);
    expect(second.gems).toBe(first.gems - 5);
  });

describe("action notification dots", () => {
  it("clears daily dots when claimed and restores them next real day", () => {
    const today = new Date(2026, 8, 4, 10), tomorrow = new Date(2026, 8, 5, 10), guild = createGuild();
    expect(guildActionNotifications(guild, today).daily).toBe(true);
    const claimed = claimDailyLogin(guild, today);
    expect(guildActionNotifications(claimed, today)).toMatchObject({ daily: false, manage: false });
    expect(guildActionNotifications(claimed, tomorrow).daily).toBe(true);
  });
  it("recognizes skills, subclasses and masteries but not dead heroes", () => {
    const hero = testHero(), nodes = CLASS_SKILL_TREES[hero.classId].nodes;
    expect(heroHasSkillChoice(hero)).toBe(false);
    expect(heroHasSkillChoice({ ...hero, level: 2 })).toBe(true);
    expect(heroHasSkillChoice({ ...hero, level: 2, learnedSkillIds: [nodes[0]!.skillId] })).toBe(false);
    const spent = nodes.slice(0, 4).map((node) => node.skillId);
    expect(heroHasSkillChoice({ ...hero, level: 5, learnedSkillIds: spent })).toBe(true);
    expect(heroHasSkillChoice({ ...hero, level: 10, subclassId: "guardian", learnedSkillIds: spent })).toBe(true);
    expect(heroHasSkillChoice({ ...hero, level: 10, currentHP: 0 })).toBe(false);
  });
  it("requires a learnable Guildmaster node rather than just points", () => {
    const base = createGuild();
    expect(guildActionNotifications({ ...base, guildmaster: { ...base.guildmaster, skillPoints: 1 } }).guildmaster).toBe(false);
    expect(guildActionNotifications({ ...base, guildmaster: { ...base.guildmaster, level: 2, skillPoints: 1 } }).guildmaster).toBe(true);
    expect(guildActionNotifications({ ...base, guildmaster: { ...base.guildmaster, level: 99, skillPoints: 99, unlockedSkillIds: Object.values(GUILDMASTER_SKILLS).map((skill) => skill.id) } }).guildmaster).toBe(false);
  });
});

