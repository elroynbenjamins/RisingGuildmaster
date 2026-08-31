import type { CampaignChapterDefinition, CampaignNodeDefinition } from "../../game/campaign/campaignTypes";

export const CHAPTER_9: CampaignChapterDefinition = {
  id: "chapter_9", chapterNumber: 9, name: "The Drowned Seventh",
  description: "Follow the seventh bell beneath the western sea, cross the drowned city of Veyr and stop a Crownless navigator from waking the chained voice below it.",
  recommendedLevelMin: 16, recommendedLevelMax: 17,
  nodeIds: ["map_that_bled_salt", "descent_below_bells", "streets_drown_twice", "name_of_the_seventh", "citadel_unwritten_law", "chain_beneath_fleet", "serekh_boss", "name_returned_to_sea"],
  sideQuestIds: ["choir_in_the_diving_bell", "tavern_at_the_bottom_of_the_sea"], completionGoldReward: 5600, completionReputationReward: 110,
};

export const CHAPTER_9_NODES: Record<string, CampaignNodeDefinition> = {
  map_that_bled_salt:{id:"map_that_bled_salt",chapterId:"chapter_9",type:"dialogue",title:"The Map That Bled Salt",description:"Nhal Veyr's living chart bleeds a route to Veyr, the drowned city erased from the first covenant.",storySceneId:"map_that_bled_salt",prerequisiteNodeIds:["the_seventh_bell"],setWorldFlags:{chapter_9_started:true,route_to_drowned_veyr_known:true,lore_drowned_seventh:true}},
  descent_below_bells:{id:"descent_below_bells",chapterId:"chapter_9",type:"quest",title:"Descent Below the Bells",description:"Open the tidal gate and descend before the western sea closes above the expedition.",prerequisiteNodeIds:["map_that_bled_salt"],questId:"descent_below_bells",setWorldFlags:{drowned_city_entered:true}},
  streets_drown_twice:{id:"streets_drown_twice",chapterId:"chapter_9",type:"quest",title:"Streets That Drown Twice",description:"Cross Veyr's memory-flooded streets and recover the civic seal before the city forgets the route home.",prerequisiteNodeIds:["descent_below_bells"],questId:"streets_drown_twice",setWorldFlags:{seventh_civic_seal_recovered:true}},
  name_of_the_seventh:{id:"name_of_the_seventh",chapterId:"chapter_9",type:"choice",title:"The Name of the Seventh",description:"The seal remembers the signatory that Eldoria deliberately erased. Decide how the expedition carries that truth.",storySceneId:"name_of_the_seventh",prerequisiteNodeIds:["streets_drown_twice"],choiceIds:["restore_seventh_name","share_seventh_testimony","keep_seventh_sealed"],setWorldFlags:{seventh_name_choice_made:true}},
  citadel_unwritten_law:{id:"citadel_unwritten_law",chapterId:"chapter_9",type:"quest",title:"Citadel of Unwritten Law",description:"Breach the drowned court where living decrees turn intruders into enemies of their own memories.",prerequisiteNodeIds:["name_of_the_seventh"],questId:"citadel_unwritten_law",setWorldFlags:{unwritten_citadel_breached:true}},
  chain_beneath_fleet:{id:"chain_beneath_fleet",chapterId:"chapter_9",type:"quest",title:"The Chain Beneath the Fleet",description:"Sever the resonant chains feeding the Crownless fleet without freeing the ancient voice bound below Veyr.",prerequisiteNodeIds:["citadel_unwritten_law"],questId:"chain_beneath_fleet",setWorldFlags:{fleet_resonance_chain_broken:true}},
  serekh_boss:{id:"serekh_boss",chapterId:"chapter_9",type:"boss",title:"Serekh, Chartmaker of the Lost",description:"Defeat the Navigator across the chart hall, the collapsing tidal engine and the platform above the chained abyss.",prerequisiteNodeIds:["chain_beneath_fleet"],questId:"serekh_chartmaker_boss",setWorldFlags:{serekh_defeated:true,drowned_veyr_freed:true}},
  name_returned_to_sea:{id:"name_returned_to_sea",chapterId:"chapter_9",type:"dialogue",title:"A Name Returned to the Sea",description:"Veyr speaks its name again. Far below, the chained being called Thalassyr opens one eye—and recognizes the guild banner.",storySceneId:"name_returned_to_sea",prerequisiteNodeIds:["serekh_boss"],setWorldFlags:{chapter_9_complete:true,seventh_signatory_restored:true,thalassyr_awake:true,lore_thalassyr:true}},
};
