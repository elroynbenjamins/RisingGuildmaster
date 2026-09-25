import { describe, expect, it } from "vitest";
import { createSimulationParty, simulateCombatScenario, simulateEconomyScenario } from "../src/game/simulation/balanceSimulation";
import { EQUIPMENT } from "../src/data/equipment/equipment";

describe("repeatable balance simulations", () => {
  it("uses conservative under-levelled basic gear instead of naked heroes", () => {
    const geared = createSimulationParty(["warrior", "ranger", "mage", "cleric"], 6, 3900, "basic");
    for (const hero of geared) {
      for (const slot of ["weapon", "armor", "helmet", "boots"] as const) {
        const id = hero.equipment[slot];
        expect(id).toBeTruthy();
        const item = EQUIPMENT[id!]!;
        expect(item.levelRequirement).toBeLessThanOrEqual(4);
        expect(["common", "uncommon"]).toContain(item.rarity);
        expect(item.specialEffectIds).toHaveLength(0);
      }
      expect(hero.equipment.accessory1).toBeNull();
      expect(hero.equipment.accessory2).toBeNull();
    }
  });

  it("shows realistic gear improves intended-level Frostmarch without assuming best-in-slot", () => {
    const base = { questId: "beneath_glimmerlake", heroLevel: 6, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6950 };
    const naked = simulateCombatScenario({ ...base, id: "glimmerlake-l6-naked", gearProfile: "none" });
    const basic = simulateCombatScenario({ ...base, id: "glimmerlake-l6-basic", gearProfile: "basic" });
    console.table([naked, basic]);
    expect(basic.winRate).toBeGreaterThanOrEqual(naked.winRate);
    expect(basic.winRate).toBeGreaterThan(0);
  }, 120_000);

  it("reports early-campaign combat across every difficulty", () => {
    const brambleway = simulateCombatScenario({ id: "brambleway-standard", questId: "brambleway_road_ambush", heroLevel: 2, partyClasses: ["warrior", "ranger", "cleric"], difficultyId: "standard", runs: 8, seed: 4050 });
    expect(brambleway.stalled).toBe(0);
    expect(brambleway.winRate).toBeGreaterThan(0);
    const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) => simulateCombatScenario({ id: `chieftain-${difficultyId}`, questId: "goblin_chieftain_boss", heroLevel: 2, partyClasses: ["warrior", "ranger", "cleric", "mage"], difficultyId, runs: 12, seed: 4100 }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results[0]!.averageRemainingHpRatioOnWins).toBeGreaterThan(results[2]!.averageRemainingHpRatioOnWins);
    expect(results[0]!.averageRemainingHpRatioOnWins).toBeLessThan(.90);
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
      { id: "chapter3-frozen-names", questId: "road_of_frozen_names", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 6, seed: 6600 },
      { id: "chapter3-blue-horns", questId: "night_of_blue_horns", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 6, seed: 6700 },
      { id: "chapter3-hroth", questId: "hroth_iceblood_boss", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 6, seed: 6800 },
      { id: "chapter3-glimmerlake", questId: "beneath_glimmerlake", heroLevel: 6, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 6, seed: 6900 },
      { id: "chapter3-vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 7000 },
    ];
    const results = scenarios.map(simulateCombatScenario); console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    const byId = new Map(results.map((result) => [result.scenarioId, result]));
    expect(byId.get("chapter2-broken-carts")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter2-flintwatch")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter2-chainbreaker-l4")!.winRate).toBeGreaterThanOrEqual(.60);
    expect(byId.get("chapter2-hollow-warden")!.winRate).toBeGreaterThanOrEqual(.25);
    expect(byId.get("chapter2-hollow-warden")!.winRate).toBeLessThanOrEqual(.75);
    expect(byId.get("chapter3-frozen-names")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter3-blue-horns")!.winRate).toBeGreaterThan(0);
    expect(byId.get("chapter3-blue-horns")!.winRate).toBeLessThanOrEqual(1);
    expect(byId.get("chapter3-hroth")!.winRate).toBeGreaterThanOrEqual(.50);
  }, 120_000);

  it("reports a realistic partially geared Chapter-3 progression party", () => {
    const scenarios = [
      { id: "realistic-blue-horns", questId: "night_of_blue_horns", heroLevel: 5, seed: 6725 },
      { id: "realistic-hroth", questId: "hroth_iceblood_boss", heroLevel: 5, seed: 6825 },
      { id: "realistic-glimmerlake", questId: "beneath_glimmerlake", heroLevel: 6, seed: 6975 },
      { id: "realistic-vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, seed: 7025 },
    ].map((entry) => simulateCombatScenario({
      ...entry,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 8,
      gearProfile: "basic",
    }));
    console.table(scenarios);
    expect(scenarios.every((result) => result.stalled === 0)).toBe(true);
    expect(scenarios.every((result) => result.winRate > 0)).toBe(true);
    expect(scenarios.find((result) => result.scenarioId === "realistic-glimmerlake")!.winRate).toBeLessThan(1);
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
