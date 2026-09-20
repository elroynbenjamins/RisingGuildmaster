import { describe, expect, it } from "vitest";
import { CHAPTER_8, CHAPTER_8_NODES } from "../src/data/campaign/chapter8";
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
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";
import { SETTLEMENTS } from "../src/data/world/settlements";

const enemyIds=["crownless_mariner","nullwake_arbalist","oath_eater","blacktide_reaver","leviathan_thrall","admiral_nhal_veyr"];

describe("Chapter 8 · The Black Tide",()=>{
 it("continues the Crownless warning and defines a complete level 14–15 chapter",()=>{expect(CAMPAIGN_CHAPTERS[8]).toBe(CHAPTER_8);expect(getLatestCampaignChapter()).toBe(CHAPTER_9);expect(CHAPTER_8).toMatchObject({chapterNumber:8,recommendedLevelMin:14,recommendedLevelMax:15,sideQuestIds:["the_lighthouse_that_walked","letters_from_a_sunken_ship"]});expect(CHAPTER_8_NODES.six_bells_west!.prerequisiteNodeIds).toEqual(["the_concord_of_six"]);});
 it("progresses strictly, discovers Tidewatch and records the incomplete wider war",()=>{let world={...createWorldState(),campaignChapter:8,completedCampaignNodeIds:["the_concord_of_six"]};for(const id of CHAPTER_8.nodeIds)world=completeCampaignNode(world,id).worldState;expect(world.campaignChapter).toBe(9);expect(world.discoveredSettlementIds).toContain("tidewatch");expect(world.worldFlags).toMatchObject({chapter_8_complete:true,tidewatch_saved:true,black_tide_vanguard_broken:true,crownless_sea_route_found:true});});
 it("ships five campaign missions, two side stories and a three-stage mini-raid",()=>{const quests=Object.values(QUESTS).filter(q=>q.campaignChapter===8);expect(quests).toHaveLength(7);expect(QUESTS.admiral_nhal_veyr_boss!.encounterIds).toHaveLength(3);for(const quest of quests){expect(quest.storyContext,quest.id).toBeTruthy();expect(QUEST_OUTCOME_CONSEQUENCES[quest.id],quest.id).toBeTruthy();for(const stageId of quest.explorationStageIds??[])expect(QUEST_EXPLORATION_STAGES[stageId],stageId).toBeTruthy();}});
 it("wires every encounter to a unique authored tactical battlefield",()=>{for(const quest of Object.values(QUESTS).filter(q=>q.campaignChapter===8))for(const encounterId of quest.encounterIds){const encounter=QUEST_ENCOUNTERS[encounterId];expect(encounter,encounterId).toBeTruthy();expect(BATTLEFIELDS[encounter!.battlefieldId],encounter!.battlefieldId).toBeTruthy();}});
 it("gives every Crownless enemy AI, skills and standalone art",()=>{expect(new Set(enemyIds.map((id)=>ENEMY_PORTRAITS[id])).size).toBe(6);for(const id of enemyIds){const enemy=ENEMIES[id];expect(enemy,id).toBeTruthy();expect(ENEMY_BEHAVIORS[enemy!.behaviorId]).toBeTruthy();expect(ENEMY_PORTRAITS[id],id).toBeDefined();for(const skillId of enemy!.skillIds){expect(ENEMY_SKILLS[skillId],skillId).toBeTruthy();expect(GENERATED_SKILL_ICON_ART[skillId],skillId).toBeDefined();}}});
 it("adds Tidewatch, full story presentation and chapter-specific recipes",()=>{expect(SETTLEMENTS.tidewatch).toMatchObject({regionId:"greenveil"});for(const id of ["six_bells_west","terms_at_low_tide","the_seventh_bell"])expect(STORY_SCENES[id]).toBeTruthy();for(const id of ["harbor_without_horizon","siege_of_tidewatch","nhal_veyr_boss"])expect(STORY_INTERLUDES_BY_NODE_ID[id]).toBeTruthy();for(const [recipeId,itemId] of [["jewel_beaconheart_ring","beaconheart-ring"],["tailor_deadletter_coat","deadletter-coat"],["forge_sixth_tide_blade","sixth-tide-blade"]] as const){expect(CRAFTING_RECIPES[recipeId]?.outputEquipmentId).toBe(itemId);expect(EQUIPMENT[itemId]).toBeTruthy();}});
});
