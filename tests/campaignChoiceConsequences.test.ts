import { describe, expect, it } from "vitest";
import { applyCampaignChoiceToGuild, getChieftainChoiceEcho, getGhorakChoiceEcho, getHeartstoneChoiceEcho, getMoonGateChoiceEcho, getNorthwatchCouncilChoiceEcho } from "../src/game/campaign/campaignChoiceResolver";
import { createGuild } from "../src/game/guild/guildService";

describe("Goblin Chieftain campaign consequences", () => {
  it("uses mercy as the reputation path and preserves testimony", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "spare_chieftain");
    expect(result.reputation).toBe(guild.reputation + 6);
    expect(result.gold).toBe(guild.gold);
    expect(result.guildmaster).toEqual(guild.guildmaster);
    expect(result.world.worldFlags).toMatchObject({
      chieftain_spared: true,
      chieftain_killed: false,
      chieftain_imprisoned: false,
      chieftain_testimony_volunteered: true,
    });
    expect(getChieftainChoiceEcho(result.world)?.title).toContain("Testimony");
  });

  it("uses execution as the immediate treasury path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "execute_chieftain");
    expect(result.gold).toBe(guild.gold + 200);
    expect(result.reputation).toBe(guild.reputation);
    expect(result.guildmaster).toEqual(guild.guildmaster);
    expect(result.world.worldFlags).toMatchObject({
      chieftain_spared: false,
      chieftain_killed: true,
      chieftain_imprisoned: false,
      chieftain_war_chest_seized: true,
    });
    expect(getChieftainChoiceEcho(result.world)?.title).toContain("War Chest");
  });

  it("uses imprisonment as the Guildmaster progression path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "imprison_chieftain");
    expect(result.gold).toBe(guild.gold);
    expect(result.reputation).toBe(guild.reputation);
    expect(result.guildmaster).toMatchObject({ level: 1, xp: 60, skillPoints: 0 });
    expect(result.world.worldFlags).toMatchObject({
      chieftain_spared: false,
      chieftain_killed: false,
      chieftain_imprisoned: true,
      chieftain_interrogation_recorded: true,
    });
    expect(getChieftainChoiceEcho(result.world)?.title).toContain("Interrogation");
  });
});

describe("Ghorak campaign consequences", () => {
  it("uses alliance as the reputation and guided-expedition path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "free_ghoraks_clan");
    expect(result.reputation).toBe(guild.reputation + 6);
    expect(result.world.worldFlags).toMatchObject({ ghorak_allied: true, orc_clans_respected: true, ghorak_guide_unused: true });
    expect(getGhorakChoiceEcho(result.world)?.title).toContain("Oath");
  });

  it("uses trial as the Guildmaster progression path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "bind_ghorak_to_trial");
    expect(result.guildmaster).toMatchObject({ level: 1, xp: 75, skillPoints: 0 });
    expect(result.world.worldFlags).toMatchObject({ ghorak_imprisoned: true, ghorak_trial_recorded: true });
    expect(getGhorakChoiceEcho(result.world)?.title).toContain("Stonegate");
  });

  it("uses banishment as the immediate forge-material path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "banish_ghorak");
    expect(result.materials.iron_ore).toBe(guild.materials.iron_ore + 6);
    expect(result.materials.coal).toBe(guild.materials.coal + 4);
    expect(result.world.worldFlags).toMatchObject({ ghorak_banished: true, ghorak_supplies_reclaimed: true });
    expect(getGhorakChoiceEcho(result.world)?.title).toContain("Flintwatch");
  });
});


describe("Hollow Warden campaign consequences", () => {
  it("uses restoration as the public-trust path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "restore_iron_wardstone");
    expect(result.reputation).toBe(guild.reputation + 8);
    expect(result.world.worldFlags.first_crown_signal_dimmed).toBe(true);
    expect(getHeartstoneChoiceEcho(result.world)?.title).toContain("Mountain Ward");
  });

  it("uses Stonegate study as the Guildmaster progression path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "entrust_stonegate_keepers");
    expect(result.guildmaster).toMatchObject({ level: 1, xp: 75, skillPoints: 0 });
    expect(result.world.worldFlags.dragon_lullaby_studied).toBe(true);
    expect(getHeartstoneChoiceEcho(result.world)?.title).toContain("Dragon Lullaby");
  });

  it("uses retained evidence as the crafting-material path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "retain_heartstone_fragment");
    expect(result.materials.arcane_dust).toBe(guild.materials.arcane_dust + 4);
    expect(result.materials.rough_sapphire).toBe(guild.materials.rough_sapphire + 1);
    expect(result.world.worldFlags.first_crown_fragment_resonating).toBe(true);
    expect(getHeartstoneChoiceEcho(result.world)?.title).toContain("Fragment");
  });
});

describe("Chapter 3 campaign consequences", () => {
  it("uses open gates as the public-trust path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "open_northwatch_gates");
    expect(result.reputation).toBe(guild.reputation + 8);
    expect(result.world.worldFlags.northwatch_guest_right_honored).toBe(true);
    expect(getNorthwatchCouncilChoiceEcho(result.world)?.title).toContain("Guest-Right");
  });

  it("uses fortification as the supply path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "fortify_northwatch_first");
    expect(result.rations).toBe(guild.rations + 6);
    expect(result.world.worldFlags.northwatch_reserve_stores_secured).toBe(true);
    expect(getNorthwatchCouncilChoiceEcho(result.world)?.title).toContain("Wall");
  });

  it("uses Silverbough as the coordination path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "send_refugees_to_silverbough");
    expect(result.guildmaster).toMatchObject({ level: 1, xp: 60, skillPoints: 0 });
    expect(result.world.worldFlags.silverbough_alliance_strengthened).toBe(true);
  });

  it("uses the northern lullaby as the material path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "sing_northern_lullaby");
    expect(result.materials.frost_crystal).toBe(guild.materials.frost_crystal + 2);
    expect(result.materials.rough_sapphire).toBe(guild.materials.rough_sapphire + 1);
    expect(getMoonGateChoiceEcho(result.world)?.title).toContain("Lullaby");
  });

  it("uses the Northwatch shield as the reputation path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "shield_northwatch");
    expect(result.reputation).toBe(guild.reputation + 8);
    expect(getMoonGateChoiceEcho(result.world)?.title).toContain("Ward");
  });

  it("uses the false-aurora trace as the intelligence path", () => {
    const guild = createGuild();
    const result = applyCampaignChoiceToGuild(guild, "trace_false_aurora");
    expect(result.guildmaster).toMatchObject({ level: 1, xp: 75, skillPoints: 0 });
    expect(result.world.worldFlags.ash_herald_route_known).toBe(true);
    expect(getMoonGateChoiceEcho(result.world)?.title).toContain("Source");
  });
});
