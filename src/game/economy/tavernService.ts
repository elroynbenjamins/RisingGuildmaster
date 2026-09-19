import type { GuildState } from "../guild/types";

export interface TavernLevelDefinition {
  level: number;
  name: string;
  reputationRequired: number;
  goldCost: number;
  durationDays: number;
  incomeModifier: number;
  recruitmentSlots: number;
  recruitmentReputationBonus: number;
}
export const TAVERN_LEVELS: Record<number,TavernLevelDefinition> = {
  1:{level:1,name:"Charter Hall",reputationRequired:0,goldCost:0,durationDays:0,incomeModifier:0,recruitmentSlots:0,recruitmentReputationBonus:0},
  2:{level:2,name:"Established Tavern",reputationRequired:50,goldCost:900,durationDays:3,incomeModifier:.15,recruitmentSlots:1,recruitmentReputationBonus:10},
  3:{level:3,name:"Regional Guild Hall",reputationRequired:150,goldCost:2200,durationDays:5,incomeModifier:.30,recruitmentSlots:1,recruitmentReputationBonus:25},
  4:{level:4,name:"Crownroad Hall",reputationRequired:350,goldCost:5200,durationDays:7,incomeModifier:.45,recruitmentSlots:2,recruitmentReputationBonus:40},
};
export const MAX_TAVERN_LEVEL=4;
export function nextTavernLevel(guild:GuildState):TavernLevelDefinition|null{return TAVERN_LEVELS[guild.finance.tavernLevel+1]??null;}
export function startTavernUpgrade(guild:GuildState):GuildState{
  if(guild.finance.tavernUpgrade)throw new Error("Guild Hall construction is already underway");
  const next=nextTavernLevel(guild); if(!next)throw new Error("Guild Hall is already fully upgraded");
  if(guild.reputation<next.reputationRequired)throw new Error("Requires "+next.reputationRequired+" guild reputation");
  if(guild.gold<next.goldCost)throw new Error("Not enough gold");
  return {...guild,gold:guild.gold-next.goldCost,finance:{...guild.finance,tavernUpgrade:{targetLevel:next.level,startDay:guild.currentDay,completionDay:guild.currentDay+next.durationDays,goldCost:next.goldCost}}};
}
export function completeTavernUpgrade(guild:GuildState):{guild:GuildState;completed:boolean}{
  const upgrade=guild.finance.tavernUpgrade;
  if(!upgrade||upgrade.completionDay>guild.currentDay)return{guild,completed:false};
  return{guild:{...guild,finance:{...guild.finance,tavernLevel:upgrade.targetLevel,tavernUpgrade:null}},completed:true};
}
export function getTavernRecruitmentBonuses(guild:GuildState){const level=TAVERN_LEVELS[guild.finance.tavernLevel]??TAVERN_LEVELS[1]!;return{extraCandidates:level.recruitmentSlots,reputationBonus:level.recruitmentReputationBonus};}
export function getTavernIncomeModifier(guild:GuildState):number{return (TAVERN_LEVELS[guild.finance.tavernLevel]??TAVERN_LEVELS[1]!).incomeModifier;}
