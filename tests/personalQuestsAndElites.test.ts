import { describe,expect,it } from "vitest";
import { ROGUELITE_ENCOUNTERS } from "../src/data/dungeons/rogueliteEncounters";
import { ENEMIES } from "../src/data/enemies";
import { HERO_PERSONAL_QUESTS } from "../src/data/quests/heroPersonalQuests";
import { getEligiblePersonalQuestHeroes,isQuestAvailableForGuild } from "../src/game/quests/questAvailability";
import { createWorldState } from "../src/game/world/worldState";
import { testHero } from "./testHero";

describe("named elites and hero personal quests",()=>{
 it("adds five named elites to playable roguelite encounters",()=>{const ids=["ruk_one_eye","pale_widow","hadrik_bonecaller","mara_half_coin","drogan_ash_tusk"];expect(ids.every((id)=>ENEMIES[id]?.role==="elite"&&Boolean(ENEMIES[id]?.portraitSourceId))).toBe(true);const encountered=new Set(Object.values(ROGUELITE_ENCOUNTERS).flatMap((encounter)=>encounter.enemies.map((group)=>group.enemyDefinitionId)));expect(ids.every((id)=>encountered.has(id))).toBe(true);});
 it("only reveals a personal quest when a matching hero is present",()=>{const quest=HERO_PERSONAL_QUESTS.library_with_teeth;const world=createWorldState();world.unlockedRegionIds.push("shadowfen");const wrong={...testHero(),raceId:"human" as const,classId:"warrior" as const,backgroundId:"farmhand" as const,level:6};const right={...testHero(),id:"eligible-elf",raceId:"elf" as const,classId:"mage" as const,backgroundId:"scholar" as const,level:4};expect(isQuestAvailableForGuild(quest,world,[wrong])).toBe(false);expect(isQuestAvailableForGuild(quest,world,[right])).toBe(true);expect(getEligiblePersonalQuestHeroes(quest,[wrong,right]).map((hero)=>hero.id)).toEqual([right.id]);});
 it("provides five non-repeatable authored personal stories",()=>{expect(Object.values(HERO_PERSONAL_QUESTS)).toHaveLength(5);expect(Object.values(HERO_PERSONAL_QUESTS).every((quest)=>quest.questType==="side"&&!quest.repeatable&&Boolean(quest.storyContext)&&Boolean(quest.personalHeroRequirement))).toBe(true);});
});
