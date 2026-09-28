import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import type { ClassId, EquipmentSlot } from "../src/game/heroes/types";

const CLASSES: readonly ClassId[] = ["warrior","ranger","mage","cleric","paladin","berserker","monk","bard","spellbow","bulwark","summoner"];

function chapterQuestIds(chapterNumber: number): string[] {
  const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
  const mainline = chapter.nodeIds
    .map((id) => CAMPAIGN_NODES[id]?.questId)
    .filter((id): id is string => Boolean(id));
  return [...new Set([...mainline, ...(chapter.sideQuestIds ?? [])])];
}

function reachableItems(chapterNumber: number) {
  const ids = new Set<string>();
  const source = new Map<string,string[]>();
  const add = (itemId: string, label: string) => {
    if (!EQUIPMENT[itemId]) return;
    ids.add(itemId);
    source.set(itemId,[...(source.get(itemId) ?? []),label]);
  };
  for (const questId of chapterQuestIds(chapterNumber)) {
    const quest=QUESTS[questId];
    if (!quest) continue;
    for (const itemId of QUEST_LOOT_TABLES[quest.lootTableId]?.itemIds ?? []) add(itemId,`loot:${questId}`);
    for (const recipeId of quest.recipeUnlockIdsOnVictory ?? []) {
      const itemId=CRAFTING_RECIPES[recipeId]?.outputEquipmentId;
      if (itemId) add(itemId,`recipe:${questId}`);
    }
  }
  return {ids:[...ids],source};
}

function bestFor(classId: ClassId, slot: EquipmentSlot, itemIds: readonly string[]) {
  return itemIds
    .map((id)=>EQUIPMENT[id]!)
    .filter((item)=>item.slot===slot)
    .filter((item)=>!item.classRestrictions.length || item.classRestrictions.includes(classId))
    .sort((a,b)=>b.levelRequirement-a.levelRequirement || b.value-a.value)[0] ?? null;
}

describe("campaign gear source diagnostics",()=>{
  it("reports reachable primary gear by chapter and class",()=>{
    const cumulativeIds=new Set<string>();
    const cumulativeSources=new Map<string,string[]>();
    for(let chapterNumber=1;chapterNumber<=9;chapterNumber+=1){
      const chapter=CAMPAIGN_CHAPTERS[chapterNumber]!;
      const current=reachableItems(chapterNumber);
      current.ids.forEach((id)=>{
        cumulativeIds.add(id);
        cumulativeSources.set(id,[...(cumulativeSources.get(id) ?? []),...(current.source.get(id) ?? [])]);
      });
      const rows=CLASSES.map((classId)=>{
        const weapon=bestFor(classId,"weapon",[...cumulativeIds]);
        const armor=bestFor(classId,"armor",[...cumulativeIds]);
        return {
          classId,
          target:chapter.recommendedLevelMax,
          weapon:weapon?.id ?? "NONE",
          weaponLevel:weapon?.levelRequirement ?? 0,
          weaponLag:chapter.recommendedLevelMax-(weapon?.levelRequirement ?? 0),
          armor:armor?.id ?? "NONE",
          armorLevel:armor?.levelRequirement ?? 0,
          armorLag:chapter.recommendedLevelMax-(armor?.levelRequirement ?? 0),
          weaponSource:weapon?(cumulativeSources.get(weapon.id)?.at(-1) ?? ""):"",
          armorSource:armor?(cumulativeSources.get(armor.id)?.at(-1) ?? ""):"",
        };
      });
      console.log("GEAR_SOURCE_CHAPTER",chapterNumber,chapter.name);
      console.table(rows);
    }
  });
});
