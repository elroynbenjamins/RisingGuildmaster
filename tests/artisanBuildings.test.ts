import { describe, expect, it } from "vitest";
import { startArtisanConstruction } from "../src/game/crafting/artisanBuildingService";
import { craftEquipment } from "../src/game/crafting/craftingService";
import { advanceGuildDays } from "../src/game/gathering/gatheringService";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";

describe("artisan building progression", () => {
  it.each([
    ["blacksmith", 1, 750], ["blacksmith", 2, 750],
    ["tailor", 1, 750], ["tailor", 2, 750],
    ["jeweler", 1, 750], ["jeweler", 2, 750],
  ] as const)("charges the reduced %s level %i upgrade price", (type, level, cost) => {
    const guild = createGuild();
    guild.gold = cost;
    guild.artisans[type] = { level, recruited: true, construction: null };
    guild.guildmaster.unlockedSkillIds.push("advanced_workshops", "masterwork_district");
    const result = startArtisanConstruction(guild, type);
    expect(result.gold).toBe(0);
    expect(result.artisans[type].construction?.goldCost).toBe(cost);
    expect(() => startArtisanConstruction({ ...guild, gold: cost - 1 }, type)).toThrow("Not enough gold");
  });

  it("starts all workshops locked and prevents crafting", () => {
    const guild = createGuild();
    expect(guild.artisans).toMatchObject({ blacksmith: { level: 0, recruited: false, construction: null }, tailor: { level: 0, recruited: false }, jeweler: { level: 0, recruited: false } });
    expect(() => craftEquipment(guild, "forge_iron_longsword")).toThrow("not been recruited");
    expect(() => startArtisanConstruction(guild, "blacksmith")).toThrow("Guildmaster skill");
  });

  it("charges gold and completes the Guild Forge after two in-game days", () => {
    const guild = createGuild(); guild.guildmaster = { level: 3, xp: 0, skillPoints: 0, unlockedSkillIds: ["workshop_planning", "forge_charter"] };
    const started = startArtisanConstruction(guild, "blacksmith");
    expect(started.gold).toBe(guild.gold - 500);
    expect(started.artisans.blacksmith).toMatchObject({ level: 0, recruited: false, construction: { targetLevel: 1, startDay: 1, completionDay: 3, goldCost: 500 } });
    const dayTwo = advanceGuildDays(started);
    expect(dayTwo.artisans.blacksmith.level).toBe(0);
    const complete = advanceGuildDays(dayTwo);
    expect(complete.artisans.blacksmith).toEqual({ level: 1, recruited: true, construction: null });
  });

  it("requires the correct higher-tier Guildmaster node for upgrades", () => {
    const guild = createGuild(); guild.artisans.blacksmith = { level: 1, recruited: true, construction: null }; guild.guildmaster = { level: 5, xp: 0, skillPoints: 0, unlockedSkillIds: ["workshop_planning", "forge_charter"] };
    expect(() => startArtisanConstruction(guild, "blacksmith")).toThrow("Guildmaster skill");
    guild.guildmaster.unlockedSkillIds.push("advanced_workshops");
    const upgrade = startArtisanConstruction(guild, "blacksmith");
    expect(upgrade.artisans.blacksmith.construction).toMatchObject({ targetLevel: 2, completionDay: 4 });
    expect(upgrade.gold).toBe(guild.gold - 750);
  });

  it("persists active multi-day construction projects", () => {
    const guild = createGuild(); guild.guildmaster = { level: 4, xp: 0, skillPoints: 0, unlockedSkillIds: ["workshop_planning", "lapidary_charter"] };
    const started = startArtisanConstruction(guild, "jeweler");
    expect(deserializeGuild(serializeGuild(started)).artisans.jeweler).toEqual(started.artisans.jeweler);
  });
});
