import type { QuestDefinition } from "../../game/quests/questTypes";

/** A Chapter 1 side story that foreshadows Eldoria's draconic past without revealing a living dragon. */
export const ASH_BENEATH_GREENVEIL_QUESTS: Record<string, QuestDefinition> = {
  smoke_without_fire: {
    id: "smoke_without_fire", name: "Smoke Without Fire", questType: "side", regionId: "greenveil", repeatable: false,
    description: "Forester Nella Rook has found trees burned from the inside and claw marks too broad for any Greenveil beast. Read the damaged grove before rain and scavengers erase the trail.",
    difficulty: 3, recommendedLevelMin: 2, recommendedLevelMax: 4, minPartySize: 3, maxPartySize: 4,
    explorationStageIds: ["ash_read_burn", "ash_measure_tracks", "ash_follow_vermin"], encounterIds: ["ashscale_grove_encounter"],
    goldRewardMin: 240, goldRewardMax: 330, xpRewardPerHero: 170, lootTableId: "smoke_without_fire_loot",
    recipeUnlockIdsOnVictory: ["forge_cinder_edge_axe"], storyArcId: "ash_beneath_greenveil", campaignChapter: 1, prerequisiteCampaignNodeIds: ["missing_merchant"],
    setWorldFlagsOnVictory: { scorched_grove_investigated: true, ancient_scale_recovered: true, lore_draconic_wardmakers: true },
  },
  the_scale_collector: {
    id: "the_scale_collector", name: "The Scale Collector", questType: "side", regionId: "greenveil", repeatable: false,
    description: "The warm scale recovered in the grove bears a merchant's assay mark. Trace the buyers, infiltrate their woodland camp, and learn who is paying for relics touched by dragonfire.",
    difficulty: 4, recommendedLevelMin: 3, recommendedLevelMax: 5, minPartySize: 3, maxPartySize: 4,
    explorationStageIds: ["collector_read_assay", "collector_enter_camp", "collector_break_story"], encounterIds: ["scale_collector_camp_encounter"],
    goldRewardMin: 340, goldRewardMax: 450, xpRewardPerHero: 230, lootTableId: "scale_collector_loot",
    storyArcId: "ash_beneath_greenveil", campaignChapter: 1, prerequisiteQuestIds: ["smoke_without_fire"], requiredWorldFlags: ["ancient_scale_recovered"],
    setWorldFlagsOnVictory: { scale_collector_defeated: true, scale_buyer_points_east: true },
  },
  the_hollow_below: {
    id: "the_hollow_below", name: "The Hollow Below", questType: "side", regionId: "greenveil", repeatable: false,
    description: "The collector's notes reveal a sealed chamber beneath an abandoned Wardstone observatory. Descend through its scorched roots and discover why something below still dreams of fire.",
    difficulty: 5, recommendedLevelMin: 4, recommendedLevelMax: 6, minPartySize: 3, maxPartySize: 4,
    explorationStageIds: ["hollow_open_observatory", "hollow_translate_warning", "hollow_quiet_embers"], encounterIds: ["hollow_scale_vault_guard", "wardstone_scale_guardian_encounter"],
    goldRewardMin: 480, goldRewardMax: 640, xpRewardPerHero: 320, lootTableId: "hollow_scale_vault_loot",
    storyArcId: "ash_beneath_greenveil", campaignChapter: 1, prerequisiteQuestIds: ["the_scale_collector"], requiredWorldFlags: ["scale_buyer_points_east"],
    setWorldFlagsOnVictory: { hollow_scale_vault_opened: true, ancient_dragon_stirring: true, first_crown_beast_omen: true },
  },
};
