import { describe, expect, it } from "vitest";
import { createSimulationParty, simulateCombatScenario, simulateEconomyScenario } from "../src/game/simulation/balanceSimulation";
import { calculateWeeklySalary } from "../src/game/recruitment/recruitmentCostCalculator";

describe("repeatable balance simulations", () => {
  it("reports early-campaign combat across every difficulty", () => {
    const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) => simulateCombatScenario({ id: `chieftain-${difficultyId}`, questId: "goblin_chieftain_boss", heroLevel: 2, partyClasses: ["warrior", "ranger", "cleric", "mage"], difficultyId, runs: 12, seed: 4100 }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results[0]!.averageRemainingHpRatioOnWins).toBeGreaterThan(results[2]!.averageRemainingHpRatioOnWins);
    expect(results[0]!.averageRemainingHpRatioOnWins).toBeLessThan(.90);
    expect(results[2]!.averageSurvivingHeroes).toBeLessThan(3.5);
    expect(results[2]!.averageRemainingHpRatioOnWins).toBeLessThan(.85);
  }, 90_000);

  it("reports representative campaign fights", () => {
    const scenarios = [
      { id: "chapter1-patrol", questId: "goblin_patrol", heroLevel: 1, partyClasses: ["warrior", "cleric"] as const, difficultyId: "standard" as const, runs: 12, seed: 5000 },
      { id: "chapter2-chainbreaker", questId: "ghorak_chainbreaker_boss", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 10, seed: 6000 },
      { id: "chapter3-vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 7000 },
    ];
    const results = scenarios.map(simulateCombatScenario); console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 30_000);

  it("reports 28-day guild cash flow at multiple activity levels", () => {
    const salaryParty = createSimulationParty(["warrior", "ranger", "mage", "cleric"], 1, 8100);
    const representativeSalary = Math.round(salaryParty.reduce((sum, hero) => sum + calculateWeeklySalary(hero), 0) / salaryParty.length);
    const results = (["standard", "veteran", "iron_guild"] as const).flatMap((difficultyId) => [1, 2, 3].map((questsPerWeek) => simulateEconomyScenario({ id: `${difficultyId}-${questsPerWeek}qpw`, questId: "goblin_patrol", difficultyId, heroCount: 4, weeklySalaryPerHero: representativeSalary, questsPerWeek, days: 28, travelGoldCostPerQuest: 20, healingGoldCostPerQuest: 20, repairGoldCostPerQuest: 5, rationGoldCostPerQuest: 10, facilityReserve: 720, seed: 8100 + questsPerWeek })));
    console.table(results);
    expect(results.every((result) => Number.isFinite(result.breakEvenQuestsPerWeek))).toBe(true);
    expect(results.filter((result) => result.scenarioId.endsWith("3qpw")).every((result) => result.arrears === 0)).toBe(true);
    expect(results.every((result) => result.goldAfterFacilityReserve > 0)).toBe(true);
  });
});
