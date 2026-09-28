import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import { BASE_CLASS_IDS } from "../src/game/monetization/contentUnlockService";
import { STARTER_JOURNEY } from "../src/game/onboarding/starterJourneyService";
import type { ClassId } from "../src/game/heroes/types";

const ALL_CLASSES: readonly ClassId[] = ["warrior","ranger","mage","cleric","paladin","berserker","monk","bard","spellbow","bulwark","summoner"];
const EARLY_LOCAL_QUESTS = ["coils_of_the_sunken_grove","teeth_below_guildhaven","white_maw_of_frostmarch","highcourt_silent_charter","night_of_thirteen_ladders","last_lift_of_flintwatch","bellkeeper_below"] as const;

function questIdsThroughChapter(chapterNumber:number): Set<string> {
  const ids=new Set<string>([STARTER_JOURNEY.roadQuestId,STARTER_JOURNEY.sideQuestId]);
  for(let chapter=1;chapter<=chapterNumber;chapter+=1){
    const def=CAMPAIGN_CHAPTERS[chapter]!;
    for(const nodeId of def.nodeIds){
      const questId=CAMPAIGN_NODES[nodeId]?.questId;
      if(questId) ids.add(questId);
    }
    for(const questId of def.sideQuestIds ?? []) ids.add(questId);
  }
  for(const questId of EARLY_LOCAL_QUESTS){
    const quest=QUESTS[questId];
    if(quest && quest.recommendedLevelMin <= CAMPAIGN_CHAPTERS[chapterNumber]!.recommendedLevelMax) ids.add(questId);
  }
  return ids;
}
function reachableItems(chapterNumber:number): Set<string> {
  const ids=new Set<string>();
  for(const questId of questIdsThroughChapter(chapterNumber)){
    const quest=QUESTS[questId];
    if(!quest) continue;
    for(const itemId of QUEST_LOOT_TABLES[quest.lootTableId]?.itemIds ?? []) ids.add(itemId);
    for(const recipeId of quest.recipeUnlockIdsOnVictory ?? []){
      const recipe=CRAFTING_RECIPES[recipeId];
      if(recipe) ids.add(recipe.outputEquipmentId);
    }
  }
  for(const recipe of Object.values(CRAFTING_RECIPES)){
    if(!recipe.unlockSource && recipe.artisanLevel <= 1) ids.add(recipe.outputEquipmentId);
  }
  return ids;
}
function bestLevel(classId:ClassId,slot:"weapon"|"armor",ids:Set<string>):number{
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

describe("early primary gear source diagnostics",()=>{
  it("reports conservative Chapter 2-3 primary gear access",()=>{
    for(const chapterNumber of [2,3] as const){
      const chapter=CAMPAIGN_CHAPTERS[chapterNumber]!;
      const ids=reachableItems(chapterNumber);
      const rows=ALL_CLASSES.map(classId=>{
        const weapon=bestLevel(classId,"weapon",ids);
        const armor=bestLevel(classId,"armor",ids);
        const cacheWeapon=wardstoneBest(classId,"weapon",chapter.recommendedLevelMax);
        const cacheArmor=wardstoneBest(classId,"armor",chapter.recommendedLevelMax);
        return {
          classId,
          baseClass:BASE_CLASS_IDS.includes(classId),
          target:chapter.recommendedLevelMax,
          smallGuildWeapon:weapon,
          weaponLag:chapter.recommendedLevelMax-weapon,
          smallGuildArmor:armor,
          armorLag:chapter.recommendedLevelMax-armor,
          wardstoneWeapon:cacheWeapon,
          wardstoneWeaponLag:chapter.recommendedLevelMax-cacheWeapon,
          wardstoneArmor:cacheArmor,
          wardstoneArmorLag:chapter.recommendedLevelMax-cacheArmor,
        };
      });
      console.log("EARLY_GEAR_CHAPTER",chapterNumber,chapter.name);
      console.table(rows);
      for (const row of rows.filter((entry) => entry.baseClass)) {
        if (row.weaponLag > 2 || row.armorLag > 2) {
          throw new Error(`${row.classId} Chapter ${chapterNumber} primary gear lag exceeds two levels: weapon ${row.weaponLag}, armor ${row.armorLag}`);
        }
      }
    }
  });
});
