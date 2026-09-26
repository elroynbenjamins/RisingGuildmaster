import { describe, expect, it } from "vitest";
import { CHAPTER_7, CHAPTER_7_NODES } from "../src/data/campaign/chapter7";
import { CHAPTER_8 } from "../src/data/campaign/chapter8";
import { CHAPTER_9 } from "../src/data/campaign/chapter9";
import { CAMPAIGN_CHAPTERS } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { ENEMY_BEHAVIORS } from "../src/data/enemyBehaviors/enemyBehaviors";
import { ENEMY_PORTRAITS } from "../src/data/enemies/enemyPortraits";
import { GENERATED_SKILL_ICON_ART } from "../src/data/skills/generatedSkillIconArt";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { completeCampaignNode, getLatestCampaignChapter } from "../src/game/campaign/campaignService";
import { createWorldState } from "../src/game/world/worldState";
import { STORY_INTERLUDES_BY_NODE_ID, STORY_SCENES } from "../src/data/story/guildOrigin";
import { QUEST_OUTCOME_CONSEQUENCES } from "../src/data/quests/questOutcomeConsequences";
import { SETTLEMENTS } from "../src/data/world/settlements";
import { REGION_LOCATIONS } from "../src/data/world/regionLocations";

const enemyIds=["brass_honor_guard","crownmarked_saboteur","stormcrow_mimic","brasswing_drake","crown_beacon","varkesh_gilded_rupture"];

describe("Chapter 7 · The Brass Embassy",()=>{
 it("is the complete level 12–13 successor to Chapter 6",()=>{expect(CAMPAIGN_CHAPTERS[7]).toBe(CHAPTER_7);expect(CHAPTER_7).toMatchObject({chapterNumber:7,recommendedLevelMin:12,recommendedLevelMax:13,sideQuestIds:["the_bell_that_hatched","feathers_over_the_abyss"]});expect(CHAPTER_7_NODES.the_answer_in_brass!.prerequisiteNodeIds).toEqual(["a_banner_freely_raised"]);});
 it("progresses in strict order, discovers Skyvault and advances to chapter 8",()=>{let world={...createWorldState(),campaignChapter:7,completedCampaignNodeIds:["a_banner_freely_raised"]};for(const id of CHAPTER_7.nodeIds){world=completeCampaignNode(world,id).worldState;}expect(world.campaignChapter).toBe(8);expect(world.discoveredSettlementIds).toContain("skyvault");expect(world.worldFlags).toMatchObject({chapter_7_complete:true,dragon_council_contacted:true,eldoria_recognized_as_sixth_signatory:true});expect(getLatestCampaignChapter()).toBe(CHAPTER_9);});
 it("ships seven fully contextualized quests and a three-stage mini-raid",()=>{const chapterQuests=Object.values(QUESTS).filter(q=>q.campaignChapter===7);expect(chapterQuests).toHaveLength(7);expect(QUESTS.varkesh_gilded_rupture_boss!.encounterIds).toHaveLength(3);expect(QUESTS.varkesh_gilded_rupture_boss).toMatchObject({minPartySize:4,maxPartySize:4,recommendedLevelMin:13,betweenEncounterHpRecoveryRatio:.08});expect(QUESTS.siege_of_skyvault!.betweenEncounterHpRecoveryRatio).toBe(.05);expect(QUEST_ENCOUNTERS.varkesh_beacon_ring!.enemies.reduce((sum,group)=>sum+group.count,0)).toBe(5);for(const quest of chapterQuests){expect(quest.storyContext,quest.id).toBeTruthy();expect(QUEST_OUTCOME_CONSEQUENCES[quest.id],quest.id).toBeTruthy();}});
 it("gives its major story beats scenes, interludes and a mapped embassy",()=>{for(const id of ["the_answer_in_brass","the_scale_and_the_signature","the_concord_of_six"])expect(STORY_SCENES[id]).toBeTruthy();for(const id of ["road_above_the_clouds","siege_of_skyvault","varkesh_boss"])expect(STORY_INTERLUDES_BY_NODE_ID[id]).toBeTruthy();expect(SETTLEMENTS.skyvault).toMatchObject({regionId:"iron_hills"});expect(REGION_LOCATIONS.skyvault).toMatchObject({settlementId:"skyvault",recommendedLevel:12});});
 it("wires every encounter, battlefield and spawn inside its board",()=>{for(const quest of Object.values(QUESTS).filter(q=>q.campaignChapter===7))for(const encounterId of quest.encounterIds){const encounter=QUEST_ENCOUNTERS[encounterId];expect(encounter,encounterId).toBeTruthy();const map=BATTLEFIELDS[encounter!.battlefieldId];expect(map,encounter!.battlefieldId).toBeTruthy();const size=map!.boardSizeId==="warfront"?{width:15,height:11}:map!.boardSizeId==="grand_battlefield"?{width:11,height:9}:{width:9,height:7};for(const pos of [...encounter!.heroSpawnPositions,...encounter!.enemies.flatMap(g=>g.spawnPositions)])expect(pos.x>=0&&pos.y>=0&&pos.x<size.width&&pos.y<size.height,`${encounterId}:${pos.x},${pos.y}`).toBe(true);}});
 it("gives every new enemy working AI, skills and unique portrait art",()=>{expect(new Set(enemyIds.map((id)=>ENEMY_PORTRAITS[id])).size).toBe(enemyIds.length);for(const id of enemyIds){const enemy=ENEMIES[id];expect(enemy,id).toBeTruthy();expect(ENEMY_BEHAVIORS[enemy!.behaviorId],enemy!.behaviorId).toBeTruthy();expect(ENEMY_PORTRAITS[id],id).toBeDefined();for(const skillId of enemy!.skillIds){expect(ENEMY_SKILLS[skillId],skillId).toBeTruthy();expect(GENERATED_SKILL_ICON_ART[skillId],skillId).toBeDefined();}}});
 it("includes one recipe reward for each side quest and the chapter boss",()=>{for(const [recipeId,itemId] of [["jewel_firstsong_ring","firstsong-ring"],["tailor_galewing_mantle","galewing-mantle"],["forge_concordance_glaive","concordance-glaive"]] as const){expect(CRAFTING_RECIPES[recipeId]?.outputEquipmentId).toBe(itemId);expect(EQUIPMENT[itemId]).toBeTruthy();}});
});
