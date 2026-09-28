import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import { getLevelAppropriateQuestLootIds } from "../src/game/quests/questResolver";
import { generateHero } from "../src/game/heroes/heroGenerator";
import type { ClassId, EquipmentSlot, Hero } from "../src/game/heroes/types";
import { createSeededRandom } from "../src/utils/random";

const PRIOR_CAP:Record<number,number>={6:7,7:10,8:12,9:15};
const PARTIES=[
  {id:"classic",classes:["warrior","ranger","cleric","mage"] as const},
  {id:"mixed",classes:["paladin","ranger","bard","summoner"] as const},
  {id:"premium-heavy",classes:["bulwark","monk","spellbow","summoner"] as const},
];

function bestUsable(classId:ClassId,slot:EquipmentSlot,maxLevel:number){
  return Object.values(EQUIPMENT)
    .filter(item=>item.slot===slot && item.levelRequirement<=maxLevel)
    .filter(item=>!item.classRestrictions.length||item.classRestrictions.includes(classId))
    .sort((a,b)=>b.levelRequirement-a.levelRequirement || b.value-a.value)[0]!;
}
function createParty(classes:readonly ClassId[],level:number,cap:number,seed:number):Hero[]{
  return classes.map((classId,index)=>{
    const hero=generateHero(createSeededRandom(seed+index),{classId});
    const weapon=bestUsable(classId,"weapon",cap);
    const armor=bestUsable(classId,"armor",cap);
    return {...hero,id:`${classId}-${index}`,level,xp:0,equipment:{...hero.equipment,weapon:weapon.id,armor:armor.id}};
  });
}
function isUpgrade(hero:Hero,itemId:string){
  const item=EQUIPMENT[itemId]; if(!item)return false;
  const currentId=hero.equipment[item.slot], current=currentId?EQUIPMENT[currentId]:undefined;
  return !current || item.levelRequirement>current.levelRequirement || (item.levelRequirement===current.levelRequirement && item.value>current.value);
}
function equipBest(party:Hero[],itemId:string):Hero[]{
  const item=EQUIPMENT[itemId]; if(!item)return party;
  const candidates=party
    .filter(hero=>!item.classRestrictions.length||item.classRestrictions.includes(hero.classId))
    .filter(hero=>isUpgrade(hero,itemId))
    .sort((a,b)=>{
      const al=a.equipment[item.slot]?EQUIPMENT[a.equipment[item.slot]!]!.levelRequirement:0;
      const bl=b.equipment[item.slot]?EQUIPMENT[b.equipment[item.slot]!]!.levelRequirement:0;
      return al-bl;
    });
  const target=candidates[0]; if(!target)return party;
  return party.map(hero=>hero.id===target.id?{...hero,equipment:{...hero.equipment,[item.slot]:itemId}}:hero);
}
function questIds(chapterNumber:number,includeSides:boolean){
  const chapter=CAMPAIGN_CHAPTERS[chapterNumber]!;
  const main=chapter.nodeIds.map(id=>CAMPAIGN_NODES[id]?.questId).filter((id):id is string=>Boolean(id));
  return includeSides?[...main,...(chapter.sideQuestIds??[])]:main;
}
function run(chapterNumber:number,classes:readonly ClassId[],includeSides:boolean,seed:number){
  const chapter=CAMPAIGN_CHAPTERS[chapterNumber]!;
  const level=chapter.recommendedLevelMax!;
  let party=createParty(classes,level,PRIOR_CAP[chapterNumber]!,seed);
  const inventory:string[]=[];
  let primaryUpgrades=0;
  const before=new Map(party.flatMap(hero=>[
    [`${hero.id}:weapon`,EQUIPMENT[hero.equipment.weapon!]!.levelRequirement] as const,
    [`${hero.id}:armor`,EQUIPMENT[hero.equipment.armor!]!.levelRequirement] as const,
  ]));
  const random=createSeededRandom(seed+5000);
  for(const questId of questIds(chapterNumber,includeSides)){
    const quest=QUESTS[questId]!;
    const table=QUEST_LOOT_TABLES[quest.lootTableId];
    if(!table)continue;
    const candidates=getLevelAppropriateQuestLootIds(table.itemIds,party,inventory);
    if(!candidates.length)continue;
    const drop=random.pick(candidates);
    inventory.push(drop);
    party=equipBest(party,drop);
  }
  for(const hero of party){
    for(const slot of ["weapon","armor"] as const){
      const current=EQUIPMENT[hero.equipment[slot]!]!.levelRequirement;
      if(current>(before.get(`${hero.id}:${slot}`)??0))primaryUpgrades+=1;
    }
  }
  const badlyLagging=party.reduce((sum,hero)=>sum+
    (level-EQUIPMENT[hero.equipment.weapon!]!.levelRequirement>=3?1:0)+
    (level-EQUIPMENT[hero.equipment.armor!]!.levelRequirement>=3?1:0),0);
  return {primaryUpgrades,badlyLagging,final:party.map(hero=>({classId:hero.classId,weapon:EQUIPMENT[hero.equipment.weapon!]!.levelRequirement,armor:EQUIPMENT[hero.equipment.armor!]!.levelRequirement}))};
}

describe("late campaign primary gear throughput diagnostics",()=>{
  it("measures Chapters 6-9 sequential loot pressure",()=>{
    for(const chapterNumber of [6,7,8,9] as const){
      for(const spec of PARTIES){
        for(const includeSides of [false,true]){
          const results=Array.from({length:20},(_,index)=>run(chapterNumber,spec.classes,includeSides,22000+chapterNumber*100+index*29));
          console.log("LATE_GEAR_THROUGHPUT",chapterNumber,spec.id,includeSides?"main+side":"mainline",{
            averagePrimaryUpgrades:results.reduce((sum,r)=>sum+r.primaryUpgrades,0)/results.length,
            minPrimaryUpgrades:Math.min(...results.map(r=>r.primaryUpgrades)),
            averageBadlyLaggingAfter:results.reduce((sum,r)=>sum+r.badlyLagging,0)/results.length,
            maxBadlyLaggingAfter:Math.max(...results.map(r=>r.badlyLagging)),
            sampleFinal:results[0]!.final,
          });
        }
      }
    }
  });
});
