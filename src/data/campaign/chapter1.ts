import type { CampaignChapterDefinition, CampaignNodeDefinition } from "../../game/campaign/campaignTypes";
export const CHAPTER_1: CampaignChapterDefinition = { id: "chapter_1", chapterNumber: 1, name: "A Guild of Your Own", nodeIds: ["founding_the_guild", "campaign_goblin_patrol", "missing_merchant", "strange_tracks", "attack_on_guildhaven", "goblin_chieftain", "broken_wardstone"] };
export const CAMPAIGN_NODES: Record<string, CampaignNodeDefinition> = {
  founding_the_guild: { id: "founding_the_guild", chapterId: "chapter_1", type: "dialogue", title: "Founding the Guild", prerequisiteNodeIds: [], setWorldFlags: { lore_guildhaven: true, lore_greenveil: true } },
  campaign_goblin_patrol: { id: "campaign_goblin_patrol", chapterId: "chapter_1", type: "quest", title: "Goblin Patrol", prerequisiteNodeIds: ["founding_the_guild"], questId: "goblin_patrol" },
  missing_merchant: { id: "missing_merchant", chapterId: "chapter_1", type: "quest", title: "The Missing Merchant", prerequisiteNodeIds: ["campaign_goblin_patrol"], questId: "missing_merchant" },
  strange_tracks: { id: "strange_tracks", chapterId: "chapter_1", type: "choice", title: "Strange Tracks", prerequisiteNodeIds: ["missing_merchant"], choiceIds: ["track_carefully", "track_quickly"], setWorldFlags: { lore_goblin_tribes: true } },
  attack_on_guildhaven: { id: "attack_on_guildhaven", chapterId: "chapter_1", type: "quest", title: "Attack on Guildhaven", prerequisiteNodeIds: ["strange_tracks"], questId: "attack_on_guildhaven" },
  goblin_chieftain: { id: "goblin_chieftain", chapterId: "chapter_1", type: "boss", title: "Goblin Chieftain", prerequisiteNodeIds: ["attack_on_guildhaven"], questId: "goblin_chieftain_boss", choiceIds: ["spare_chieftain", "execute_chieftain", "imprison_chieftain"] },
  broken_wardstone: { id: "broken_wardstone", chapterId: "chapter_1", type: "dialogue", title: "The Broken Wardstone", prerequisiteNodeIds: ["goblin_chieftain"], unlockRegionIds: ["iron_hills", "shadowfen"], setWorldFlags: { greenveil_wardstone_damaged: true, lore_wardstones: true } },
};
