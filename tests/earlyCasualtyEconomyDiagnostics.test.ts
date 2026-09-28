import { describe, it } from "vitest";
import { GAME_CONFIG } from "../src/config/gameConfig";
import { TEMPLE_CONFIG } from "../src/config/templeConfig";
import { QUESTS } from "../src/data/quests/quests";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { createEquipmentKeyWithDurability } from "../src/game/equipment/equipmentResolver";
import { getRepairCost } from "../src/game/equipment/equipmentDurabilityService";
import { createSimulationParty, simulateCombatScenario, type SimulationGearProfile } from "../src/game/simulation/balanceSimulation";

const classes = ["warrior", "ranger", "cleric", "mage"] as const;

function expectedRepairPerFall(level: number, seed: number, gearProfile: SimulationGearProfile): number {
  const party = createSimulationParty(classes, level, seed, gearProfile, level >= 5 ? "subclass_ready" : "base");
  const perHero = party.map((hero) => {
    const keys = Object.values(hero.equipment).filter((key): key is string => Boolean(key));
    if (!keys.length) return 0;
    const meanRepairWhenDamaged = keys.reduce((sum, key) => {
      let lossAverage = 0;
      for (let lost = 10; lost <= 20; lost += 1) lossAverage += getRepairCost(createEquipmentKeyWithDurability(key, 100 - lost));
      return sum + lossAverage / 11;
    }, 0) / keys.length;
    return .35 * meanRepairWhenDamaged;
  });
  return perHero.reduce((sum, value) => sum + value, 0) / perHero.length;
}

function averageMaxHp(level: number, seed: number, gearProfile: SimulationGearProfile): number {
  const party = createSimulationParty(classes, level, seed, gearProfile, level >= 5 ? "subclass_ready" : "base");
  return party.reduce((sum, hero) => sum + calculateHero(hero).stats.maxHP, 0) / party.length;
}

describe("early casualty economy diagnostics", () => {
  it("checks Chapter 1-3 casualty recovery against early reserves and quest income", () => {
    const scenarios = [
      { id: "ch1-chieftain", questId: "goblin_chieftain_boss", level: 2, seed: 4100, gearProfile: "starter" as const, runs: 12 },
      { id: "ch2-chainbreaker", questId: "ghorak_chainbreaker_boss", level: 4, seed: 6000, gearProfile: "lagged_basic" as const, runs: 8 },
      { id: "ch2-hollow-warden", questId: "hollow_warden_boss", level: 5, seed: 6200, gearProfile: "lagged_basic" as const, runs: 8 },
      { id: "ch3-hroth", questId: "hroth_iceblood_boss", level: 5, seed: 6800, gearProfile: "lagged_basic" as const, runs: 8 },
      { id: "ch3-vaelith", questId: "vaelith_pale_echo_boss", level: 6, seed: 7000, gearProfile: "lagged_basic" as const, runs: 8 },
    ];

    const rows = scenarios.map((scenario) => {
      const result = simulateCombatScenario({
        id: scenario.id,
        questId: scenario.questId,
        heroLevel: scenario.level,
        partyClasses: classes,
        difficultyId: "standard",
        runs: scenario.runs,
        seed: scenario.seed,
        gearProfile: scenario.gearProfile,
        progressionProfile: scenario.level >= 5 ? "subclass_ready" : "base",
      });
      const quest = QUESTS[scenario.questId]!;
      const avgGoldOnWin = (quest.goldRewardMin + quest.goldRewardMax) / 2;
      const avgHp = averageMaxHp(scenario.level, scenario.seed, scenario.gearProfile);
      const repairPerFall = expectedRepairPerFall(scenario.level, scenario.seed, scenario.gearProfile);
      const treatmentPerFall = Math.ceil(avgHp * (1 - TEMPLE_CONFIG.revivedHpRatio) * TEMPLE_CONFIG.goldPerMissingHp) + TEMPLE_CONFIG.conditionTreatmentCosts.injured;
      const winFallCost = result.averageFallenHeroesOnWins * (treatmentPerFall + repairPerFall);
      const survivorHealing = result.averageSurvivingHeroes * avgHp * (1 - result.averageRemainingHpRatioOnWins) * TEMPLE_CONFIG.goldPerMissingHp;
      const lossCost = result.wipeRate * 4 * (treatmentPerFall + repairPerFall);
      const expectedRecovery = result.winRate * (winFallCost + survivorHealing) + lossCost;
      const expectedQuestGold = result.winRate * avgGoldOnWin;
      const expectedFalls = result.winRate * result.averageFallenHeroesOnWins + result.wipeRate * 4;
      return {
        mission: scenario.id,
        winRate: Number(result.winRate.toFixed(2)),
        fallsPerWin: Number(result.averageFallenHeroesOnWins.toFixed(2)),
        wipeRate: Number(result.wipeRate.toFixed(2)),
        avgGoldOnWin: Math.round(avgGoldOnWin),
        expectedRecoveryGold: Math.round(expectedRecovery),
        recoveryShare: Number((expectedRecovery / Math.max(1, expectedQuestGold)).toFixed(2)),
        expectedFalls: Number(expectedFalls.toFixed(2)),
        gemsIfNoAds: Number((expectedFalls * TEMPLE_CONFIG.revivalGemCost).toFixed(1)),
        startingGemCoverage: Number((GAME_CONFIG.startingGems / TEMPLE_CONFIG.revivalGemCost).toFixed(1)),
        dailyLoginReviveCoverage: 2,
        fullTreatmentPerFall: Math.round(treatmentPerFall),
        expectedRepairPerFall: Math.round(repairPerFall),
      };
    });
    console.table(rows);
  }, 180_000);
});
