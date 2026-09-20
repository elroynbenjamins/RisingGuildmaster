import { describe, expect, it } from "vitest";
import { CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { CHAPTER_1 } from "../src/data/campaign/chapter1";
import { CHAPTER_2 } from "../src/data/campaign/chapter2";
import { ENEMIES } from "../src/data/enemies";
import { QUEST_OUTCOME_NARRATIVES } from "../src/data/quests/questOutcomeNarratives";
import { STORY_SCENES } from "../src/data/story/guildOrigin";
import { LORE_ENTRIES } from "../src/data/world/lore";
import { CAMPAIGN_CHOICES } from "../src/data/campaign/campaignChoices";

describe("dragon and endgame foreshadowing", () => {
  it("escalates clues throughout both campaign chapters", () => {
    const chapterOneFlags = CHAPTER_1.nodeIds.flatMap((id) => Object.keys(CAMPAIGN_NODES[id]?.setWorldFlags ?? {}));
    const chapterTwoFlags = CHAPTER_2.nodeIds.flatMap((id) => Object.keys(CAMPAIGN_NODES[id]?.setWorldFlags ?? {}));
    expect(chapterOneFlags).toEqual(expect.arrayContaining(["five_point_coin_found", "eastward_ward_resonance_found", "first_crown_title_heard", "fivefold_accord_discovered"]));
    expect(chapterTwoFlags).toEqual(expect.arrayContaining(["dragon_excavation_tools_found", "breath_debt_phrase_translated", "first_crown_vault_named", "first_crown_waking_confirmed", "ashlands_endgame_signal"]));
  });

  it("reveals the Fivefold Accord before confirming the sleeping First Crown", () => {
    expect(LORE_ENTRIES.fivefold_accord?.unlockFlag).toBe("lore_fivefold_accord");
    expect(LORE_ENTRIES.first_crown?.unlockFlag).toBe("lore_first_crown");
    expect(LORE_ENTRIES.sleeping_crowns?.unlockFlag).toBe("lore_sleeping_crowns");
    expect(CAMPAIGN_NODES.broken_wardstone?.setWorldFlags?.lore_fivefold_accord).toBe(true);
    expect(CAMPAIGN_NODES.hollow_warden_boss?.setWorldFlags?.lore_sleeping_crowns).toBe(true);
  });

  it("carries the mystery through scenes and quest aftermaths", () => {
    expect(STORY_SCENES.broken_wardstone?.paragraphs.join(" ")).toContain("WHILE THE FIVE DREAM");
    expect(STORY_SCENES.laurel_below?.paragraphs.join(" ")).toContain("First Crown Vault");
    expect(QUEST_OUTCOME_NARRATIVES.goblin_patrol?.victory).toContain("closed eye");
    expect(QUEST_OUTCOME_NARRATIVES.hollow_warden_boss?.victory).toContain("Purple Hearth");
  });

  it("foreshadows living dragons without prematurely adding one to combat", () => {
    expect(Object.keys(ENEMIES).some((id) => id.includes("dragon") || id.includes("first_crown"))).toBe(false);
  });

  it("leaves a distinct endgame hook for every Hollow Forge decision", () => {
    expect(CAMPAIGN_CHOICES.restore_iron_wardstone?.setWorldFlags.first_crown_signal_dimmed).toBe(true);
    expect(CAMPAIGN_CHOICES.entrust_stonegate_keepers?.setWorldFlags.dragon_lullaby_studied).toBe(true);
    expect(CAMPAIGN_CHOICES.retain_heartstone_fragment?.setWorldFlags.first_crown_fragment_resonating).toBe(true);
  });
});
