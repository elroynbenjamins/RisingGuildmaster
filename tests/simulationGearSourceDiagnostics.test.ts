import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import { createSimulationParty } from "../src/game/simulation/balanceSimulation";
import type { ClassId, EquipmentSlot } from "../src/game/heroes/types";

const PARTY = ["warrior","ranger","cleric","mage"] as const;
const SLOTS: readonly EquipmentSlot[] = ["weapon","armor","helmet","boots","accessory1","accessory2"];

function questIdsThrough(chapterNumber:number): Set<string> {
  const ids=new Set<string>();
  const target=CAMPAIGN_CHAPTERS[chapterNumber]!.recommendedLevelMax ?? CAMPAIGN_CHAPTERS[chapterNumber]!.recommendedLevelMin ?? 1;
  for(let chapter=1;chapter<=chapterNumber;chapter+=1){
    const def=CAMPAIGN_CHAPTERS[chapter]!;
    for(const nodeId of def.nodeIds){
      const questId=CAMPAIGN_NODES[nodeId]?.questId;
      if(questId) ids.add(questId);
    }
    for(const questId of def.sideQuestIds ?? []) ids.add(questId);
  }
  for(const quest of Object.values(QUESTS)){
    if(quest.questType!=="side") continue;
    if((quest.recommendedLevelMin ?? 999)>target) continue;
    ids.add(quest.id);
  }
  return ids;
}

function sourcedItemsThrough(chapterNumber:number): Set<string> {
  const ids=new Set<string>();
  for(const questId of questIdsThrough(chapterNumber)){
    const quest=QUESTS[questId];
    if(!quest) continue;
    for(const itemId of QUEST_LOOT_TABLES[quest.lootTableId]?.itemIds ?? []) ids.add(itemId);
    for(const recipeId of quest.recipeUnlockIdsOnVictory ?? []){
      const recipe=CRAFTING_RECIPES[recipeId];
      if(recipe) ids.add(recipe.outputEquipmentId);
    }
  }
  for(const recipe of Object.values(CRAFTING_RECIPES)){
    if(!recipe.unlockSource && recipe.artisanLevel <= 3) ids.add(recipe.outputEquipmentId);
  }
  return ids;
}

function wardstoneEligible(itemId:string, heroLevel:number, classId:ClassId):boolean{
  const item=EQUIPMENT[itemId];
  if(!item) return false;
  if(item.classRestrictions.length && !item.classRestrictions.includes(classId)) return false;
  const min=Math.max(1,heroLevel-2);
  const max=Math.max(min,heroLevel-1);
  return item.levelRequirement>=min && item.levelRequirement<=max;
}

describe("simulation gear source diagnostics",()=>{
  it("checks optional progression loadouts against chapter-available sources",()=>{
    const scenarios=[
      {chapter:4,level:7,seed:8700},
      {chapter:5,level:8,seed:8800},
      {chapter:6,level:10,seed:8810},
      {chapter:7,level:13,seed:8910},
      {chapter:8,level:15,seed:8930},
      {chapter:9,level:17,seed:8950},
    ] as const;

    for(const scenario of scenarios){
      const sourceIds=sourcedItemsThrough(scenario.chapter);
      const heroes=createSimulationParty(PARTY,scenario.level,scenario.seed,"optional_progression","subclass_ready");
      const rows=[] as Array<Record<string,unknown>>;
      for(const hero of heroes){
        for(const slot of SLOTS){
          const itemId=hero.equipment[slot];
          if(!itemId) continue;
          const item=EQUIPMENT[itemId]!;
          const storyOrRecipe=sourceIds.has(itemId);
          const wardstone=wardstoneEligible(itemId,scenario.level,hero.classId);
          rows.push({
            classId:hero.classId,slot,itemId,itemLevel:item.levelRequirement,
            storyOrRecipe,wardstone,reachable:storyOrRecipe||wardstone,
          });
        }
      }
      console.log("SIM_GEAR_SOURCE",scenario.chapter,scenario.level);
      console.table(rows);
    }
  });
});
