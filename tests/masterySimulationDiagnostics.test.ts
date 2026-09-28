import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const party = ["warrior","ranger","cleric","mage"] as const;

describe("prepared mastery simulation diagnostics",()=>{
  it("compares subclass-only and mastery-ready prepared parties",()=>{
    const scenarios=[
      {id:"laurel",questId:"laurel_law",level:10,seed:8810},
      {id:"varkesh",questId:"varkesh_gilded_rupture_boss",level:13,seed:8910},
      {id:"nhal",questId:"admiral_nhal_veyr_boss",level:15,seed:8930},
      {id:"serekh",questId:"serekh_chartmaker_boss",level:17,seed:8950},
    ] as const;
    const rows=[];
    for(const scenario of scenarios){
      for(const progressionProfile of ["subclass_ready","mastery_ready"] as const){
        const result=simulateCombatScenario({
          id:`${scenario.id}-${progressionProfile}`,
          questId:scenario.questId,
          heroLevel:scenario.level,
          partyClasses:party,
          difficultyId:"standard",
          runs:6,
          seed:scenario.seed,
          gearProfile:"optional_progression",
          progressionProfile,
        });
        rows.push({
          scenario:scenario.id,progressionProfile,
          winRate:result.winRate,
          survivors:result.averageSurvivingHeroes,
          fallenOnWins:result.averageFallenHeroesOnWins,
          anyFallRate:result.victoriesWithAnyFallRate,
          hpRatio:result.averageRemainingHpRatioOnWins,
        });
      }
    }
    for(const difficultyId of ["veteran","iron_guild"] as const){
      for(const progressionProfile of ["subclass_ready","mastery_ready"] as const){
        const result=simulateCombatScenario({
          id:`serekh-${difficultyId}-${progressionProfile}`,
          questId:"serekh_chartmaker_boss",
          heroLevel:17,
          partyClasses:party,
          difficultyId,
          runs:4,
          seed:8975,
          gearProfile:"optional_progression",
          progressionProfile,
        });
        rows.push({
          scenario:`serekh-${difficultyId}`,progressionProfile,
          winRate:result.winRate,
          survivors:result.averageSurvivingHeroes,
          fallenOnWins:result.averageFallenHeroesOnWins,
          anyFallRate:result.victoriesWithAnyFallRate,
          hpRatio:result.averageRemainingHpRatioOnWins,
        });
      }
    }
    console.log("MASTERY_PREPARED_COMPARISON");
    console.table(rows);
  },300_000);
});
