import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const party = ["warrior","ranger","cleric","mage"] as const;

describe("prepared mastery simulation diagnostics",()=>{
  it("compares mastery-ready pressure at the sensitive benchmarks",()=>{
    const cases=[
      {id:"laurel-standard",questId:"laurel_law",level:10,seed:8810,difficultyId:"standard" as const,runs:3},
      {id:"nhal-standard",questId:"admiral_nhal_veyr_boss",level:15,seed:8930,difficultyId:"standard" as const,runs:3},
      {id:"serekh-standard",questId:"serekh_chartmaker_boss",level:17,seed:8950,difficultyId:"standard" as const,runs:3},
      {id:"serekh-hard",questId:"serekh_chartmaker_boss",level:17,seed:8975,difficultyId:"veteran" as const,runs:3},
      {id:"serekh-iron",questId:"serekh_chartmaker_boss",level:17,seed:8975,difficultyId:"iron_guild" as const,runs:2},
    ] as const;
    const rows=[];
    for(const entry of cases){
      for(const progressionProfile of ["subclass_ready","mastery_ready"] as const){
        const result=simulateCombatScenario({
          id:`${entry.id}-${progressionProfile}`,
          questId:entry.questId,
          heroLevel:entry.level,
          partyClasses:party,
          difficultyId:entry.difficultyId,
          runs:entry.runs,
          seed:entry.seed,
          gearProfile:"optional_progression",
          progressionProfile,
        });
        rows.push({
          scenario:entry.id,progressionProfile,
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
  },240_000);
});
