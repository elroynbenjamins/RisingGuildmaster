import { describe, expect, it } from "vitest";
import { createGuildmasterProfile, grantGuildmasterXp, guildmasterXpToNextLevel, unlockGuildmasterSkill } from "../src/game/guildmaster/guildmasterProgression";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";

describe("Guildmaster progression", () => {
  it("levels from quest XP and awards one skill point per level", () => {
    let profile = createGuildmasterProfile();
    expect(guildmasterXpToNextLevel(1)).toBe(100);
    profile = grantGuildmasterXp(profile, 100);
    expect(profile).toMatchObject({ level: 2, xp: 0, skillPoints: 1 });
    profile = grantGuildmasterXp(profile, 350);
    expect(profile).toMatchObject({ level: 4, xp: 0, skillPoints: 3 });
  });

  it("enforces level, prerequisite, point cost, and permanent unlocks", () => {
    expect(() => unlockGuildmasterSkill(createGuildmasterProfile(), "regional_network")).toThrow("Level 2");
    let profile = grantGuildmasterXp(createGuildmasterProfile(), 100);
    profile = unlockGuildmasterSkill(profile, "regional_network");
    expect(profile.unlockedSkillIds).toEqual(["regional_network"]);
    expect(profile.skillPoints).toBe(0);
    expect(() => unlockGuildmasterSkill(profile, "specialist_headhunting")).toThrow("Level 3");
    expect(() => unlockGuildmasterSkill(profile, "regional_network")).toThrow("already unlocked");
  });

  it("persists progression and migrates legacy saves", () => {
    const guild = createGuild(); guild.guildmaster = { level: 2, xp: 20, skillPoints: 0, unlockedSkillIds: ["regional_network"] };
    expect(deserializeGuild(serializeGuild(guild)).guildmaster).toEqual(guild.guildmaster);
    const legacy = JSON.parse(serializeGuild(guild)); delete legacy.guildmaster;
    expect(deserializeGuild(JSON.stringify(legacy)).guildmaster).toEqual(createGuildmasterProfile());
  });

  it("renders artisan unlocks as a prerequisite tree across multiple levels", () => {
    let profile = grantGuildmasterXp(createGuildmasterProfile(), 1750);
    expect(profile.level).toBe(8);
    profile = unlockGuildmasterSkill(profile, "workshop_planning");
    expect(() => unlockGuildmasterSkill(profile, "advanced_workshops")).toThrow("Prerequisite");
    profile = unlockGuildmasterSkill(profile, "forge_charter");
    profile = unlockGuildmasterSkill(profile, "loom_charter");
    profile = unlockGuildmasterSkill(profile, "lapidary_charter");
    profile = unlockGuildmasterSkill(profile, "advanced_workshops");
    profile = unlockGuildmasterSkill(profile, "masterwork_district");
    expect(profile.unlockedSkillIds).toEqual(expect.arrayContaining(["forge_charter", "loom_charter", "lapidary_charter", "advanced_workshops", "masterwork_district"]));
  });
});
