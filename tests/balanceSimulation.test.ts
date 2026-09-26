import { describe, expect, it } from "vitest";
import { createSimulationParty, simulateCombatScenario, simulateEconomyScenario } from "../src/game/simulation/balanceSimulation";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { calculateHero } from "../src/game/heroes/heroCalculator";

describe("repeatable balance simulations", () => {
  it("builds requested classes at full leveled HP with deliberately lagged basic gear", () => {
    const party = createSimulationParty(["warrior", "ranger", "mage", "cleric"], 6, 4400, "lagged_basic");
    expect(party.map((hero) => hero.classId)).toEqual(["warrior", "ranger", "mage", "cleric"]);
    for (const hero of party) {
      expect(hero.currentHP).toBe(calculateHero(hero).stats.maxHP);
      const equipped = Object.values(hero.equipment).filter((id): id is string => Boolean(id)).map((id) => EQUIPMENT[id]!);
      expect(equipped.length).toBeGreaterThanOrEqual(4);
      expect(equipped.every((item) => item.rarity === "common" || item.rarity === "uncommon")).toBe(true);
      for (const item of equipped) {
        const target = item.slot === "weapon" || item.slot === "armor" ? hero.level - 2 : hero.level - 3;
        expect(item.levelRequirement).toBeLessThanOrEqual(Math.max(1, target));
      }
    }
  });

  it("reports early-campaign combat across every difficulty", () => {
    const brambleway = simulateCombatScenario({ id: "brambleway-standard", questId: "brambleway_road_ambush", heroLevel: 2, partyClasses: ["warrior", "ranger", "cleric"], difficultyId: "standard", runs: 8, seed: 4050 });
    expect(brambleway.stalled).toBe(0);
    expect(brambleway.winRate).toBeGreaterThan(0);
    const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) => simulateCombatScenario({ id: `chieftain-${difficultyId}`, questId: "goblin_chieftain_boss", heroLevel: 2, partyClasses: ["warrior", "ranger", "cleric", "mage"], difficultyId, runs: 12, seed: 4100 }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results[0]!.averageRemainingHpRatioOnWins).toBeGreaterThan(results[2]!.averageRemainingHpRatioOnWins);
    expect(results[0]!.averageRemainingHpRatioOnWins).toBeLessThan(.93);
    expect(results[2]!.averageSurvivingHeroes).toBeLessThan(3.5);
    expect(results[2]!.averageRemainingHpRatioOnWins).toBeLessThan(.85);
  }, 150_000);

  it("reports representative campaign fights", () => {
    const scenarios = [
      { id: "chapter1-patrol", questId: "goblin_patrol", heroLevel: 1, partyClasses: ["warrior", "cleric"] as const, difficultyId: "standard" as const, runs: 12, seed: 5000 },
      { id: "chapter2-broken-carts", questId: "road_of_broken_carts", heroLevel: 3, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 5800 },
      { id: "chapter2-flintwatch", questId: "fires_of_flintwatch", heroLevel: 4, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 5900 },
      { id: "chapter2-chainbreaker-l4", questId: "ghorak_chainbreaker_boss", heroLevel: 4, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6000 },
      { id: "chapter2-chainbreaker-l5", questId: "ghorak_chainbreaker_boss", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6100 },
      { id: "chapter2-hollow-warden", questId: "hollow_warden_boss", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6200 },
      { id: "chapter3-frozen-names", questId: "road_of_frozen_names", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6600, gearProfile: "lagged_basic" as const },
      { id: "chapter3-blue-horns", questId: "night_of_blue_horns", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6700, gearProfile: "lagged_basic" as const },
      { id: "chapter3-hroth", questId: "hroth_iceblood_boss", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6800, gearProfile: "lagged_basic" as const },
      { id: "chapter3-glimmerlake-underlevel", questId: "beneath_glimmerlake", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6900, gearProfile: "lagged_basic" as const },
      { id: "chapter3-glimmerlake", questId: "beneath_glimmerlake", heroLevel: 6, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6950, gearProfile: "lagged_basic" as const },
      { id: "chapter3-vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 7000, gearProfile: "lagged_basic" as const },
    ];
    const results = scenarios.map(simulateCombatScenario); console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    const byId = new Map(results.map((result) => [result.scenarioId, result]));
    expect(byId.get("chapter2-broken-carts")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter2-flintwatch")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter2-chainbreaker-l4")!.winRate).toBeGreaterThanOrEqual(.60);
    expect(byId.get("chapter2-hollow-warden")!.winRate).toBeGreaterThanOrEqual(.50);
    expect(byId.get("chapter2-hollow-warden")!.averageSurvivingHeroes).toBeLessThan(3);
    expect(byId.get("chapter3-frozen-names")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter3-blue-horns")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter3-blue-horns")!.averageSurvivingHeroes).toBeLessThan(3);
    expect(byId.get("chapter3-hroth")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter3-glimmerlake")!.winRate).toBeGreaterThan(byId.get("chapter3-glimmerlake-underlevel")!.winRate);
    expect(byId.get("chapter3-glimmerlake")!.averageSurvivingHeroes).toBeGreaterThan(2);
    expect(byId.get("chapter3-glimmerlake-underlevel")!.averageSurvivingHeroes).toBeLessThan(2.5);
    expect(byId.get("chapter3-vaelith")!.averageSurvivingHeroes).toBeGreaterThan(3);
  }, 120_000);

  it("compares intended-level Frostmarch bosses across difficulty with lagged basic gear", () => {
    const encounters = [
      { id: "hroth", questId: "hroth_iceblood_boss", heroLevel: 5, seed: 7200 },
      { id: "glimmerlake", questId: "beneath_glimmerlake", heroLevel: 6, seed: 7300 },
      { id: "vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, seed: 7400 },
    ] as const;
    const results = encounters.flatMap((encounter) => (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
      simulateCombatScenario({
        id: `chapter3-${encounter.id}-${difficultyId}`,
        questId: encounter.questId,
        heroLevel: encounter.heroLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId,
        runs: 4,
        seed: encounter.seed,
        gearProfile: "lagged_basic",
      }),
    ));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    for (const encounter of encounters) {
      const standard = results.find((result) => result.scenarioId === `chapter3-${encounter.id}-standard`)!;
      const veteran = results.find((result) => result.scenarioId === `chapter3-${encounter.id}-veteran`)!;
      const iron = results.find((result) => result.scenarioId === `chapter3-${encounter.id}-iron_guild`)!;
      expect(standard.winRate).toBeGreaterThanOrEqual(veteran.winRate);
      expect(veteran.winRate).toBeGreaterThanOrEqual(iron.winRate);
      expect(standard.averageRemainingHpRatioOnWins).toBeGreaterThanOrEqual(iron.averageRemainingHpRatioOnWins);
    }
    const vaelithStandard = results.find((result) => result.scenarioId === "chapter3-vaelith-standard")!;
    const vaelithVeteran = results.find((result) => result.scenarioId === "chapter3-vaelith-veteran")!;
    const vaelithIron = results.find((result) => result.scenarioId === "chapter3-vaelith-iron_guild")!;
    expect(vaelithStandard.winRate).toBeGreaterThanOrEqual(.75);
    expect(vaelithVeteran.winRate).toBeLessThan(1);
    expect(vaelithIron.winRate).toBeLessThanOrEqual(.50);
    expect(vaelithIron.averageSurvivingHeroes).toBeLessThan(2);
  }, 150_000);

  it("reports early, mid and late guild economies with production salaries", () => {
    const stages = [
      { id: "early", heroCount: 4, heroLevel: 2, questsPerWeek: 2, days: 28, questId: "goblin_patrol", fieldCost: 55, reserve: 720 },
      { id: "mid", heroCount: 6, heroLevel: 6, questsPerWeek: 3, days: 42, questId: "ghorak_chainbreaker_boss", fieldCost: 85, reserve: 1710 },
      { id: "late", heroCount: 8, heroLevel: 10, questsPerWeek: 4, days: 56, questId: "vaelith_pale_echo_boss", fieldCost: 120, reserve: 5200 },
    ] as const;
    const results = stages.flatMap((stage, stageIndex) => (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
      simulateEconomyScenario({
        id: `${stage.id}-${difficultyId}`,
        questId: stage.questId,
        difficultyId,
        heroCount: stage.heroCount,
        heroLevel: stage.heroLevel,
        questsPerWeek: stage.questsPerWeek,
        days: stage.days,
        travelGoldCostPerQuest: Math.round(stage.fieldCost * .30),
        healingGoldCostPerQuest: Math.round(stage.fieldCost * .40),
        repairGoldCostPerQuest: Math.round(stage.fieldCost * .10),
        rationGoldCostPerQuest: stage.fieldCost - Math.round(stage.fieldCost * .30) - Math.round(stage.fieldCost * .40) - Math.round(stage.fieldCost * .10),
        facilityReserve: stage.reserve,
        seed: 9100 + stageIndex * 100,
      })));
    console.table(results);
    expect(results.every((result) => Number.isFinite(result.breakEvenQuestsPerWeek))).toBe(true);
    expect(results.filter((result) => result.scenarioId.startsWith("early-standard")).every((result) => result.arrears === 0)).toBe(true);
    expect(results.filter((result) => result.scenarioId.startsWith("mid-standard")).every((result) => result.arrears === 0)).toBe(true);
    expect(results.filter((result) => result.scenarioId.startsWith("late-standard")).every((result) => result.arrears === 0)).toBe(true);
  });

  it("reports 28-day guild cash flow at multiple activity levels", () => {
    const results = (["standard", "veteran", "iron_guild"] as const).flatMap((difficultyId) => [1, 2, 3].map((questsPerWeek) => simulateEconomyScenario({ id: `${difficultyId}-${questsPerWeek}qpw`, questId: "goblin_patrol", difficultyId, heroCount: 4, heroLevel: 1, questsPerWeek, days: 28, travelGoldCostPerQuest: 20, healingGoldCostPerQuest: 20, repairGoldCostPerQuest: 5, rationGoldCostPerQuest: 10, facilityReserve: 720, seed: 8100 + questsPerWeek })));
    console.table(results);
    expect(results.every((result) => Number.isFinite(result.breakEvenQuestsPerWeek))).toBe(true);
    expect(results.filter((result) => result.scenarioId.endsWith("3qpw")).every((result) => result.arrears === 0)).toBe(true);
    expect(results.every((result) => result.goldAfterFacilityReserve > 0)).toBe(true);
  });
});
