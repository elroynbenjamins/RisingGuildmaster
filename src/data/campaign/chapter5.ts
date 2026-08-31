import type { CampaignChapterDefinition, CampaignNodeDefinition } from "../../game/campaign/campaignTypes";

export const CHAPTER_5: CampaignChapterDefinition = {
  id: "chapter_5", chapterNumber: 5, name: "The Purple Hearth",
  description: "Carry the recovered covenant into the Ashlands, where Emberfall is divided between those who would wake the First Crown and those who have burned generations keeping it asleep.",
  recommendedLevelMin: 8, recommendedLevelMax: 9,
  nodeIds: ["east_with_the_covenant", "road_of_glass", "embers_council", "siege_of_emberfall", "keeper_of_cinders_boss", "the_burning_causeway", "judgment_at_the_hearth", "ash_herald_boss"],
  sideQuestIds: ["the_children_of_cinder", "a_song_for_the_last_phoenix"], completionGoldReward: 2400, completionReputationReward: 50,
};

export const CHAPTER_5_NODES: Record<string, CampaignNodeDefinition> = {
  east_with_the_covenant: { id:"east_with_the_covenant", chapterId:"chapter_5", type:"dialogue", title:"East with the Covenant", description:"Morrowveil's last warning and the restored covenant point toward Emberfall, where the eastern Wardstone burns beneath a purple sky.", storySceneId:"east_with_the_covenant", prerequisiteNodeIds:["drowned_archivist_boss"], setWorldFlags:{chapter_5_started:true,ashlands_covenant_mission:true,lore_ashlands:true} },
  road_of_glass: { id:"road_of_glass", chapterId:"chapter_5", type:"quest", title:"The Road of Glass", description:"Escort the covenant across a road that melts and reforms whenever the buried Crown breathes.", prerequisiteNodeIds:["east_with_the_covenant"], questId:"road_of_glass", setWorldFlags:{covenant_reached_emberfall:true} },
  embers_council: { id:"embers_council", chapterId:"chapter_5", type:"choice", title:"The Council of Embers", description:"Emberfall's three factions offer incompatible plans for the eastern Wardstone.", storySceneId:"embers_council", prerequisiteNodeIds:["road_of_glass"], choiceIds:["trust_cinderkeepers","arm_emberfall_militia","seek_the_crowns_voice"] },
  siege_of_emberfall: { id:"siege_of_emberfall", chapterId:"chapter_5", type:"quest", title:"Siege of Emberfall", description:"Hold three districts while ashbound constructs converge on the Hearth Gate.", prerequisiteNodeIds:["embers_council"], questId:"siege_of_emberfall", setWorldFlags:{emberfall_held:true} },
  keeper_of_cinders_boss: { id:"keeper_of_cinders_boss", chapterId:"chapter_5", type:"boss", title:"Keeper of Cinders", description:"Defeat the ancient guardian whose commands have been overwritten by the Ash Herald.", prerequisiteNodeIds:["siege_of_emberfall"], questId:"keeper_of_cinders_boss", setWorldFlags:{cinder_keeper_freed:true} },
  the_burning_causeway: { id:"the_burning_causeway", chapterId:"chapter_5", type:"quest", title:"The Burning Causeway", description:"Cross a collapsing obsidian road through three linked battlefields before the Herald seals the Purple Hearth.", prerequisiteNodeIds:["keeper_of_cinders_boss"], questId:"the_burning_causeway", setWorldFlags:{purple_hearth_reached:true} },
  judgment_at_the_hearth: { id:"judgment_at_the_hearth", chapterId:"chapter_5", type:"choice", title:"Judgment at the Hearth", description:"Choose what truth the guild will speak into the Wardstone before confronting the Herald.", storySceneId:"judgment_at_the_hearth", prerequisiteNodeIds:["the_burning_causeway"], choiceIds:["renew_the_fivefold_oath","accuse_the_old_keepers","offer_a_new_covenant"] },
  ash_herald_boss: { id:"ash_herald_boss", chapterId:"chapter_5", type:"boss", title:"Solkar, the Ash Herald", description:"Stop Solkar from waking the First Crown through a forced verdict—and learn who first ordered the covenant broken.", prerequisiteNodeIds:["judgment_at_the_hearth"], questId:"solkar_ash_herald_boss", setWorldFlags:{chapter_5_complete:true,ashlands_wardstone_stabilized:true,solkar_defeated:true,first_crown_judgment_delayed:true} },
};
