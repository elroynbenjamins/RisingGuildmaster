import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getGuildPriority } from "../src/game/guild/guildPriorityService";
import { testHero } from "./testHero";

describe("Guildmaster priorities", () => {
  it("guides an empty guild into recruitment", () => { expect(getGuildPriority(createGuild())).toMatchObject({ id: "found_roster", destination: "recruitment" }); });
  it("prioritizes fallen heroes over campaign progress", () => { const guild = createGuild(); guild.heroes = [{ ...testHero(), currentHP: 0 }, ...[1, 2, 3].map((index) => ({ ...testHero(), id: `hero-${index}` }))]; expect(getGuildPriority(guild)).toMatchObject({ id: "revive_fallen", destination: "temple" }); });
  it("surfaces the next available campaign node for a ready party", () => { const guild = createGuild(); guild.heroes = [0, 1, 2, 3].map((index) => ({ ...testHero(), id: `hero-${index}` })); expect(getGuildPriority(guild)).toMatchObject({ id: "campaign_founding_the_guild", destination: "campaign" }); });
  it("raises an escalating regional threat above normal campaign guidance", () => { const guild = createGuild(); guild.heroes = [0, 1, 2, 3].map((index) => ({ ...testHero(), id: `hero-${index}` })); guild.world.regionThreat = { shadowfen: 3 }; expect(getGuildPriority(guild)).toMatchObject({ id: "regional_crisis", destination: "world", tone: "urgent" }); });
});
