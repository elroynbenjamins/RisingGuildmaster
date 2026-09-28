import { describe, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import { getLevelAppropriateQuestLootIds } from "../src/game/quests/questResolver";
import { generateHero } from "../src/game/heroes/heroGenerator";
import type { ClassId, Hero } from "../src/game/heroes/types";
import { createSeededRandom } from "../src/utils/random";

const PARTIES=[
  {id:"classic",classes:["warrior","ranger","cleric","mage"] as const},
  {id:"mixed",classes:["paladin","ranger","bard","summoner"] as const},
  {id:"premium-heavy",classes:["bulwark","monk","spellbow","summoner"] as const},
];
const CH5_START:Partial<Record<ClassId,{weapon:string;armor:string}>>={
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
    const start=CH5_START[classId]!;
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
function wardstoneCache(party:Hero[],inventory:string[],random:ReturnType<typeof createSeededRandom>):{party:Hero[];drop:string|null}{
  const averageLevel=Math.max(1,Math.floor(party.reduce((sum,hero)=>sum+hero.level,0)/party.length));
  const minLevel=Math.max(1,averageLevel-2),maxLevel=Math.max(minLevel,averageLevel-1);
  const allowRare=random.next()<.15;
  const owned=new Set([...inventory,...party.flatMap(hero=>Object.values(hero.equipment).filter((id):id is string=>Boolean(id)))]);
  const levelAppropriate=Object.values(EQUIPMENT).filter(item=>
    item.levelRequirement>=minLevel && item.levelRequirement<=maxLevel &&
    (!item.classRestrictions.length||party.some(hero=>item.classRestrictions.includes(hero.classId))));
  const preferred=levelAppropriate.filter(item=>item.rarity==="common"||item.rarity==="uncommon"||(allowRare&&item.rarity==="rare"));
  const eligible=preferred.length?preferred:levelAppropriate.filter(item=>item.rarity==="rare");
  const newItems=eligible.filter(item=>!owned.has(item.id));
  const candidates=newItems.length?newItems:eligible;
  if(!candidates.length)return {party,drop:null};
  const score=(item:(typeof candidates)[number])=>{
    let value=item.rarity==="rare"?3:item.rarity==="uncommon"?2:1;
    for(const hero of party){
      if(item.classRestrictions.length&&!item.classRestrictions.includes(hero.classId))continue;
      const equippedId=hero.equipment[item.slot],equipped=equippedId?EQUIPMENT[equippedId]:undefined;
      if(!equipped)value+=5;
      else if(equipped.levelRequirement<item.levelRequirement)value+=4;
      else if(equipped.levelRequirement===item.levelRequirement&&equipped.rarity==="common"&&item.rarity!=="common")value+=2;
    }
    return value;
  };
  const ranked=[...candidates].sort((a,b)=>score(b)-score(a)||b.levelRequirement-a.levelRequirement||a.id.localeCompare(b.id));
  const best=score(ranked[0]!);
  const top=ranked.filter(item=>score(item)>=best-1).slice(0,4);
  const awarded=random.pick(top);
  inventory.push(awarded.id);
  return {party:equipDrop(party,awarded.id),drop:awarded.id};
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
    const cacheDrops:string[]=[];
    let caches=0;
    while(lagCount(party)>0 && caches<2){
      const result=wardstoneCache(party,inventory,random);
      if(!result.drop)break;
      party=result.party;
      cacheDrops.push(result.drop);
      caches+=1;
    }
    chapters.push({
      chapter:chapterNumber,
      lagAfterStory,
      lagAfterTwoCaches:lagCount(party),
      caches,
      cacheDrops,
      final:party.map(hero=>({classId:hero.classId,weapon:EQUIPMENT[hero.equipment.weapon!]!.levelRequirement,armor:EQUIPMENT[hero.equipment.armor!]!.levelRequirement})),
    });
  }
  return chapters;
}

describe("cumulative late gear throughput diagnostics",()=>{
  it("checks Chapter 6-9 story plus two Wardstone cache budget",()=>{
    for(const spec of PARTIES){
      const all=Array.from({length:30},(_,index)=>run(spec.classes,31000+index*41));
      for(const chapterNumber of [6,7,8,9] as const){
        const rows=all.map(path=>path.find(entry=>entry.chapter===chapterNumber)!);
        console.log("CUMULATIVE_LATE_GEAR",spec.id,chapterNumber,{
          averageLagAfterStory:rows.reduce((sum,r)=>sum+r.lagAfterStory,0)/rows.length,
          averageLagAfterTwoCaches:rows.reduce((sum,r)=>sum+r.lagAfterTwoCaches,0)/rows.length,
          maxLagAfterTwoCaches:Math.max(...rows.map(r=>r.lagAfterTwoCaches)),
          averageCachesUsed:rows.reduce((sum,r)=>sum+r.caches,0)/rows.length,
          sample:rows[0],
        });
      }
    }
  });
});
