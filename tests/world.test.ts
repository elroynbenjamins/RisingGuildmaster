import { describe, expect, it } from "vitest";
import { REGIONS } from "../src/data/world/regions";
import { SETTLEMENTS } from "../src/data/world/settlements";
import { WORLD_EVENTS } from "../src/data/world/worldEvents";
import { CHAPTER_1 } from "../src/data/campaign/chapter1";
import { completeCampaignNode, getAvailableCampaignNodes } from "../src/game/campaign/campaignService";
import { resolveCampaignChoice } from "../src/game/campaign/campaignChoiceResolver";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { canTravel, rollTravelEvent, travelToRegion } from "../src/game/world/travelService";
import { resolveAbilityCheck, resolveEventChoice } from "../src/game/world/worldEventResolver";
import { createWorldState } from "../src/game/world/worldState";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

describe("persistent world and campaign", () => {
  it("defines Eldoria's five connected regions and five settlements", () => { expect(Object.keys(REGIONS)).toHaveLength(5); expect(Object.keys(SETTLEMENTS)).toHaveLength(5); expect(REGIONS.greenveil?.connectedRegionIds).toEqual(["iron_hills", "shadowfen"]); expect(REGIONS.iron_hills?.connectedRegionIds).toEqual(["greenveil", "frostmarch", "ashlands"]); });
  it("rejects locked travel, then permits direct travel after Chapter 1", () => { let world = createWorldState(); expect(canTravel(world, "iron_hills")).toBe(false); expect(() => travelToRegion(world, "iron_hills", sequenceRandom([.9]))).toThrow(); for (const id of CHAPTER_1.nodeIds) world = completeCampaignNode(world, id).worldState; expect(world.unlockedRegionIds).toEqual(expect.arrayContaining(["greenveil", "iron_hills", "shadowfen"])); expect(travelToRegion(world, "iron_hills", sequenceRandom([.9])).state.currentRegionId).toBe("iron_hills"); expect(() => travelToRegion(world, "ashlands", sequenceRandom([.9]))).toThrow(); });
  it("uses exactly 20 percent travel event probability and weighted regional events", () => { expect(rollTravelEvent("greenveil", sequenceRandom([.199, 0]))?.id).toBe("broken_caravan"); expect(rollTravelEvent("greenveil", sequenceRandom([.2]))).toBeNull(); expect(rollTravelEvent("shadowfen", sequenceRandom([0, 0]))).toBeNull(); });
  it("resolves non-combat D20 checks with floor(attribute / 4)", () => { const hero = { ...testHero(), baseAttributes: { ...testHero().baseAttributes, strength: 16 } }; expect(resolveAbilityCheck({ attribute: "strength", difficultyClass: 12 }, [hero], sequenceRandom([.35]))).toMatchObject({ diceRoll: 8, modifier: 4, total: 12, success: true }); });
  it("applies explicit travel event outcomes", () => { const hero = { ...testHero(), baseAttributes: { ...testHero().baseAttributes, strength: 16 } }; const choice = WORLD_EVENTS.broken_caravan!.choices[0]!; const result = resolveEventChoice(choice, [hero], createWorldState(), sequenceRandom([.35])); expect(result.goldDelta).toBe(40); expect(result.worldState.factionReputation.merchants).toBe(2); });
  it("enforces campaign prerequisites, choices, flags, rewards, and chapter progression", () => { let world = createWorldState(); expect(getAvailableCampaignNodes(world).map((node) => node.id)).toEqual(["founding_the_guild"]); expect(() => completeCampaignNode(world, "missing_merchant")).toThrow(); for (const id of CHAPTER_1.nodeIds.slice(0, -1)) world = completeCampaignNode(world, id).worldState; world = resolveCampaignChoice(world, "spare_chieftain"); expect(world.worldFlags.chieftain_spared).toBe(true); world = resolveCampaignChoice(world, "execute_chieftain"); expect(world.worldFlags.chieftain_spared).toBe(false); expect(world.worldFlags.chieftain_killed).toBe(true); const final = completeCampaignNode(world, "broken_wardstone"); expect(final).toMatchObject({ goldReward: 500, guildReputationReward: 10 }); expect(final.worldState.campaignChapter).toBe(2); expect(final.worldState.worldFlags.greenveil_wardstone_damaged).toBe(true); });
  it("round-trips world and hero subclass state through save serialization", () => { const guild = createGuild(); guild.world.worldFlags.test = true; guild.world.unlockedRegionIds.push("iron_hills"); guild.heroes = [{ ...testHero(), level: 10, subclassId: "guardian" }]; const loaded = deserializeGuild(serializeGuild(guild)); expect(loaded.world.worldFlags.test).toBe(true); expect(loaded.world.unlockedRegionIds).toContain("iron_hills"); expect(loaded.heroes[0]?.subclassId).toBe("guardian"); });
});
