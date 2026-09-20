import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { createGuild } from "../src/game/guild/guildService";
import { getQuestEquipmentDropChance, getQuestGoldModifier, getQuestXpForHero } from "../src/game/quests/questResolver";
import { advanceRegionalThreats, unlockRegionalThreats } from "../src/game/world/regionalThreatService";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { testHero } from "./testHero";

const goldMidpoint = (id: keyof typeof QUESTS) => {
  const quest = QUESTS[id]!;
  return (quest.goldRewardMin + quest.goldRewardMax) / 2;
};

describe("full balance polish safeguards", () => {
  it("keeps the established 10-percent-faster XP curve intact", () => {
    expect(xpRequiredForNextLevel(1)).toBe(900);
    expect(xpRequiredForNextLevel(2)).toBe(2068);
  });

  it("reduces overlevel XP on repeatable hunts but never penalizes one-time stories", () => {
    const hero = testHero();
    const hunt = QUESTS.coils_of_the_sunken_grove!;
    const inRange = getQuestXpForHero({ ...hero, level: hunt.recommendedLevelMax! }, hunt, 4);
    const overlevel = getQuestXpForHero({ ...hero, level: hunt.recommendedLevelMax! + 4 }, hunt, 4);
    expect(overlevel).toBe(Math.max(1, Math.round(inRange * .10)));

    const oneTime = QUESTS.hunt_spider_queen!;
    const oneTimeInRange = getQuestXpForHero({ ...hero, level: oneTime.recommendedLevelMax! }, oneTime, 4);
    const oneTimeLate = getQuestXpForHero({ ...hero, level: oneTime.recommendedLevelMax! + 6 }, oneTime, 4);
    expect(oneTimeLate).toBe(oneTimeInRange);
  });

  it("guarantees story-quest equipment but reduces repeatable gear flooding", () => {
    expect(getQuestEquipmentDropChance(QUESTS.goblin_patrol!)).toBe(1);
    expect(getQuestEquipmentDropChance(QUESTS.goblin_chieftain_boss!)).toBe(1);
    expect(getQuestEquipmentDropChance(QUESTS.orchard_road_patrol!)).toBe(.55);
    expect(getQuestEquipmentDropChance(QUESTS.coils_of_the_sunken_grove!)).toBe(.65);
  });

  it("puts late settlement side quests onto the modern level 11-14 reward scale", () => {
    expect(goldMidpoint("emberfall_glass_rain")).toBeGreaterThanOrEqual(2500);
    expect(goldMidpoint("cinderwell_stolen_water")).toBeGreaterThanOrEqual(2400);
    expect(goldMidpoint("red_mesa_broken_oath")).toBeGreaterThanOrEqual(2900);
    expect(QUESTS.emberfall_glass_rain?.xpRewardPerHero).toBeGreaterThanOrEqual(1400);
    expect(QUESTS.cinderwell_stolen_water?.xpRewardPerHero).toBeGreaterThanOrEqual(1350);
    expect(QUESTS.red_mesa_broken_oath?.xpRewardPerHero).toBeGreaterThanOrEqual(1650);
  });

  it("applies the Threat 3 contract risk premium when repeatable work exists in that region", () => {
    const guild = createGuild();
    guild.world = advanceRegionalThreats(unlockRegionalThreats(guild.world), 60);
    const shadowfenContract = { ...QUESTS.spider_nest!, regionId: "shadowfen" };
    expect(guild.world.regionThreat?.shadowfen).toBe(3);
    expect(getQuestGoldModifier(guild, shadowfenContract, [])).toBeCloseTo(.25);
  });
});
