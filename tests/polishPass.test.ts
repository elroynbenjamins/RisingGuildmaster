import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { getCampaignNodeLocationRequirement } from "../src/game/campaign/campaignLocationService";
import { getCampaignTravelStep } from "../src/game/campaign/campaignTravelService";
import { getLevelAppropriateQuestLootIds } from "../src/game/quests/questResolver";
import { hasLocalHealingService, healHeroToHalf } from "../src/game/temple/templeService";
import { testHero } from "./testHero";

describe("polish and progression pass", () => {
  it("defaults and migrates enemy turn speed to normal", () => {
    const guild = createGuild();
    expect(guild.uiPreferences.enemyTurnSpeed).toBe("normal");
    const legacy = JSON.parse(serializeGuild(guild));
    delete legacy.uiPreferences.enemyTurnSpeed;
    expect(deserializeGuild(JSON.stringify(legacy)).uiPreferences.enemyTurnSpeed).toBe("normal");
  });

  it("uses explicit campaign story locations and previews the next legal road leg", () => {
    const guild = createGuild();
    guild.world.unlockedRegionIds = ["greenveil", "iron_hills", "frostmarch"];
    expect(getCampaignNodeLocationRequirement("council_of_splinters")).toEqual({ regionId: "iron_hills", settlementIds: ["stonegate"] });
    expect(getCampaignNodeLocationRequirement("northwatch_two_skies")).toEqual({ regionId: "frostmarch", settlementIds: ["northwatch"] });
    const step = getCampaignTravelStep(guild, "northwatch_two_skies", 4);
    expect(step).toMatchObject({ kind: "region", destinationRegionId: "iron_hills", label: "Iron Hills" });
    expect(step.days).toBeGreaterThan(0);
    expect(step.rationCost).toBeGreaterThan(0);
  });

  it("requires a local Temple or healer before treatment actions", () => {
    const hero = { ...testHero(), currentHP: 30 };
    const guild = createGuild(); guild.heroes = [hero];
    expect(hasLocalHealingService(guild.world)).toBe(true);
    const remote = { ...guild, world: { ...guild.world, currentSettlementId: "brambleford" } };
    expect(hasLocalHealingService(remote.world)).toBe(false);
    expect(() => healHeroToHalf(remote, hero.id)).toThrow("No Temple or healer");
  });

  it("prefers participant-usable upgrades and avoids owned duplicates", () => {
    const ranger = { ...testHero(), classId: "ranger" as const, level: 3, equipment: { weapon: null, armor: null, helmet: null, boots: null, accessory1: null, accessory2: null } };
    expect(getLevelAppropriateQuestLootIds(["iron-warhammer", "oak-recurve-bow"], [ranger])).toEqual(["oak-recurve-bow"]);
    expect(getLevelAppropriateQuestLootIds(["oak-recurve-bow", "scout-cloak"], [ranger], ["oak-recurve-bow"])).toEqual(["scout-cloak"]);
  });
});
