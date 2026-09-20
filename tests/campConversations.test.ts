import { describe,expect,it } from "vitest";
import { CAMP_CONVERSATIONS } from "../src/data/relationships/campConversations";
import { resolveCampConversation } from "../src/game/relationships/campConversationService";
import { relationshipScore, setRelationship } from "../src/game/relationships/relationshipService";
import { createGuild } from "../src/game/guild/guildService";
import { createQuestChronicleEntry } from "../src/game/quests/questChronicleService";
import { QUESTS } from "../src/data/quests/quests";
import { createWorldState } from "../src/game/world/worldState";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

const outcome=(hero:ReturnType<typeof testHero>,fellInBattle=false)=>({heroId:hero.id,name:hero.name,raceId:hero.raceId,classId:hero.classId,gender:hero.gender,portraitVariant:hero.portraitVariant??0,levelBefore:hero.level,levelAfter:hero.level,currentHP:fellInBattle?0:100,maxHP:200,conditionIds:[],availableSkillPoints:0,fellInBattle,newlyInjured:false});
describe("camp conversations",()=>{
 it("provides authored moments for victory, defeat, compatibility, friendship and rivalry",()=>{expect(Object.keys(CAMP_CONVERSATIONS)).toHaveLength(16);expect(new Set(Object.values(CAMP_CONVERSATIONS).map((entry)=>entry.trigger))).toEqual(new Set(["victory","defeat","shared_ideal","shared_bond","friction","friendship","rivalry","fallen_companion","shared_race","shared_class","shared_background","injured_companion"]));});
 it("selects a shared-ideal conversation deterministically and records its bond and history",()=>{const profile={personalityTraitId:"measured",idealId:"protection",bondId:"family",flawId:"proud"};const a={...testHero(),roleplayProfile:profile};const b={...testHero(),id:"b",name:"Bryn",roleplayProfile:{...profile,bondId:"guild"}};const guild=createGuild();guild.heroes=[a,b];const result=resolveCampConversation(guild,"victory",[a.id,b.id],[outcome(a),outcome(b)],"goblin_patrol","Goblin Patrol",sequenceRandom([0]));expect(result.conversation).toMatchObject({definitionId:"shared_fire",relationshipDelta:2,heroIdA:a.id,heroIdB:b.id});expect(relationshipScore(result.guild.relationships,a.id,b.id)).toBe(2);expect(result.guild.heroes.every((hero)=>hero.history.events.some((entry)=>entry.tags?.includes("camp_conversation")))).toBe(true);});
 it("prioritizes rescuing a fallen companion over a generic victory meal",()=>{const a=testHero();const b={...testHero(),id:"b",name:"Bryn"};const guild=createGuild();guild.heroes=[a,b];const result=resolveCampConversation(guild,"victory",[a.id,b.id],[outcome(a,true),outcome(b)],"goblin_patrol","Goblin Patrol",sequenceRandom([0]));expect(result.conversation?.definitionId).toBe("carried_home");});
 it("uses established friendship and stores the selected scene in the quest chronicle",()=>{const a=testHero();const b={...testHero(),id:"b",name:"Bryn",roleplayProfile:{...testHero().roleplayProfile!,idealId:"honor",bondId:"debt"}};const guild=createGuild();guild.heroes=[a,b];guild.relationships=setRelationship([],a.id,b.id,30);const result=resolveCampConversation(guild,"victory",[a.id,b.id],[outcome(a),outcome(b)],"goblin_patrol","Goblin Patrol",sequenceRandom([0]));expect(result.conversation?.definitionId).toBe("friends_last_watch");const world=createWorldState();const chronicle=createQuestChronicleEntry({quest:QUESTS.goblin_patrol!,status:"victory",day:1,worldBefore:world,worldAfter:world,heroOutcomes:[outcome(a),outcome(b)],campConversation:result.conversation});expect(chronicle.campConversation?.title).toBe("The Last Watch");});
});
