import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import type { ClassId } from "../src/game/heroes/types";

const CLASSES: readonly ClassId[] = ["warrior","ranger","mage","cleric","paladin","berserker","monk","bard","spellbow","bulwark","summoner"];

function campaignQuestIdsThrough(chapterNumber:number): Set<string> {
  const ids=new Set<string>();
  for(let chapter=1;chapter<=chapterNumber;chapter+=1){
    const def=CAMPAIGN_CHAPTERS[chapter]!;
    for(const nodeId of def.nodeIds){
      const questId=CAMPAIGN_NODES[nodeId]?.questId;
      if(questId) ids.add(questId);
    }
    for(const questId of def.sideQuestIds ?? []) ids.add(questId);
  }
  return ids;
}

function sourcedItemsThrough(chapterNumber:number): Set<string> {
  const ids=new Set<string>();
  for(const questId of campaignQuestIdsThrough(chapterNumber)){
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

function bestLevel(classId:ClassId, slot:"weapon"|"armor", ids:Set<string>):number{
  return Math.max(0,...[...ids].map(id=>EQUIPMENT[id]).filter((item):item is NonNullable<typeof item>=>Boolean(item))
    .filter(item=>item.slot===slot)
    .filter(item=>!item.classRestrictions.length || item.classRestrictions.includes(classId))
    .map(item=>item.levelRequirement));
}

function wardstoneBest(classId:ClassId,slot:"weapon"|"armor",partyLevel:number):number{
  const min=Math.max(1,partyLevel-2), max=Math.max(min,partyLevel-1);
  return Math.max(0,...Object.values(EQUIPMENT)
    .filter(item=>item.slot===slot && item.levelRequirement>=min && item.levelRequirement<=max)
    .filter(item=>!item.classRestrictions.length || item.classRestrictions.includes(classId))
    .map(item=>item.levelRequirement));
}

describe("late primary gear source diagnostics",()=>{
  it("reports Chapter 6-9 source realism",()=>{
    for(const chapterNumber of [6,7,8,9] as const){
      const chapter=CAMPAIGN_CHAPTERS[chapterNumber]!;
      const target=chapter.recommendedLevelMax ?? chapter.recommendedLevelMin ?? 1;
      const ids=sourcedItemsThrough(chapterNumber);
      const rows=CLASSES.map(classId=>{
        const weapon=bestLevel(classId,"weapon",ids);
        const armor=bestLevel(classId,"armor",ids);
        const cacheWeapon=wardstoneBest(classId,"weapon",target);
        const cacheArmor=wardstoneBest(classId,"armor",target);
        return {
          classId,target,
          sourcedWeapon:weapon,weaponLag:target-weapon,
          sourcedArmor:armor,armorLag:target-armor,
          wardstoneWeapon:cacheWeapon,wardstoneWeaponLag:target-cacheWeapon,
          wardstoneArmor:cacheArmor,wardstoneArmorLag:target-cacheArmor,
        };
      });
      console.log("LATE_GEAR_CHAPTER",chapterNumber,chapter.name);
      console.table(rows);
    }
  });
});
