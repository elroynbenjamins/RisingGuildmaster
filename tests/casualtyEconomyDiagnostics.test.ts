import { describe, it } from "vitest";
import { TEMPLE_CONFIG } from "../src/config/templeConfig";
import { QUESTS } from "../src/data/quests/quests";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { createEquipmentKeyWithDurability } from "../src/game/equipment/equipmentResolver";
import { getRepairCost } from "../src/game/equipment/equipmentDurabilityService";
import { createSimulationParty, simulateCombatScenario, type SimulationGearProfile } from "../src/game/simulation/balanceSimulation";
import { calculateWeeklySalary } from "../src/game/recruitment/recruitmentCostCalculator";
import { GAME_CONFIG } from "../src/config/gameConfig";

const classes = ["warrior", "ranger", "cleric", "mage"] as const;

function expectedRepairPerFall(level: number, seed: number, gearProfile: SimulationGearProfile): number {
  const party = createSimulationParty(classes, level, seed, gearProfile, "subclass_ready");
  const perHero = party.map((hero) => {
    const keys = Object.values(hero.equipment).filter((key): key is string => Boolean(key));
    if (!keys.length) return 0;
    const expectedDamagedRepair = keys.reduce((sum, key) => {
      let repairSum = 0;
      for (let lost = 10; lost <= 20; lost += 1) {
        repairSum += getRepairCost(createEquipmentKeyWithDurability(key, 100 - lost));
      }
      return sum + repairSum / 11;
    }, 0) / keys.length;
    return .35 * expectedDamagedRepair;
  });
  return perHero.reduce((sum, value) => sum + value, 0) / perHero.length;
}

function averageMaxHp(level: number, seed: number, gearProfile: SimulationGearProfile): number {
  const party = createSimulationParty(classes, level, seed, gearProfile, "subclass_ready");
  return party.reduce((sum, hero) => sum + calculateHero(hero).stats.maxHP, 0) / party.length;
}

describe("casualty economy diagnostics", () => {
  it("compares Chapter 4-9 immediate reset burden with mission gold", () => {
    const scenarios = [
      { id: "ch4-morrowveil", questId: "morrowveil_drowned_archivist_boss", level: 7, seed: 8540, gearProfile: "lagged_basic" as const },
      { id: "ch5-road", questId: "road_of_glass", level: 8, seed: 8800, gearProfile: "optional_progression" as const },
      { id: "ch6-laurel", questId: "laurel_law", level: 10, seed: 8810, gearProfile: "optional_progression" as const },
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", level: 13, seed: 8910, gearProfile: "optional_progression" as const },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", level: 15, seed: 8930, gearProfile: "optional_progression" as const },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", level: 17, seed: 8950, gearProfile: "optional_progression" as const },
    ];

    const rows = scenarios.map((scenario) => {
      const result = simulateCombatScenario({
        id: scenario.id,
        questId: scenario.questId,
        heroLevel: scenario.level,
        partyClasses: classes,
        difficultyId: "standard",
        runs: 6,
        seed: scenario.seed,
        gearProfile: scenario.gearProfile,
        progressionProfile: "subclass_ready",
      });
      const quest = QUESTS[scenario.questId]!;
      const avgGoldOnWin = (quest.goldRewardMin + quest.goldRewardMax) / 2;
      const avgHp = averageMaxHp(scenario.level, scenario.seed, scenario.gearProfile);
      const repairPerFall = expectedRepairPerFall(scenario.level, scenario.seed, scenario.gearProfile);
      const fullTreatmentPerFall = Math.ceil(avgHp * (1 - TEMPLE_CONFIG.revivedHpRatio) * TEMPLE_CONFIG.goldPerMissingHp)
        + TEMPLE_CONFIG.conditionTreatmentCosts.injured;
      const winFallCost = result.averageFallenHeroesOnWins * (fullTreatmentPerFall + repairPerFall);
      const survivorHealingPerWin = result.averageSurvivingHeroes
        * avgHp
        * (1 - result.averageRemainingHpRatioOnWins)
        * TEMPLE_CONFIG.goldPerMissingHp;
      const expectedLossFallCost = result.wipeRate * 4 * (fullTreatmentPerFall + repairPerFall);
      const expectedRecoveryGoldPerAttempt = result.winRate * (winFallCost + survivorHealingPerWin) + expectedLossFallCost;
      const expectedQuestGoldPerAttempt = result.winRate * avgGoldOnWin;
      const expectedFallsPerAttempt = result.winRate * result.averageFallenHeroesOnWins + result.wipeRate * 4;
      return {
        chapterMission: scenario.id,
        winRate: Number(result.winRate.toFixed(2)),
        fallsPerWin: Number(result.averageFallenHeroesOnWins.toFixed(2)),
        wipeRate: Number(result.wipeRate.toFixed(2)),
        avgMaxHp: Math.round(avgHp),
        avgGoldOnWin: Math.round(avgGoldOnWin),
        expectedRecoveryGoldPerAttempt: Math.round(expectedRecoveryGoldPerAttempt),
        expectedQuestGoldPerAttempt: Math.round(expectedQuestGoldPerAttempt),
        recoveryShareOfExpectedQuestGold: Number((expectedRecoveryGoldPerAttempt / Math.max(1, expectedQuestGoldPerAttempt)).toFixed(2)),
        expectedFallsPerAttempt: Number(expectedFallsPerAttempt.toFixed(2)),
        gemsIfNeverUsingAdsOrFreeRevives: Number((expectedFallsPerAttempt * TEMPLE_CONFIG.revivalGemCost).toFixed(1)),
        rewardedReviveAdsNeeded: Number(expectedFallsPerAttempt.toFixed(2)),
        expectedRepairGoldPerFall: Math.round(repairPerFall),
        fullTreatmentGoldPerFall: Math.round(fullTreatmentPerFall),
      };
    });

    console.table(rows);

    const weeklyRows = rows.map((row, index) => {
      const scenario = scenarios[index]!;
      const heroCount = scenario.level >= 13 ? 8 : 6;
      const rosterClasses = Array.from({ length: heroCount }, (_, heroIndex) => classes[heroIndex % classes.length]!);
      const roster = createSimulationParty(rosterClasses, scenario.level, scenario.seed + 500, scenario.gearProfile, "subclass_ready");
      const weeklyPayroll = roster.reduce((sum, hero) => sum + calculateWeeklySalary(hero), 0);
      const questsPerWeek = scenario.level >= 13 ? 4 : 3;
      const weeklyQuestNet = questsPerWeek * (row.expectedQuestGoldPerAttempt - row.expectedRecoveryGoldPerAttempt);
      const weeklyTavernIncome = GAME_CONFIG.dailyTavernIncome * 7;
      return {
        chapterMission: row.chapterMission,
        heroCount,
        questsPerWeek,
        weeklyPayroll,
        weeklyTavernIncome,
        weeklyQuestNet: Math.round(weeklyQuestNet),
        weeklyBalanceAfterRecoveryAndPayroll: Math.round(weeklyQuestNet + weeklyTavernIncome - weeklyPayroll),
      };
    });
    console.log("CASUALTY_WEEKLY_ECONOMY");
    console.table(weeklyRows);
  }, 240_000);
});
