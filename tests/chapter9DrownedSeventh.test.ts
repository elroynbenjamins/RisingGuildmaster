import { describe,expect,it } from "vitest";
import { CHAPTER_9,CHAPTER_9_NODES } from "../src/data/campaign/chapter9";
import { CAMPAIGN_CHAPTERS } from "../src/data/campaign/chapter1";
import { CHAPTER_9_DROWNED_SEVENTH_QUESTS } from "../src/data/quests/chapter9DrownedSeventhQuests";
import { CHAPTER_9_DROWNED_SEVENTH_ENEMIES } from "../src/data/enemies/chapter9DrownedSeventh";
import { CHAPTER_9_ENEMY_SKILLS } from "../src/data/skills/chapter9EnemySkills";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";

describe("Chapter 9 · The Drowned Seventh",()=>{
 it("follows the seventh bell with a complete ordered chapter",()=>{expect(CAMPAIGN_CHAPTERS[9]).toBe(CHAPTER_9);expect(CHAPTER_9.nodeIds).toHaveLength(8);expect(CHAPTER_9.sideQuestIds).toHaveLength(2);expect(CHAPTER_9_NODES.map_that_bled_salt!.prerequisiteNodeIds).toEqual(["the_seventh_bell"]);});
 it("keeps every quest reference complete",()=>{for(const quest of Object.values(CHAPTER_9_DROWNED_SEVENTH_QUESTS)){for(const id of quest.encounterIds)expect(QUEST_ENCOUNTERS[id],id).toBeDefined();for(const id of quest.explorationStageIds??[])expect(QUEST_EXPLORATION_STAGES[id],id).toBeDefined();}});
 it("uses authored multi-stage tactical maps",()=>{const ids=Object.values(CHAPTER_9_DROWNED_SEVENTH_QUESTS).flatMap(q=>q.encounterIds);expect(ids.length).toBeGreaterThanOrEqual(15);for(const id of ids)expect(BATTLEFIELDS[QUEST_ENCOUNTERS[id]!.battlefieldId]).toBeDefined();});
 it("defines six enemies with valid skills",()=>{expect(Object.keys(CHAPTER_9_DROWNED_SEVENTH_ENEMIES)).toHaveLength(6);for(const enemy of Object.values(CHAPTER_9_DROWNED_SEVENTH_ENEMIES))for(const id of enemy.skillIds)expect(CHAPTER_9_ENEMY_SKILLS[id],id).toBeDefined();});
 it("gives Serekh two phase thresholds and an aura",()=>{expect(CHAPTER_9_ENEMY_SKILLS.below_the_chart?.conditionalModifiers).toHaveLength(2);expect(CHAPTER_9_ENEMY_SKILLS.law_of_the_drowned?.type).toBe("aura");});
});
