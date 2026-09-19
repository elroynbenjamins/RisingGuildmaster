import type { AchievementDefinition } from "../../game/achievements/achievementTypes";

const a = (definition: AchievementDefinition) => definition;

export const ACHIEVEMENTS: AchievementDefinition[] = [
  a({ id:"first_banner", category:"Guild", title:"A Banner Raised", description:"Recruit at least 2 heroes.", metric:"hero_count", target:2, rewardGems:1, iconId:"guild" }),
  a({ id:"full_party", category:"Guild", title:"A Proper Party", description:"Build a roster of at least 4 heroes.", metric:"hero_count", target:4, rewardGems:1, iconId:"heroes" }),
  a({ id:"company_strength", category:"Guild", title:"Company Strength", description:"Build a roster of at least 6 heroes.", metric:"hero_count", target:6, rewardGems:2, iconId:"heroes" }),
  a({ id:"local_name", category:"Guild", title:"A Name People Know", description:"Reach 50 guild reputation.", metric:"reputation", target:50, rewardGems:2, iconId:"victory" }),
  a({ id:"regional_name", category:"Guild", title:"Known Across the Roads", description:"Reach 150 guild reputation.", metric:"reputation", target:150, rewardGems:3, iconId:"victory" }),

  a({ id:"hero_level_5", category:"Heroes", title:"Seasoned Adventurer", description:"Raise any hero to Level 5.", metric:"max_hero_level", target:5, rewardGems:1, iconId:"xp" }),
  a({ id:"hero_level_10", category:"Heroes", title:"Veteran of Eldoria", description:"Raise any hero to Level 10.", metric:"max_hero_level", target:10, rewardGems:3, iconId:"xp" }),
  a({ id:"close_friends", category:"Heroes", title:"Forged in Battle", description:"Create one Close Friend bond between heroes.", metric:"close_friend_bonds", target:1, rewardGems:2, iconId:"heroes" }),

  a({ id:"five_quests", category:"Adventures", title:"Reliable Hands", description:"Complete 5 unique quests.", metric:"completed_quests", target:5, rewardGems:1, iconId:"quests" }),
  a({ id:"twenty_quests", category:"Adventures", title:"Guild Chronicle", description:"Complete 20 unique quests.", metric:"completed_quests", target:20, rewardGems:3, iconId:"journal" }),
  a({ id:"chapter_two", category:"Adventures", title:"Beyond Greenveil", description:"Reach Campaign Chapter 2.", metric:"campaign_chapter", target:2, rewardGems:2, iconId:"world" }),
  a({ id:"chapter_five", category:"Adventures", title:"Halfway Through the Wardroad", description:"Reach Campaign Chapter 5.", metric:"campaign_chapter", target:5, rewardGems:4, iconId:"world" }),
  a({ id:"first_roguelite", category:"Adventures", title:"Into the Wardstone", description:"Win 1 Roguelite Expedition.", metric:"roguelite_victories", target:1, rewardGems:2, iconId:"loot" }),
  a({ id:"five_roguelites", category:"Adventures", title:"Routebreaker", description:"Win 5 Roguelite Expeditions.", metric:"roguelite_victories", target:5, rewardGems:3, iconId:"loot" }),
  a({ id:"first_operation", category:"Adventures", title:"Command Two Fronts", description:"Complete 1 Crisis Operation.", metric:"operation_completions", target:1, rewardGems:2, iconId:"management" }),
  a({ id:"perfect_operation", category:"Adventures", title:"Six Orders, Six Successes", description:"Achieve 6/6 objectives in a Crisis Operation.", metric:"operation_best", target:6, rewardGems:4, iconId:"victory" }),
  a({ id:"first_raid", category:"Adventures", title:"Eight Stand Together", description:"Win 1 Guild Raid.", metric:"raid_victories", target:1, rewardGems:4, iconId:"boss" }),
  a({ id:"three_raids", category:"Adventures", title:"Raid Standard", description:"Win 3 Guild Raids.", metric:"raid_victories", target:3, rewardGems:5, iconId:"boss" }),
  a({ id:"crisis_breaker", category:"Adventures", title:"Crisis Breaker", description:"Resolve 1 Regional Threat quest.", metric:"resolved_crises", target:1, rewardGems:2, iconId:"world" }),

  a({ id:"lore_10", category:"Collection", title:"Field Archivist", description:"Discover 10 lore entries.", metric:"lore_entries", target:10, rewardGems:2, iconId:"journal" }),
  a({ id:"lore_25", category:"Collection", title:"Keeper of Stories", description:"Discover 25 lore entries.", metric:"lore_entries", target:25, rewardGems:4, iconId:"journal" }),
  a({ id:"three_trophies", category:"Collection", title:"A Hall Worth Visiting", description:"Earn 3 guild trophies.", metric:"trophies", target:3, rewardGems:3, iconId:"victory" }),

  a({ id:"craft_5", category:"Crafting", title:"Working Hands", description:"Craft 5 pieces of equipment.", metric:"crafted_items", target:5, rewardGems:1, iconId:"blacksmith" }),
  a({ id:"craft_25", category:"Crafting", title:"Guild Quartermaster", description:"Craft 25 pieces of equipment.", metric:"crafted_items", target:25, rewardGems:3, iconId:"blacksmith" }),
];
