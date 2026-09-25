import { describe, expect, it } from "vitest";
import { applyCampaignChoiceToGuild, getChieftainChoiceEcho } from "../src/game/campaign/campaignChoiceResolver";
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
