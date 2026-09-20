import { RAIDS } from "../../data/raids/raids";
import type { Hero } from "../heroes/types";
import type { GuildState } from "../guild/types";
import type { RaidDefinition, RaidPartyValidation, RaidPhaseDefinition, RaidProgressState, RaidReadiness, RaidRecord } from "./raidTypes";

const emptyRecord = (): RaidRecord => ({ attempts: 0, victories: 0, lastAttemptDay: null, nextAvailableDay: 1, bestSurvivors: 0, firstVictoryDay: null, bonusGoldClaimed: 0 });
export const createRaidProgressState = (): RaidProgressState => ({ records: {} });
export const getRaidRecord = (guild: GuildState, raidId: string): RaidRecord => ({...emptyRecord(),...(guild.raidProgress?.records[raidId]??{})});

export function getRaidDefinition(id: string): RaidDefinition { const raid = RAIDS[id]; if (!raid) throw new Error(`Unknown raid: ${id}`); return raid; }
export function getActiveRaidPhase(raid: RaidDefinition, currentHP: number, maxHP: number): RaidPhaseDefinition {
  const ratio = maxHP <= 0 ? 0 : Math.max(0, Math.min(1, currentHP / maxHP));
  return [...raid.phases].sort((a, b) => a.hpRatioMax - b.hpRatioMax).find((phase) => ratio <= phase.hpRatioMax) ?? raid.phases[0]!;
}
export function validateRaidParty(raid: RaidDefinition, heroIds: string[], heroes: readonly Hero[]): RaidPartyValidation {
  const errors: string[] = []; const unique = new Set(heroIds); const byId = new Map(heroes.map((hero) => [hero.id, hero]));
  if (heroIds.length !== raid.requiredHeroCount) errors.push(`Raid requires exactly ${raid.requiredHeroCount} heroes`);
  if (unique.size !== heroIds.length) errors.push("A hero cannot join both raid squads");
  for (const id of unique) { const hero = byId.get(id); if (!hero) errors.push(`Unknown hero: ${id}`); else if (!hero.isAvailable || hero.currentHP <= 0) errors.push(`${hero.name} is unavailable`); }
  return { valid: errors.length === 0, errors, squads: [{ role:"vanguard",heroIds:heroIds.slice(0,4) },{ role:"support",heroIds:heroIds.slice(4,8) }] };
}
const FRONTLINE=new Set(["warrior","paladin","berserker","monk","bulwark"]);const SUPPORT=new Set(["cleric","bard","paladin","bulwark","summoner"]);const RANGED=new Set(["ranger","mage","bard","spellbow","summoner"]);const MAGIC=new Set(["mage","cleric","bard","spellbow","summoner"]);const PHYSICAL=new Set(["warrior","ranger","paladin","berserker","monk","bulwark"]);
export function getRaidCompositionWarnings(heroIds:string[],heroes:readonly Hero[]):string[]{const byId=new Map(heroes.map((hero)=>[hero.id,hero]));const squads=[heroIds.slice(0,4),heroIds.slice(4,8)].map((ids)=>ids.map((id)=>byId.get(id)).filter((hero):hero is Hero=>Boolean(hero)));const labels=["Vanguard","Support squad"];const warnings:string[]=[];squads.forEach((squad,index)=>{if(squad.length<4)return;if(!squad.some((hero)=>FRONTLINE.has(hero.classId)))warnings.push(`${labels[index]} has no frontline hero`);if(!squad.some((hero)=>SUPPORT.has(hero.classId)))warnings.push(`${labels[index]} has no healer or protector`);if(!squad.some((hero)=>RANGED.has(hero.classId)))warnings.push(`${labels[index]} has no ranged pressure`);});const selected=squads.flat();if(selected.length===8&&!selected.some((hero)=>MAGIC.has(hero.classId)))warnings.push("Raid has no reliable magical pressure");if(selected.length===8&&!selected.some((hero)=>PHYSICAL.has(hero.classId)))warnings.push("Raid has no reliable physical pressure");if(selected.some((hero)=>hero.adventureStamina<40))warnings.push("One or more heroes have dangerously low adventure stamina");return warnings;}
export function getRaidReadiness(raid:RaidDefinition,heroes:readonly Hero[]):RaidReadiness{const candidates=heroes.filter((hero)=>hero.isAvailable&&hero.currentHP>0).sort((a,b)=>b.level-a.level).slice(0,raid.requiredHeroCount);const averageLevel=candidates.reduce((sum,hero)=>sum+hero.level,0)/Math.max(1,candidates.length);const averageStamina=candidates.reduce((sum,hero)=>sum+hero.adventureStamina,0)/Math.max(1,candidates.length);const warnings:string[]=[];if(candidates.length<raid.requiredHeroCount)warnings.push(`${raid.requiredHeroCount-candidates.length} more available heroes required`);if(averageLevel<raid.recommendedLevel)warnings.push(`Top roster averages Level ${averageLevel.toFixed(1)}; Level ${raid.recommendedLevel} recommended`);if(averageStamina<70)warnings.push(`Top roster averages ${Math.round(averageStamina)} stamina; 70+ recommended`);const status=candidates.length<raid.requiredHeroCount||averageLevel<raid.recommendedLevel-1?"unready":warnings.length?"risky":"ready";return{readyHeroes:candidates.length,averageLevel,averageStamina,recommendedLevel:raid.recommendedLevel,status,warnings};}
export function buildRecommendedRaidParty(heroes:readonly Hero[],minimumStamina=0):string[]{const pool=heroes.filter((hero)=>hero.isAvailable&&hero.currentHP>0&&hero.adventureStamina>=minimumStamina).sort((a,b)=>b.level-a.level||b.adventureStamina-a.adventureStamina);const used=new Set<string>();const take=(predicate:(hero:Hero)=>boolean)=>{const hero=pool.find((entry)=>!used.has(entry.id)&&predicate(entry));if(hero)used.add(hero.id);};for(let squad=0;squad<2;squad++){take((hero)=>FRONTLINE.has(hero.classId));take((hero)=>SUPPORT.has(hero.classId));take((hero)=>RANGED.has(hero.classId));while(used.size<(squad+1)*4){const before=used.size;take(()=>true);if(used.size===before)break;}}return[...used].slice(0,8);}
export function isRaidUnlocked(raid: RaidDefinition, campaignChapter: number, ownedHeroCount: number): boolean { return campaignChapter >= raid.unlockChapter && ownedHeroCount >= raid.requiredHeroCount; }
export function getRaidLockReason(raid: RaidDefinition, guild: GuildState): string | null {
  if (guild.world.campaignChapter < raid.unlockChapter) return `Complete Chapter ${raid.unlockChapter - 1}`;
  if (guild.heroes.length < raid.requiredHeroCount) return `Recruit ${raid.requiredHeroCount} heroes`;
  const record = getRaidRecord(guild, raid.id);
  if (guild.currentDay < record.nextAvailableDay) return `${record.lastAttemptDay!==null&&record.nextAvailableDay-record.lastAttemptDay>=raid.weeklyLockoutDays?"Victory lockout":"Raid recovery"} · ready Day ${record.nextAvailableDay}`;
  return null;
}
export function recordRaidOutcome(guild: GuildState, raidId: string, victory: boolean, survivors: number): GuildState {
  const raid = getRaidDefinition(raidId); const current = getRaidRecord(guild, raidId);
  const firstVictory=victory&&current.victories===0; const bonus=firstVictory?raid.firstVictoryReward.gold:0;
  const record: RaidRecord = { attempts: current.attempts + 1, victories: current.victories + (victory ? 1 : 0), lastAttemptDay: guild.currentDay, nextAvailableDay: victory ? guild.currentDay + raid.weeklyLockoutDays : guild.currentDay + 1, bestSurvivors: Math.max(current.bestSurvivors, survivors),firstVictoryDay:firstVictory?guild.currentDay:current.firstVictoryDay,bonusGoldClaimed:current.bonusGoldClaimed+bonus };
  return { ...guild,gold:guild.gold+bonus, raidProgress: { records: { ...(guild.raidProgress?.records ?? {}), [raidId]: record } } };
}
export function findRaidByQuestId(questId: string): RaidDefinition | undefined { return Object.values(RAIDS).find((raid) => raid.questId === questId); }
