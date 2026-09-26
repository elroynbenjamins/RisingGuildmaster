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

  it("builds a realistic late-campaign profile with useful but slightly lagged story gear", () => {
    const party = createSimulationParty(["warrior", "ranger", "mage", "cleric"], 12, 4425, "campaign_lagged", "subclass_ready");
    for (const hero of party) {
      expect(hero.currentHP).toBe(calculateHero(hero).stats.maxHP);
      const equipped = Object.values(hero.equipment).filter((id): id is string => Boolean(id)).map((id) => EQUIPMENT[id]!);
      expect(equipped.length).toBeGreaterThanOrEqual(4);
      expect(equipped.every((item) => item.rarity !== "legendary")).toBe(true);
      expect(equipped.some((item) => item.levelRequirement >= 7)).toBe(true);
      for (const item of equipped) {
        const target = item.slot === "weapon" || item.slot === "armor" ? hero.level - 1 : hero.level - 2;
        expect(item.levelRequirement).toBeLessThanOrEqual(Math.max(1, target));
      }
    }
  });

  it("adds representative Level-5 subclasses to the normal progression simulation profile", () => {
    const party = createSimulationParty(["warrior", "ranger", "mage", "cleric"], 6, 4450, "lagged_basic", "subclass_ready");
    expect(party.map((hero) => hero.subclassId)).toEqual(["guardian", "sharpshooter", "pyromancer", "life_priest"]);
    expect(party.every((hero) => hero.currentHP === calculateHero(hero).stats.maxHP)).toBe(true);
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
      { id: "chapter2-broken-carts", questId: "road_of_broken_carts", heroLevel: 3, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 5800, gearProfile: "lagged_basic" as const },
      { id: "chapter2-flintwatch", questId: "fires_of_flintwatch", heroLevel: 4, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 5900, gearProfile: "lagged_basic" as const },
      { id: "chapter2-chainbreaker-l4", questId: "ghorak_chainbreaker_boss", heroLevel: 4, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6000, gearProfile: "lagged_basic" as const },
      { id: "chapter2-chainbreaker-l5", questId: "ghorak_chainbreaker_boss", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6100, gearProfile: "lagged_basic" as const },
      { id: "chapter2-hollow-warden", questId: "hollow_warden_boss", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6200, gearProfile: "lagged_basic" as const },
      { id: "chapter3-frozen-names", questId: "road_of_frozen_names", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6600, gearProfile: "lagged_basic" as const },
      { id: "chapter3-blue-horns", questId: "night_of_blue_horns", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6700, gearProfile: "lagged_basic" as const },
      { id: "chapter3-hroth", questId: "hroth_iceblood_boss", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6800, gearProfile: "lagged_basic" as const },
      { id: "chapter3-glimmerlake-l5", questId: "beneath_glimmerlake", heroLevel: 5, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6900, gearProfile: "lagged_basic" as const },
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
    expect(byId.get("chapter3-glimmerlake-l5")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter3-glimmerlake")!.winRate).toBeGreaterThanOrEqual(byId.get("chapter3-glimmerlake-l5")!.winRate);
    expect(byId.get("chapter3-glimmerlake")!.averageSurvivingHeroes).toBeGreaterThan(byId.get("chapter3-glimmerlake-l5")!.averageSurvivingHeroes);
    expect(byId.get("chapter3-glimmerlake")!.averageRemainingHpRatioOnWins).toBeGreaterThan(byId.get("chapter3-glimmerlake-l5")!.averageRemainingHpRatioOnWins);
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
        runs: 8,
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
    const glimmerStandard = results.find((result) => result.scenarioId === "chapter3-glimmerlake-standard")!;
    const glimmerVeteran = results.find((result) => result.scenarioId === "chapter3-glimmerlake-veteran")!;
    const glimmerIron = results.find((result) => result.scenarioId === "chapter3-glimmerlake-iron_guild")!;
    expect(glimmerStandard.winRate).toBeGreaterThanOrEqual(.75);
    expect(glimmerVeteran.winRate).toBeGreaterThanOrEqual(.50);
    expect(glimmerIron.winRate).toBeLessThanOrEqual(.50);
    const vaelithStandard = results.find((result) => result.scenarioId === "chapter3-vaelith-standard")!;
    const vaelithVeteran = results.find((result) => result.scenarioId === "chapter3-vaelith-veteran")!;
    const vaelithIron = results.find((result) => result.scenarioId === "chapter3-vaelith-iron_guild")!;
    expect(vaelithStandard.winRate).toBeGreaterThanOrEqual(.75);
    expect(vaelithVeteran.winRate).toBeLessThan(1);
    expect(vaelithIron.winRate).toBeLessThanOrEqual(.50);
    expect(vaelithIron.averageSurvivingHeroes).toBeLessThan(2);
  }, 300_000);

  it("measures Frostmarch Standard with and without normal subclass progression", () => {
    const encounters = [
      { id: "hroth", questId: "hroth_iceblood_boss", heroLevel: 5, seed: 7600 },
      { id: "glimmerlake", questId: "beneath_glimmerlake", heroLevel: 6, seed: 7700 },
      { id: "vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, seed: 7800 },
    ] as const;
    const results = encounters.flatMap((encounter) => (["base", "subclass_ready"] as const).map((progressionProfile) =>
      simulateCombatScenario({
        id: `chapter3-${encounter.id}-${progressionProfile}`,
        questId: encounter.questId,
        heroLevel: encounter.heroLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 4,
        seed: encounter.seed,
        gearProfile: "lagged_basic",
        progressionProfile,
      }),
    ));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.filter((result) => result.scenarioId.endsWith("-subclass_ready")).every((result) => result.winRate > 0)).toBe(true);
  }, 150_000);

  it("isolates the Glimmerlake encounter causing the difficulty cliff", () => {
    const results = (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
      simulateCombatScenario({
        id: `chapter3-glimmerlake-hall-${difficultyId}`,
        questId: "beneath_glimmerlake",
        heroLevel: 6,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId,
        runs: 8,
        seed: 7350,
        gearProfile: "lagged_basic",
        encounterLimit: 1,
      }),
    );
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 120_000);

  it("checks Frostmarch Standard across several sensible party compositions", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "alternate-support", classes: ["paladin", "ranger", "bard", "mage"] as const },
      { id: "heavy-frontline", classes: ["warrior", "berserker", "cleric", "spellbow"] as const },
    ];
    const encounters = [
      { id: "hroth", questId: "hroth_iceblood_boss", heroLevel: 5, seed: 8200 },
      { id: "glimmerlake", questId: "beneath_glimmerlake", heroLevel: 6, seed: 8300 },
      { id: "vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, seed: 8400 },
    ] as const;
    const results = parties.flatMap((party, partyIndex) => encounters.map((encounter, encounterIndex) =>
      simulateCombatScenario({
        id: `chapter3-${party.id}-${encounter.id}`,
        questId: encounter.questId,
        heroLevel: encounter.heroLevel,
        partyClasses: party.classes,
        difficultyId: "standard",
        runs: 4,
        seed: encounter.seed + partyIndex * 100 + encounterIndex * 10,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      }),
    ));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    for (const party of parties) {
      const partyResults = results.filter((result) => result.scenarioId.includes(`-${party.id}-`));
      expect(partyResults.every((result) => result.winRate > 0)).toBe(true);
    }
  }, 180_000);

  it("checks Chapter 7 Iron Hills with realistic campaign-lagged gear at intended progression", () => {
    const scenarios = [
      { id: "road", questId: "road_above_the_clouds", heroLevel: 12, seed: 10100 },
      { id: "embassy", questId: "embassy_of_empty_armor", heroLevel: 12, seed: 10200 },
      { id: "siege", questId: "siege_of_skyvault", heroLevel: 12, seed: 10300 },
      { id: "severed", questId: "the_severed_voice", heroLevel: 13, seed: 10400 },
      { id: "varkesh-l12", questId: "varkesh_gilded_rupture_boss", heroLevel: 12, seed: 10500 },
      { id: "varkesh-l13", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 10600 },
    ] as const;
    const results = scenarios.flatMap((scenario) => (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
      simulateCombatScenario({
        id: `chapter7-${scenario.id}-${difficultyId}`,
        questId: scenario.questId,
        heroLevel: scenario.heroLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId,
        runs: 4,
        seed: scenario.seed,
        gearProfile: "campaign_lagged",
        progressionProfile: "subclass_ready",
      }),
    ));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    const standard = (id: string) => results.find((result) => result.scenarioId === `chapter7-${id}-standard`)!;
    expect(standard("road").winRate).toBeGreaterThanOrEqual(.75);
    expect(standard("embassy").winRate).toBeGreaterThanOrEqual(.75);
    expect(standard("siege").winRate).toBeGreaterThanOrEqual(.50);
    expect(standard("severed").winRate).toBeGreaterThanOrEqual(.75);
    expect(standard("varkesh-l13").winRate).toBeGreaterThanOrEqual(.50);
    expect(standard("varkesh-l13").averageSurvivingHeroes).toBeGreaterThan(1.5);
    expect(standard("varkesh-l13").winRate).toBeGreaterThanOrEqual(standard("varkesh-l12").winRate);

    for (const scenario of scenarios) {
      const standardResult = results.find((result) => result.scenarioId === `chapter7-${scenario.id}-standard`)!;
      const veteranResult = results.find((result) => result.scenarioId === `chapter7-${scenario.id}-veteran`)!;
      const ironResult = results.find((result) => result.scenarioId === `chapter7-${scenario.id}-iron_guild`)!;
      expect(standardResult.winRate).toBeGreaterThanOrEqual(veteranResult.winRate);
      expect(veteranResult.winRate).toBeGreaterThanOrEqual(ironResult.winRate);
    }
  }, 300_000);

  it("Chapter 7 diagnostic first encounters", () => {
    const bases = [
      { id: "road", questId: "road_above_the_clouds", heroLevel: 12, seed: 11000 },
      { id: "embassy", questId: "embassy_of_empty_armor", heroLevel: 12, seed: 11100 },
      { id: "siege", questId: "siege_of_skyvault", heroLevel: 12, seed: 11200 },
      { id: "severed", questId: "the_severed_voice", heroLevel: 13, seed: 11300 },
      { id: "varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 11400 },
    ] as const;
    const results = bases.flatMap((scenario) => [-1, -2].map((enemyLevelModifier) => simulateCombatScenario({
      id: `chapter7-diagnostic-${scenario.id}-enemy${enemyLevelModifier}`,
      questId: scenario.questId,
      heroLevel: scenario.heroLevel,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 4,
      seed: scenario.seed + Math.abs(enemyLevelModifier) * 17,
      gearProfile: "campaign_lagged",
      progressionProfile: "subclass_ready",
      encounterLimit: 1,
      enemyLevelModifier,
    })));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 120_000);

  it("reports Chapter 7 Standard stress cases with deliberately basic lagged gear", () => {
    const scenarios = [
      { id: "road-basic", questId: "road_above_the_clouds", heroLevel: 12, seed: 10700 },
      { id: "siege-basic", questId: "siege_of_skyvault", heroLevel: 12, seed: 10800 },
      { id: "varkesh-basic", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 10900 },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      id: `chapter7-${scenario.id}-standard`,
      questId: scenario.questId,
      heroLevel: scenario.heroLevel,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 4,
      seed: scenario.seed,
      gearProfile: "lagged_basic",
      progressionProfile: "subclass_ready",
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 180_000);

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
