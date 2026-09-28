import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import type { ClassId } from "../src/game/heroes/types";
import { STARTER_JOURNEY } from "../src/game/onboarding/starterJourneyService";

const CLASSES: readonly ClassId[] = ["warrior","ranger","mage","cleric","paladin","berserker","monk","bard","spellbow","bulwark","summoner"];

function questSources(itemId: string): string[] {
  const sources: string[] = [];
  for (const quest of Object.values(QUESTS)) {
    if (QUEST_LOOT_TABLES[quest.lootTableId]?.itemIds.includes(itemId)) sources.push(`loot:${quest.id}`);
    for (const recipeId of quest.recipeUnlockIdsOnVictory ?? []) {
      if (CRAFTING_RECIPES[recipeId]?.outputEquipmentId === itemId) sources.push(`recipe:${quest.id}`);
    }
  }
  return sources;
}
function defaultRecipeSources(itemId: string): string[] {
  return Object.values(CRAFTING_RECIPES)
    .filter((recipe) => !recipe.unlockSource && recipe.outputEquipmentId === itemId)
    .map((recipe) => `default-${recipe.artisanType}-L${recipe.artisanLevel}:${recipe.id}`);
}
function chapterForQuest(questId: string): number | null {
  for (const [chapterNumber, chapter] of Object.entries(CAMPAIGN_CHAPTERS)) {
    const ids = [
      ...chapter.nodeIds.map((id) => CAMPAIGN_NODES[id]?.questId).filter((id): id is string => Boolean(id)),
      ...(chapter.sideQuestIds ?? []),
    ];
    if (ids.includes(questId)) return Number(chapterNumber);
  }
  if (questId === STARTER_JOURNEY.roadQuestId || questId === STARTER_JOURNEY.sideQuestId) return 1;
  return null;
}

describe("campaign gear source diagnostics",()=>{
  it("lists authored Level 7-9 primary gear and source timing",()=>{
    const rows=[];
    for(const classId of CLASSES){
      for(const slot of ["weapon","armor"] as const){
        const items=Object.values(EQUIPMENT)
          .filter((item)=>item.slot===slot)
          .filter((item)=>item.levelRequirement>=7&&item.levelRequirement<=9)
          .filter((item)=>!item.classRestrictions.length||item.classRestrictions.includes(classId))
          .sort((a,b)=>b.levelRequirement-a.levelRequirement||a.id.localeCompare(b.id));
        rows.push({
          classId,
          slot,
          items:items.map((item)=>{
            const qs=questSources(item.id);
            const defaults=defaultRecipeSources(item.id);
            return {
              id:item.id,
              level:item.levelRequirement,
              questSources:qs,
              earliestChapter:qs.map((source)=>chapterForQuest(source.split(":")[1]!)).filter((value):value is number=>value!==null).sort((a,b)=>a-b)[0] ?? null,
              defaultRecipes:defaults,
              wardstoneCacheAtPartyLevel: item.levelRequirement + 1,
            };
          }),
        });
      }
    }
    console.log("MIDGAME_PRIMARY_SOURCES");
    console.dir(rows,{depth:null});
  });
});
