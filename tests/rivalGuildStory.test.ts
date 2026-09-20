import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHOICES } from "../src/data/campaign/campaignChoices";
import { CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { IRON_LAUREL, IRON_LAUREL_CHARACTERS, IRON_LAUREL_RIVALRY_ENCOUNTERS } from "../src/data/rivalries/ironLaurel";
import { GUILD_ORIGIN_SCENE } from "../src/data/story/guildOrigin";
import { completeCampaignNode } from "../src/game/campaign/campaignService";
import { resolveCampaignChoice } from "../src/game/campaign/campaignChoiceResolver";
import { getReputationToMatch, getRivalryStanding } from "../src/game/rivalries/rivalryService";
import { createWorldState } from "../src/game/world/worldState";

describe("guild origin and Iron Laurel rivalry", () => {
  it("links the founding node to Blackbridge, the rival guild, and three founding vows", () => {
    expect(CAMPAIGN_NODES.founding_the_guild).toMatchObject({ type: "choice", storySceneId: "guild_origin_iron_laurel", choiceIds: ["vow_protect_heroes", "vow_expose_laurel", "vow_surpass_all"] });
    expect(GUILD_ORIGIN_SCENE.paragraphs.join(" ")).toContain("Blackbridge");
    expect(GUILD_ORIGIN_SCENE.paragraphs.join(" ")).toContain("Iron Laurel");
  });

  it("stores exactly one persistent founding vow", () => {
    const protectedHeroes = resolveCampaignChoice(createWorldState(), "vow_protect_heroes");
    expect(protectedHeroes.worldFlags.founding_vow_protection).toBe(true);
    const changed = resolveCampaignChoice(protectedHeroes, "vow_surpass_all");
    expect(changed.worldFlags).toMatchObject({ founding_vow_protection: false, founding_vow_justice: false, founding_vow_ambition: true });
    expect(Object.values(CAMPAIGN_CHOICES).filter((choice) => choice.id.startsWith("vow_")).every((choice) => choice.description)).toBe(true);
  });

  it("reveals the rivalry when the founding node is completed", () => {
    const chosen = resolveCampaignChoice(createWorldState(), "vow_expose_laurel");
    const completed = completeCampaignNode(chosen, "founding_the_guild").worldState;
    expect(completed.worldFlags).toMatchObject({ founding_vow_justice: true, iron_laurel_rivalry_known: true, lore_iron_laurel: true });
  });

  it("tracks progress toward surpassing the Iron Laurel", () => {
    expect(IRON_LAUREL).toMatchObject({ startingReputation: 80, leaderCharacterId: "cassian_vane", championCharacterId: "serah_kaine" });
    expect(getRivalryStanding(0, IRON_LAUREL)).toBe("unknown");
    expect(getRivalryStanding(40, IRON_LAUREL)).toBe("challenger");
    expect(getRivalryStanding(80, IRON_LAUREL)).toBe("equal");
    expect(getRivalryStanding(100, IRON_LAUREL)).toBe("surpassed");
    expect(getReputationToMatch(25, IRON_LAUREL)).toBe(55);
  });

  it("prepares staged nonlethal hero-versus-hero encounters using playable races and classes", () => {
    expect(Object.values(IRON_LAUREL_RIVALRY_ENCOUNTERS).map(({ chapter, mode }) => [chapter, mode])).toEqual([[2, "nonlethal_duel"], [3, "guild_battle"], [4, "guild_battle"]]);
    for (const encounter of Object.values(IRON_LAUREL_RIVALRY_ENCOUNTERS)) for (const id of encounter.opponentCharacterIds) expect(IRON_LAUREL_CHARACTERS[id]).toBeDefined();
    expect(new Set(Object.values(IRON_LAUREL_CHARACTERS).map((character) => character.raceId))).toEqual(new Set(["human", "elf", "dwarf"]));
    expect(Object.values(IRON_LAUREL_CHARACTERS).every((character) => ["warrior", "ranger", "mage", "cleric", "paladin", "berserker"].includes(character.classId))).toBe(true);
  });
});
