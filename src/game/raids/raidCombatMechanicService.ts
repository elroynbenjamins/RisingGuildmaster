import { RAID_PHASE_EFFECTS } from "../../data/raids/raidMechanics";
import type { CombatState, HeroCombatant } from "../combat/combatEngine";
import { applyCombatCondition } from "../combat/conditionResolver";
import { setOccupant } from "../combat/grid/boardFactory";
import { positionKey } from "../combat/grid/gridTypes";
import { findRaidByQuestId, getActiveRaidPhase } from "./raidService";
import type { RaidCombatMechanicState, RaidMechanicEffect } from "./raidTypes";

const emptyMechanic = ():RaidCombatMechanicState=>({activePhaseId:null,telegraphedPositions:[],safePositions:[],objectives:[],resolvesAtRound:null,lastScheduledRound:0,announcement:null});
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const log=(state:CombatState,message:string):CombatState=>({...state,log:[...state.log,{turn:state.turn,actorId:"raid_mechanic",actionId:"raid_mechanic",targetIds:[],message}]});

function damageHeroes(state:CombatState,predicate:(hero:HeroCombatant)=>boolean,ratio:number,label:string):CombatState{
  let board=state.board;let casualties=0;const heroes=state.heroes.map((hero)=>{if(!hero.unit.isAlive||!predicate(hero))return hero;const damage=Math.max(1,Math.round(hero.unit.maxHP*ratio));const hp=Math.max(0,hero.unit.currentHP-damage);if(hp===0){casualties++;board=setOccupant(board,hero.unit.position,null);}const unit={...hero.unit,currentHP:hp,isAlive:hp>0};return {...hero,unit,instance:{...hero.instance,currentHP:hp,isAlive:hp>0}};});
  return log({...state,heroes,board},`${label}${casualties?` · ${casualties} hero${casualties===1?"":"es"} fell.`:""}`);
}
function applyImmediate(state:CombatState,effect:RaidMechanicEffect,phaseName:string):CombatState{
  if(effect.kind==="entomb"){
    const boss=state.enemies.find((enemy)=>enemy.unit.isAlive);const targets=[...state.heroes].filter((hero)=>hero.unit.isAlive).sort((a,b)=>distance(b.unit.position,boss?.unit.position??{x:state.board.width,y:0})-distance(a.unit.position,boss?.unit.position??{x:state.board.width,y:0})).slice(0,effect.targetCount);const ids=new Set(targets.map((hero)=>hero.hero.id));
    let next=damageHeroes(state,(hero)=>ids.has(hero.hero.id),effect.damageMaxHpRatio,`${phaseName}: ${targets.map((hero)=>hero.hero.name).join(" and ")} are entombed in raid terrain.`);
    next={...next,heroes:next.heroes.map((hero)=>!ids.has(hero.hero.id)||!hero.unit.isAlive?hero:{...hero,unit:{...hero.unit,activeConditions:applyCombatCondition(hero.unit.activeConditions,"rooted",effect.durationTurns)},instance:{...hero.instance,activeConditions:applyCombatCondition(hero.instance.activeConditions,"rooted",effect.durationTurns)}})};return next;
  }
  if(effect.kind==="interception"){
    const boss=state.enemies.find((enemy)=>enemy.unit.isAlive);const targets=[...state.heroes].filter((hero)=>hero.unit.isAlive).sort((a,b)=>distance(a.unit.position,boss?.unit.position??{x:state.board.width,y:0})-distance(b.unit.position,boss?.unit.position??{x:state.board.width,y:0})).slice(0,effect.targetCount);const ratios=new Map(targets.map((target)=>{const intercepted=state.heroes.some((ally)=>ally.hero.id!==target.hero.id&&ally.unit.isAlive&&distance(ally.unit.position,target.unit.position)<=1);return [target.hero.id,effect.damageMaxHpRatio*(intercepted?effect.mitigationRatio:1)];}));let next=state;for(const [id,ratio] of ratios)next=damageHeroes(next,(hero)=>hero.hero.id===id,ratio,`${phaseName}: ${state.heroes.find((hero)=>hero.hero.id===id)?.hero.name} ${ratio<effect.damageMaxHpRatio?"is intercepted by an adjacent ally":"takes the full marked strike"}.`);return next;
  }
  if(effect.kind==="contracting_arena")return damageHeroes(state,(hero)=>hero.unit.position.x<effect.inset||hero.unit.position.y<effect.inset||hero.unit.position.x>=state.board.width-effect.inset||hero.unit.position.y>=state.board.height-effect.inset,effect.damageMaxHpRatio,`${phaseName}: the outer arena collapses; heroes outside the safe center take damage.`);
  return state;
}

function resolveLivingObjectives(state:CombatState):CombatState{
  const mechanic=state.raidMechanic;if(!mechanic?.objectives.length)return state;
  if(mechanic.activePhaseId==="silken_procession"&&state.round>1&&state.round%2===0){
    const healingRatio=.0125*mechanic.objectives.length;
    const enemies=state.enemies.map((enemy)=>enemy.instance.enemyDefinitionId!=="spider_queen"||!enemy.unit.isAlive?enemy:(()=>{const hp=Math.min(enemy.unit.maxHP,enemy.unit.currentHP+Math.max(1,Math.round(enemy.unit.maxHP*healingRatio)));return{...enemy,unit:{...enemy.unit,currentHP:hp},instance:{...enemy.instance,currentHP:hp}};})());
    return log({...state,enemies},`Broodheart pulse: ${mechanic.objectives.length} egg cluster${mechanic.objectives.length===1?"":"s"} restore ${Math.round(healingRatio*100)}% of the Queen's maximum HP.`);
  }
  return state;
}

function enterPhase(state:CombatState,phaseId:string,phaseName:string,effect:RaidMechanicEffect):CombatState{
  let next=log(state,`RAID PHASE — ${phaseName}.`);next={...next,lastVisualEvent:{id:next.log.length+next.turn*1000,kind:"phase",actionId:phaseId,actorId:"raid_mechanic",range:0,effects:[]}};let mechanic:RaidCombatMechanicState={...(next.raidMechanic??emptyMechanic()),activePhaseId:phaseId,announcement:phaseName,telegraphedPositions:[],safePositions:[],objectives:[]};
  if(phaseId==="silken_procession")mechanic={...mechanic,objectives:[{id:"egg-northwest",name:"Pulsing Egg Cluster",position:{x:6,y:2},currentIntegrity:2,maxIntegrity:2},{id:"egg-southwest",name:"Pulsing Egg Cluster",position:{x:6,y:10},currentIntegrity:2,maxIntegrity:2},{id:"egg-northeast",name:"Pulsing Egg Cluster",position:{x:10,y:2},currentIntegrity:2,maxIntegrity:2},{id:"egg-southeast",name:"Pulsing Egg Cluster",position:{x:10,y:10},currentIntegrity:2,maxIntegrity:2}]};
  if(phaseId==="false_coordinates")mechanic={...mechanic,objectives:[{id:"obelisk-north",name:"Chart Obelisk",position:{x:9,y:3},currentIntegrity:3,maxIntegrity:3},{id:"obelisk-west",name:"Chart Obelisk",position:{x:5,y:7},currentIntegrity:3,maxIntegrity:3},{id:"obelisk-east",name:"Chart Obelisk",position:{x:13,y:7},currentIntegrity:3,maxIntegrity:3},{id:"obelisk-south",name:"Chart Obelisk",position:{x:9,y:11},currentIntegrity:3,maxIntegrity:3}]};
  if(effect.kind==="telegraphed_damage")mechanic={...mechanic,telegraphedPositions:effect.positions,resolvesAtRound:next.round+1,lastScheduledRound:next.round};
  else {if(effect.kind==="contracting_arena")mechanic={...mechanic,safePositions:next.board.tiles.filter((tile)=>tile.position.x>=effect.inset&&tile.position.y>=effect.inset&&tile.position.x<next.board.width-effect.inset&&tile.position.y<next.board.height-effect.inset).map((tile)=>tile.position)};next=applyImmediate(next,effect,phaseName);}
  return {...next,raidMechanic:mechanic};
}

export function strikeRaidObjective(state:CombatState,position:{x:number;y:number}):CombatState{
  const actor=state.heroes.find((hero)=>hero.hero.id===state.awaitingHeroId);if(!actor||state.actions.combatActionUsed)throw new Error("No raid action is available");if(distance(actor.unit.position,position)>1)throw new Error("Move adjacent to the raid objective");const mechanic=state.raidMechanic??emptyMechanic();const objective=mechanic.objectives.find((entry)=>positionKey(entry.position)===positionKey(position));if(!objective)throw new Error("No raid objective on this tile");const remaining=objective.currentIntegrity-1;const objectives=remaining<=0?mechanic.objectives.filter((entry)=>entry.id!==objective.id):mechanic.objectives.map((entry)=>entry.id===objective.id?{...entry,currentIntegrity:remaining}:entry);return log({...state,actions:{...state.actions,combatActionUsed:true},raidMechanic:{...mechanic,objectives}},`${actor.hero.name} strikes ${objective.name}${remaining<=0?" and destroys it":` · ${remaining}/${objective.maxIntegrity} integrity`}.`);
}

export function initializeRaidMechanics(state:CombatState):CombatState{
  const raid=findRaidByQuestId(state.questId);if(!raid)return state;const boss=state.enemies.find((enemy)=>enemy.instance.enemyDefinitionId===raid.bossEnemyDefinitionId&&enemy.unit.isAlive);if(!boss)return {...state,raidMechanic:emptyMechanic()};const phase=getActiveRaidPhase(raid,boss.unit.currentHP,boss.unit.maxHP);const effect=RAID_PHASE_EFFECTS[phase.id];return effect?enterPhase({...state,raidMechanic:emptyMechanic()},phase.id,phase.name,effect):state;
}

export function resolveRaidRoundStart(state:CombatState):CombatState{
  const raid=findRaidByQuestId(state.questId);if(!raid)return state;let next=resolveLivingObjectives(state);const mechanic=next.raidMechanic??emptyMechanic();
  if(mechanic.resolvesAtRound!==null&&next.round>=mechanic.resolvesAtRound){const keys=new Set(mechanic.telegraphedPositions.map(positionKey));next=damageHeroes(next,(hero)=>keys.has(positionKey(hero.unit.position)),RAID_PHASE_EFFECTS[mechanic.activePhaseId!]?.kind==="telegraphed_damage"?(RAID_PHASE_EFFECTS[mechanic.activePhaseId!] as Extract<RaidMechanicEffect,{kind:"telegraphed_damage"}>).damageMaxHpRatio:.1,"Telegraphed raid hazard erupts.");next={...next,raidMechanic:{...mechanic,telegraphedPositions:[],resolvesAtRound:null}};}
  const boss=next.enemies.find((enemy)=>enemy.instance.enemyDefinitionId===raid.bossEnemyDefinitionId&&enemy.unit.isAlive);if(!boss)return next;const phase=getActiveRaidPhase(raid,boss.unit.currentHP,boss.unit.maxHP);const effect=RAID_PHASE_EFFECTS[phase.id];if(!effect)return next;if(next.raidMechanic?.activePhaseId!==phase.id)return enterPhase(next,phase.id,phase.name,effect);
  if(effect.kind==="contracting_arena")return applyImmediate(next,effect,phase.name);
  if(effect.kind==="telegraphed_damage"&&effect.repeatEveryRounds&&next.raidMechanic.resolvesAtRound===null&&next.round-next.raidMechanic.lastScheduledRound>=effect.repeatEveryRounds)return {...next,raidMechanic:{...next.raidMechanic,telegraphedPositions:effect.positions,resolvesAtRound:next.round+1,lastScheduledRound:next.round},log:[...next.log,{turn:next.turn,actorId:"raid_mechanic",actionId:"raid_telegraph",targetIds:[],message:`${phase.name}: danger tiles flare. Move before the next round.`}]};
  return next;
}
