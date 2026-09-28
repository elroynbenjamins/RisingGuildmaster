import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import { getExpeditionCacheTopItemIds } from "../src/game/dungeons/dungeonRunService";
import { getLevelAppropriateQuestLootIds } from "../src/game/quests/questResolver";
import { generateHero } from "../src/game/heroes/heroGenerator";
import type { ClassId, Hero } from "../src/game/heroes/types";
import { createSeededRandom } from "../src/utils/random";

const PARTIES=[
  {id:"classic",classes:["warrior","ranger","cleric","mage"] as const},
  {id:"mixed",classes:["paladin","ranger","bard","summoner"] as const},
  {id:"premium-heavy",classes:["bulwark","monk","spellbow","summoner"] as const},
];
const START:Partial<Record<ClassId,{weapon:string;armor:string}>>={
  warrior:{weapon:"memoryglass-blade",armor:"cinderroad-fieldcoat"},
  ranger:{weapon:"memoryglass-blade",armor:"cinderroad-fieldcoat"},
  mage:{weapon:"cinderroad-crozier",armor:"cinderroad-fieldcoat"},
  cleric:{weapon:"cinderroad-crozier",armor:"cinderroad-fieldcoat"},
  paladin:{weapon:"memoryglass-blade",armor:"cinderroad-fieldcoat"},
  bard:{weapon:"emberverse-rapier",armor:"cinderroad-fieldcoat"},
  summoner:{weapon:"cinderroad-crozier",armor:"cinderroad-fieldcoat"},
  bulwark:{weapon:"hearthwall-shield",armor:"cinderroad-fieldcoat"},
  monk:{weapon:"cinderstep-quarterstaff",armor:"cinderroad-fieldcoat"},
  spellbow:{weapon:"cinderscript-recurve",armor:"cinderroad-fieldcoat"},
};

function createParty(classes:readonly ClassId[],seed:number):Hero[]{
  return classes.map((classId,index)=>{
    const hero=generateHero(createSeededRandom(seed+index),{classId});
    const start=START[classId]!;
    return {...hero,id:`${classId}-${index}`,level:9,xp:0,equipment:{...hero.equipment,weapon:start.weapon,armor:start.armor}};
  });
}
function isUpgrade(hero:Hero,itemId:string){
  const item=EQUIPMENT[itemId]; if(!item)return false;
  const currentId=hero.equipment[item.slot],current=currentId?EQUIPMENT[currentId]:undefined;
  if(!current)return true;
  return item.levelRequirement>current.levelRequirement || (item.levelRequirement===current.levelRequirement && item.value>current.value);
}
function equipDrop(party:Hero[],itemId:string):Hero[]{
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
function chapterQuestIds(chapterNumber:number){
  const chapter=CAMPAIGN_CHAPTERS[chapterNumber]!;
  const main=chapter.nodeIds.map(id=>CAMPAIGN_NODES[id]?.questId).filter((id):id is string=>Boolean(id));
  return [...main,...(chapter.sideQuestIds??[])];
}
function storyDrops(party:Hero[],chapterNumber:number,inventory:string[],random:ReturnType<typeof createSeededRandom>){
  let next=party;
  for(const questId of chapterQuestIds(chapterNumber)){
    const quest=QUESTS[questId]!;
    const table=QUEST_LOOT_TABLES[quest.lootTableId];
    if(!table)continue;
    const candidates=getLevelAppropriateQuestLootIds(table.itemIds,next,inventory);
    if(!candidates.length)continue;
    const drop=random.pick(candidates);
    inventory.push(drop);
    next=equipDrop(next,drop);
  }
  return next;
}
function cache(party:Hero[],inventory:string[],random:ReturnType<typeof createSeededRandom>){
  const candidates=getExpeditionCacheTopItemIds(party,inventory,random.next()<.15);
  if(!candidates.length)return {party,drop:null};
  const drop=random.pick(candidates);
  inventory.push(drop);
  return {party:equipDrop(party,drop),drop};
}
function lagCount(party:Hero[]){
  return party.reduce((sum,hero)=>sum+
    (hero.level-EQUIPMENT[hero.equipment.weapon!]!.levelRequirement>=3?1:0)+
    (hero.level-EQUIPMENT[hero.equipment.armor!]!.levelRequirement>=3?1:0),0);
}
function run(classes:readonly ClassId[],seed:number){
  let party=createParty(classes,seed);
  const inventory:string[]=[];
  const random=createSeededRandom(seed+9000);
  const chapters=[];
  for(const chapterNumber of [6,7,8,9] as const){
    const level=CAMPAIGN_CHAPTERS[chapterNumber]!.recommendedLevelMax!;
    party=party.map(hero=>({...hero,level}));
    party=storyDrops(party,chapterNumber,inventory,random);
    const lagAfterStory=lagCount(party);
    const drops:string[]=[];
    for(let i=0;i<2 && lagCount(party)>0;i+=1){
      const result=cache(party,inventory,random);
      if(!result.drop)break;
      party=result.party;
      drops.push(result.drop);
    }
    chapters.push({chapter:chapterNumber,lagAfterStory,lagAfterTwoCaches:lagCount(party),drops,final:party.map(hero=>({classId:hero.classId,weapon:EQUIPMENT[hero.equipment.weapon!]!.levelRequirement,armor:EQUIPMENT[hero.equipment.armor!]!.levelRequirement}))});
  }
  return chapters;
}

describe("Wardstone primary catch-up diagnostics",()=>{
  it("measures cumulative story plus two production cache rewards",()=>{
    for(const spec of PARTIES){
      const all=Array.from({length:30},(_,index)=>run(spec.classes,41000+index*41));
      for(const chapterNumber of [6,7,8,9] as const){
        const rows=all.map(path=>path.find(entry=>entry.chapter===chapterNumber)!);
        console.log("PRIMARY_CACHE_CUMULATIVE",spec.id,chapterNumber,{
          averageLagAfterStory:rows.reduce((sum,r)=>sum+r.lagAfterStory,0)/rows.length,
          averageLagAfterTwoCaches:rows.reduce((sum,r)=>sum+r.lagAfterTwoCaches,0)/rows.length,
          maxLagAfterTwoCaches:Math.max(...rows.map(r=>r.lagAfterTwoCaches)),
          sample:rows[0],
        });
      }
    }
  });
});
