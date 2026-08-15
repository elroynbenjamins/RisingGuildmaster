import type { QuestDefinition } from "../../game/quests/questTypes";

export const FROSTMARCH_CRISIS_QUESTS: Record<string, QuestDefinition> = {
  the_aurora_that_fell: {
    id: "the_aurora_that_fell",
    name: "The Aurora That Fell",
    description: "A false Wardstone pulse has dragged Frostmarch's aurora down onto the southern road. Reach Northwatch through living light, restore its three signal pylons, and silence the Iron Ward guardians repeating an ancient summons.",
    questType: "side",
    regionId: "frostmarch",
    repeatable: false,
    difficulty: 8,
    recommendedLevelMin: 7,
    recommendedLevelMax: 9,
    minPartySize: 4,
    maxPartySize: 4,
    explorationStageIds: ["fallen_aurora_read_resonance", "fallen_aurora_hold_hearthline", "fallen_aurora_cross_glasswind"],
    encounterIds: ["fallen_aurora_road", "northwatch_signal_crown"],
    goldRewardMin: 720,
    goldRewardMax: 900,
    xpRewardPerHero: 470,
    lootTableId: "fallen_aurora_loot",
    storyArcId: "fivefold_accord",
    campaignChapter: 2,
    prerequisiteCampaignNodeIds: ["voices_under_stone"],
    requiredWorldFlags: ["frostmarch_aurora_crisis"],
    setWorldFlagsOnVictory: {
      frostmarch_aurora_stabilized: true,
      northern_crown_answered: true,
      lore_fallen_aurora: true,
      lore_frostmarch: true,
    },
  },
};
