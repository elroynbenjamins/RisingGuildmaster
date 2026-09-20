import { QUESTS } from "../../data/quests/quests";
import type { GuildState } from "../guild/types";

export interface BountyOffer {
  id: string;
  questId: string;
  title: string;
  bonusGold: number;
  bonusReputation: number;
  expiresDay: number;
  claimed: boolean;
}
const CYCLE_DAYS=7;
export function areBountiesUnlocked(guild:GuildState):boolean{return guild.reputation>=50;}
export function getBountyCycle(guild:GuildState):number{return Math.floor(Math.max(0,guild.currentDay-1)/CYCLE_DAYS);}
export function getBountyOffers(guild:GuildState):BountyOffer[]{
  if(!areBountiesUnlocked(guild))return[];
  const cycle=getBountyCycle(guild);
  const eligible=Object.values(QUESTS).filter((quest)=>quest.repeatable&&!quest.hiddenFromQuestBoard&&guild.world.unlockedRegionIds.includes(quest.regionId));
  if(!eligible.length)return[];
  const rotated=[...eligible].sort((a,b)=>a.id.localeCompare(b.id));
  const selected=[rotated[cycle%rotated.length]!,rotated[(cycle+1)%rotated.length]!].filter((quest,index,array)=>array.findIndex((entry)=>entry.id===quest.id)===index);
  return selected.map((quest,index)=>{
    const id="bounty:"+cycle+":"+quest.id;
    const midpoint=Math.round((quest.goldRewardMin+quest.goldRewardMax)/2);
    return{id,questId:quest.id,title:index===0?"Priority Bounty":"Road Bounty",bonusGold:Math.max(75,Math.round(midpoint*.25)),bonusReputation:3+Math.min(3,quest.difficulty),expiresDay:(cycle+1)*CYCLE_DAYS+1,claimed:guild.bountyProgress.claimedOfferIds.includes(id)};
  });
}
export function applyBountyReward(guild:GuildState,questId:string):{guild:GuildState;offer:BountyOffer|null}{
  const offer=getBountyOffers(guild).find((entry)=>entry.questId===questId&&!entry.claimed)??null;
  if(!offer)return{guild,offer:null};
  return{offer,guild:{...guild,gold:guild.gold+offer.bonusGold,reputation:guild.reputation+offer.bonusReputation,bountyProgress:{claimedOfferIds:[...guild.bountyProgress.claimedOfferIds,offer.id]}}};
}
