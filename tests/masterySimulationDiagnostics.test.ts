import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const party = ["warrior","ranger","cleric","mage"] as const;

describe("prepared mastery simulation diagnostics",()=>{
  it("compares both mastery paths against Serekh pressure",()=>{
    const cases=[
      {id:"serekh-standard",difficultyId:"standard" as const,runs:4,seed:8950},
      {id:"serekh-hard",difficultyId:"veteran" as const,runs:4,seed:8975},
      {id:"serekh-iron",difficultyId:"iron_guild" as const,runs:3,seed:8975},
    ] as const;
    const rows=[];
    for(const entry of cases){
      for(const progressionProfile of ["subclass_ready","mastery_ready","mastery_alt_ready"] as const){
        const result=simulateCombatScenario({
          id:`${entry.id}-${progressionProfile}`,
          questId:"serekh_chartmaker_boss",
          heroLevel:17,
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
    console.log("MASTERY_PATH_COMPARISON");
    console.table(rows);
  },240_000);
});
