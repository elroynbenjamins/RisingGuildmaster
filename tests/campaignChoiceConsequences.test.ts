import { describe, expect, it } from "vitest";
import { applyCampaignChoiceToGuild, getChieftainChoiceEcho, getGhorakChoiceEcho } from "../src/game/campaign/campaignChoiceResolver";
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
