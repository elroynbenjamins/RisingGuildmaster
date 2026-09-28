import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import { getLevelAppropriateQuestLootIds } from "../src/game/quests/questResolver";
import { generateHero } from "../src/game/heroes/heroGenerator";
import type { ClassId, Hero } from "../src/game/heroes/types";
import { createSeededRandom } from "../src/utils/random";

const CHAPTER_5_MAIN_QUESTS = CAMPAIGN_CHAPTERS[5]!.nodeIds
  .map((id) => CAMPAIGN_NODES[id]?.questId)
  .filter((id): id is string => Boolean(id));
const CHAPTER_5_SIDE_QUESTS = CAMPAIGN_CHAPTERS[5]!.sideQuestIds ?? [];

const STARTERS: Partial<Record<ClassId,{weapon:string;armor:string}>> = {
  warrior:{weapon:"steel-greatsword",armor:"wardplate"},
  ranger:{weapon:"moonwood-longbow",armor:"shadowweave-mantle"},
  mage:{weapon:"wardstone-scepter",armor:"shadowweave-mantle"},
  cleric:{weapon:"wardstone-scepter",armor:"sapphire-lamellar"},
  monk:{weapon:"ironwood-quarterstaff",armor:"warded-handwraps"},
  bard:{weapon:"silver-tongue-rapier",armor:"chorus-coat"},
  spellbow:{weapon:"stormstring-recurve",armor:"runehunter-mantle"},
  bulwark:{weapon:"gateward-shield",armor:"formation-plate"},
  summoner:{weapon:"eidolon-rod",armor:"binder-fieldcoat"},
};

function createParty(classes: readonly ClassId[], seed:number): Hero[] {
  return classes.map((classId,index)=>{
    const hero=generateHero(createSeededRandom(seed+index),{classId});
    const starter=STARTERS[classId]!;
    return {...hero,id:`${classId}-${index}`,level:8,xp:0,equipment:{...hero.equipment,weapon:starter.weapon,armor:starter.armor}};
  });
}
function isBetter(itemId:string,currentId:string|undefined){
  const item=EQUIPMENT[itemId],current=currentId?EQUIPMENT[currentId]:undefined;
  if(!item)return false;
  if(!current)return true;
  return item.levelRequirement>current.levelRequirement || (item.levelRequirement===current.levelRequirement && item.value>current.value);
}
function equipDrop(party:Hero[],itemId:string):{party:Hero[];equippedBy:string|null}{
  const item=EQUIPMENT[itemId];
  if(!item)return {party,equippedBy:null};
  const candidates=party
    .filter(hero=>!item.classRestrictions.length||item.classRestrictions.includes(hero.classId))
    .filter(hero=>isBetter(itemId,hero.equipment[item.slot]))
    .sort((a,b)=>{
      const aCurrent=a.equipment[item.slot]?EQUIPMENT[a.equipment[item.slot]!]!.levelRequirement:0;
      const bCurrent=b.equipment[item.slot]?EQUIPMENT[b.equipment[item.slot]!]!.levelRequirement:0;
      return aCurrent-bCurrent;
    });
  const target=candidates[0];
  if(!target)return {party,equippedBy:null};
  return {
    party:party.map(hero=>hero.id===target.id?{...hero,equipment:{...hero.equipment,[item.slot]:itemId}}:hero),
    equippedBy:target.classId,
  };
}
function runPath(classes:readonly ClassId[],questIds:readonly string[],seed:number){
  let party=createParty(classes,seed);
  const inventory:string[]=[];
  const events=[];
  const random=createSeededRandom(seed+1000);
  const before=party.map(hero=>({
    classId:hero.classId,
    weapon:EQUIPMENT[hero.equipment.weapon!]!.levelRequirement,
    armor:EQUIPMENT[hero.equipment.armor!]!.levelRequirement,
  }));
  for(const questId of questIds){
    const quest=QUESTS[questId]!;
    const table=QUEST_LOOT_TABLES[quest.lootTableId]!;
    const candidates=getLevelAppropriateQuestLootIds(table.itemIds,party,inventory);
    const drop=candidates.length?random.pick(candidates):null;
    let equippedBy:string|null=null;
    if(drop){
      inventory.push(drop);
      const equipped=equipDrop(party,drop);
      party=equipped.party;
      equippedBy=equipped.equippedBy;
    }
    events.push({questId,candidates:candidates.join(","),drop,equippedBy});
  }
  const after=party.map(hero=>({
    classId:hero.classId,
    weapon:EQUIPMENT[hero.equipment.weapon!]!.levelRequirement,
    armor:EQUIPMENT[hero.equipment.armor!]!.levelRequirement,
  }));
  const primaryUpgrades=after.reduce((sum,row,index)=>sum+(row.weapon>before[index]!.weapon?1:0)+(row.armor>before[index]!.armor?1:0),0);
  const badlyLaggingAfter=after.reduce((sum,row)=>sum+(8-row.weapon>=3?1:0)+(8-row.armor>=3?1:0),0);
  return {primaryUpgrades,badlyLaggingAfter,before,after,events};
}

describe("Chapter 5 gear throughput diagnostics",()=>{
  it("measures sequential primary catch-up through story and side loot",()=>{
    const parties=[
      {id:"classic",classes:["warrior","ranger","cleric","mage"] as const},
      {id:"mixed-premium",classes:["warrior","spellbow","bard","cleric"] as const},
      {id:"premium-heavy",classes:["monk","bard","spellbow","summoner"] as const},
      {id:"premium-frontline",classes:["bulwark","monk","bard","summoner"] as const},
    ];
    for(const spec of parties){
      for(const path of [
        {id:"mainline",quests:CHAPTER_5_MAIN_QUESTS},
        {id:"main+side",quests:[...CHAPTER_5_MAIN_QUESTS,...CHAPTER_5_SIDE_QUESTS]},
      ]){
        const results=Array.from({length:20},(_,index)=>runPath(spec.classes,path.quests,17000+index*37));
        console.log("CH5_GEAR_THROUGHPUT",spec.id,path.id,{
          averagePrimaryUpgrades:results.reduce((sum,r)=>sum+r.primaryUpgrades,0)/results.length,
          minPrimaryUpgrades:Math.min(...results.map(r=>r.primaryUpgrades)),
          averageBadlyLaggingAfter:results.reduce((sum,r)=>sum+r.badlyLaggingAfter,0)/results.length,
          maxBadlyLaggingAfter:Math.max(...results.map(r=>r.badlyLaggingAfter)),
        });
        console.dir(results[0],{depth:null});
      }
    }
  });
});
