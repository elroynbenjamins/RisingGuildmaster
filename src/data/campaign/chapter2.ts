import type { CampaignChapterDefinition, CampaignNodeDefinition } from "../../game/campaign/campaignTypes";

export const CHAPTER_2: CampaignChapterDefinition = {
  id: "chapter_2",
  chapterNumber: 2,
  name: "The Hollow Forge",
  description: "Follow the stolen Wardstone splinters into the Iron Hills, where raiders, a celebrated rival guild, and something ancient beneath the mountains are pulling on the same chain.",
  recommendedLevelMin: 5,
  recommendedLevelMax: 9,
  nodeIds: ["council_of_splinters", "road_of_broken_carts", "voices_under_stone", "siege_of_flintwatch", "chainbreaker_boss", "laurel_below", "descent_to_hollow_forge", "hollow_warden_boss"],
  sideQuestIds: ["blackbridge_ledger", "oath_of_the_broken_bridge"],
  completionGoldReward: 900,
  completionReputationReward: 20,
};

export const CHAPTER_2_NODES: Record<string, CampaignNodeDefinition> = {
  council_of_splinters: { id: "council_of_splinters", chapterId: "chapter_2", type: "dialogue", title: "Council of Splinters", description: "Representatives from Stonegate identify the Chieftain's fragment as heartstone stolen from an Iron Hills Wardstone. The Iron Laurel already holds the official investigation charter—but its reports claim nothing is wrong.", storySceneId: "council_of_splinters", prerequisiteNodeIds: ["broken_wardstone"], setWorldFlags: { chapter_2_started: true, lore_iron_hills: true } },
  road_of_broken_carts: { id: "road_of_broken_carts", chapterId: "chapter_2", type: "quest", title: "The Road of Broken Carts", description: "Escort a dwarven surveyor through an abandoned pass and recover the manifests carried by three missing ore convoys.", prerequisiteNodeIds: ["council_of_splinters"], questId: "road_of_broken_carts" },
  voices_under_stone: { id: "voices_under_stone", chapterId: "chapter_2", type: "choice", title: "Voices Under Stone", description: "The recovered manifests bear an Iron Laurel seal. Decide whether to share the evidence, conceal it, or confront their expedition directly.", storySceneId: "voices_under_stone", prerequisiteNodeIds: ["road_of_broken_carts"], choiceIds: ["share_stonegate_evidence", "conceal_wardstone_evidence", "challenge_iron_laurel_claim"] },
  siege_of_flintwatch: { id: "siege_of_flintwatch", chapterId: "chapter_2", type: "quest", title: "The Fires of Flintwatch", description: "Ward-powered constructs emerge from a sealed gallery while orc laborers attack the chains holding their families. Keep Flintwatch standing long enough to learn who opened the deep road.", prerequisiteNodeIds: ["voices_under_stone"], questId: "fires_of_flintwatch" },
  chainbreaker_boss: { id: "chainbreaker_boss", chapterId: "chapter_2", type: "boss", title: "Ghorak the Chainbreaker", description: "The commander of the uprising challenges your guild at the shattered ore lift. Defeat him, then decide whether he is an enemy, a prisoner, or a witness.", prerequisiteNodeIds: ["siege_of_flintwatch"], questId: "ghorak_chainbreaker_boss", choiceIds: ["free_ghoraks_clan", "bind_ghorak_to_trial", "banish_ghorak"] },
  laurel_below: { id: "laurel_below", chapterId: "chapter_2", type: "dialogue", title: "The Laurel Below", description: "Ghorak's testimony and the recovered ledgers agree: an Iron Laurel expedition forced both goblins and orcs to mine heartstone, then fled when the forge awakened.", storySceneId: "laurel_below", prerequisiteNodeIds: ["chainbreaker_boss"], setWorldFlags: { iron_laurel_wardstone_operation_exposed: true } },
  descent_to_hollow_forge: { id: "descent_to_hollow_forge", chapterId: "chapter_2", type: "quest", title: "Descent to the Hollow Forge", description: "Fight through the abandoned deep road, silence the awakened sentries, and reach the ancient forge before its unstable heartstone fractures the Iron Hills Wardstone.", prerequisiteNodeIds: ["laurel_below"], questId: "descent_to_hollow_forge" },
  hollow_warden_boss: { id: "hollow_warden_boss", chapterId: "chapter_2", type: "boss", title: "The Hollow Warden", description: "An ancient guardian has mistaken every living faction for thieves. Break its ward-shell and decide the fate of the recovered heartstone.", prerequisiteNodeIds: ["descent_to_hollow_forge"], questId: "hollow_warden_boss", choiceIds: ["restore_iron_wardstone", "entrust_stonegate_keepers", "retain_heartstone_fragment"], unlockRegionIds: ["frostmarch"], setWorldFlags: { iron_hills_wardstone_stabilized: true, chapter_2_complete: true, lore_frostmarch: true } },
};
