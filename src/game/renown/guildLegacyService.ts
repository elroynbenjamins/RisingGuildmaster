import { GUILD_RANKS } from "../../data/renown/guildRanks";
import { GUILD_TROPHIES } from "../../data/renown/guildTrophies";
import type { GuildLegacyState, GuildRankDefinition, TrophyBonusTarget } from "./guildLegacyTypes";
export const TROPHY_DISPLAY_CAPACITY=6;
export function createGuildLegacyState():GuildLegacyState{return{displayedTrophyIds:[]};}
export function getGuildRank(reputation:number):GuildRankDefinition{return[...GUILD_RANKS].reverse().find((rank)=>reputation>=rank.reputationRequired)??GUILD_RANKS[0]!;}
export function getNextGuildRank(reputation:number):GuildRankDefinition|null{return GUILD_RANKS.find((rank)=>rank.reputationRequired>reputation)??null;}
export function getQuestReputationReward(reputation:number,questType:"campaign"|"side"|"contract"|"boss",difficulty:number):number{const base=questType==="boss"?12+difficulty*3:questType==="campaign"?6+difficulty*2:questType==="side"?4+difficulty:2+Math.ceil(difficulty/2);return Math.max(1,Math.round(base*(1+getGuildRank(reputation).benefits.questReputationModifier)));}
export function getUnlockedTrophyIds(completedQuestIds:readonly string[]):string[]{const completed=new Set(completedQuestIds);return Object.values(GUILD_TROPHIES).filter((trophy)=>completed.has(trophy.sourceQuestId)).map((trophy)=>trophy.id);}
export function toggleDisplayedTrophy(state:GuildLegacyState,trophyId:string,unlockedIds:readonly string[],capacity=TROPHY_DISPLAY_CAPACITY):GuildLegacyState{if(!unlockedIds.includes(trophyId))throw new Error("Trophy has not been earned");if(state.displayedTrophyIds.includes(trophyId))return{...state,displayedTrophyIds:state.displayedTrophyIds.filter((id)=>id!==trophyId)};if(state.displayedTrophyIds.length>=capacity)throw new Error("All Trophy Hall display slots are occupied");return{...state,displayedTrophyIds:[...state.displayedTrophyIds,trophyId]};}
export function displayedTrophyBonus(state:GuildLegacyState,target:TrophyBonusTarget):number{return state.displayedTrophyIds.reduce((sum,id)=>sum+(GUILD_TROPHIES[id]?.bonus.target===target?GUILD_TROPHIES[id]!.bonus.value:0),0);}
