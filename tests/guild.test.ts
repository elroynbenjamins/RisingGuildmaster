import { describe, expect, it } from "vitest";
import { createGuild, recruitHero } from "../src/game/guild/guildService";
import { testHero } from "./testHero";
describe("guild recruitment", () => { it("charges gold and adds the hero", () => { const guild = recruitHero(createGuild(), testHero()); expect(guild.gold).toBe(4700); expect(guild.heroes).toHaveLength(1); }); it("prevents duplicates", () => { const hero = testHero(); expect(() => recruitHero(recruitHero(createGuild(), hero), hero)).toThrow(); }); });
