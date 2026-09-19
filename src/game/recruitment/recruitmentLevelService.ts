import type { GuildState } from "../guild/types";
import type { RecruitmentArchetype } from "./recruitmentTypes";

export interface RecruitmentLevelProfile {
  topFourAverage: number;
  campaignCap: number;
  standardMax: number;
  eliteMax: number;
}

export function getRecruitmentLevelProfile(guild: GuildState): RecruitmentLevelProfile {
  const levels=[...guild.heroes].map((hero)=>hero.level).sort((a,b)=>b-a).slice(0,4);
  const topFourAverage=levels.length?levels.reduce((sum,level)=>sum+level,0)/levels.length:1;
  const campaignCap=Math.max(1,Math.min(18,2+Math.max(0,guild.world.campaignChapter-1)*2));
  const rosterBenchmark=Math.max(1,Math.floor(topFourAverage));
  const standardMax=Math.max(1,Math.min(campaignCap,Math.max(1,rosterBenchmark-1)));
  const eliteMax=guild.world.campaignChapter>=2?Math.max(standardMax,Math.min(campaignCap,rosterBenchmark)):standardMax;
  return{topFourAverage,campaignCap,standardMax,eliteMax};
}

export function getRecruitmentLevelRange(guild: GuildState, archetype: RecruitmentArchetype): {min:number;max:number} {
  const profile=getRecruitmentLevelProfile(guild);
  if(archetype==="prospect"){
    const max=Math.max(1,profile.standardMax-1);
    return{min:Math.max(1,max-1),max};
  }
  if(archetype==="standard"){
    const max=profile.standardMax;
    return{min:Math.max(1,max-2),max};
  }
  if(archetype==="veteran"){
    const max=profile.standardMax;
    return{min:Math.max(1,max-1),max};
  }
  const max=profile.eliteMax;
  return{min:Math.max(1,max-1),max};
}
