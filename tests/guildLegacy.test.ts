import { describe, expect, it } from "vitest";
import { dailyTavernIncome } from "../src/game/economy/guildCalendarService";
import { createGuild } from "../src/game/guild/guildService";
import { createGuildLegacyState, displayedTrophyBonus, getGuildRank, getNextGuildRank, getQuestReputationReward, getUnlockedTrophyIds, toggleDisplayedTrophy } from "../src/game/renown/guildLegacyService";
import { buyRations, getRationBundleAmount } from "../src/game/world/travelService";

describe("guild renown and trophies", () => {
  it("resolves visible rank milestones", () => {
    expect(getGuildRank(0).id).toBe("unknown_charter");
    expect(getGuildRank(50).id).toBe("local_company");
    expect(getGuildRank(1200).id).toBe("legendary_order");
    expect(getNextGuildRank(149)?.id).toBe("regional_guild");
    expect(getNextGuildRank(1200)).toBeNull();
  });

  it("turns ranks into numeric economy, display and reputation benefits",()=>{expect(getGuildRank(0).benefits.trophyDisplaySlots).toBe(0);expect(getGuildRank(50).benefits).toMatchObject({trophyDisplaySlots:3,tavernIncomeModifier:.05});expect(getGuildRank(700).benefits.contractGoldModifier).toBe(.15);expect(getQuestReputationReward(1200,"boss",6)).toBeGreaterThan(getQuestReputationReward(0,"boss",6));});

  it("unlocks trophies from completed victories and never from undiscovered quests", () => {
    expect(getUnlockedTrophyIds(["goblin_chieftain_boss", "hunt_spider_queen"])).toEqual(["chieftains_banner", "spider_queen_fang"]);
    expect(() => toggleDisplayedTrophy(createGuildLegacyState(), "blackbridge_bell", [])).toThrow("not been earned");
  });

  it("places and removes trophies without altering trophy definitions", () => {
    const placed = toggleDisplayedTrophy(createGuildLegacyState(), "chieftains_banner", ["chieftains_banner"]);
    expect(placed.displayedTrophyIds).toEqual(["chieftains_banner"]);
    expect(displayedTrophyBonus(placed, "tavern_income")).toBe(.02);
    expect(toggleDisplayedTrophy(placed, "chieftains_banner", ["chieftains_banner"]).displayedTrophyIds).toEqual([]);
  });

  it("applies displayed trophy bonuses to real guild rewards", () => {
    const base = createGuild();
    const decorated = { ...base, legacy: { displayedTrophyIds: ["chieftains_banner", "blackbridge_bell"] } };
    expect(dailyTavernIncome(decorated)).toBe(Math.round(dailyTavernIncome(base) * 1.02));
    expect(getRationBundleAmount(decorated)).toBe(Math.round(getRationBundleAmount(base) * 1.05));
    decorated.world.currentSettlementId = "guildhaven";
    expect(buyRations(decorated).rations - decorated.rations).toBe(getRationBundleAmount(decorated));
  });

  it("starts new saves with an empty serializable legacy state", () => {
    const guild = createGuild();
    expect(guild.legacy).toEqual({ displayedTrophyIds: [] });
    expect(JSON.parse(JSON.stringify(guild)).legacy).toEqual({ displayedTrophyIds: [] });
  });
});
