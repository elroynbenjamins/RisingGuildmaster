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

  it("builds a normal optional-progression loadout with slightly lagged rare gear", () => {
    const party = createSimulationParty(["warrior", "ranger", "mage", "cleric"], 10, 4425, "optional_progression", "subclass_ready");
    for (const hero of party) {
      const equipped = Object.values(hero.equipment).filter((id): id is string => Boolean(id)).map((id) => EQUIPMENT[id]!);
      expect(equipped.length).toBeGreaterThanOrEqual(4);
      expect(equipped.every((item) => ["common", "uncommon", "rare", "epic"].includes(item.rarity))).toBe(true);
      expect(equipped.some((item) => item.rarity === "rare" || item.rarity === "epic")).toBe(true);
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
    expect(results[2]!.averageFallenHeroesOnWins).toBeGreaterThanOrEqual(.5);
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
      { id: "chapter3-glimmerlake", questId: "beneath_glimmerlake", heroLevel: 6, partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, difficultyId: "standard" as const, runs: 8, seed: 6900, gearProfile: "lagged_basic" as const },
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
    expect(byId.get("chapter3-blue-horns")!.averageSurvivingHeroes).toBeLessThanOrEqual(3.2);
    expect(byId.get("chapter3-hroth")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter3-glimmerlake-l5")!.winRate).toBeGreaterThanOrEqual(.75);
    expect(byId.get("chapter3-glimmerlake")!.winRate).toBeGreaterThanOrEqual(byId.get("chapter3-glimmerlake-l5")!.winRate);
    expect(byId.get("chapter3-glimmerlake")!.averageSurvivingHeroes).toBeGreaterThanOrEqual(3);
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
    expect(vaelithVeteran.averageFallenHeroesOnWins).toBeGreaterThanOrEqual(.75);
    expect(vaelithIron.winRate).toBeLessThanOrEqual(.75);
    expect(vaelithIron.averageFallenHeroesOnWins).toBeGreaterThanOrEqual(1.5);
    expect(vaelithIron.averageSurvivingHeroes).toBeLessThanOrEqual(2);
  }, 300_000);

  it("keeps prepared Hard and Iron parties viable without making them forgiving", () => {
    const encounters = [
      { id: "vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, seed: 7475 },
      { id: "serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 8975 },
    ] as const;
    const results = encounters.flatMap((encounter) => (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
      simulateCombatScenario({
        id: `prepared-${encounter.id}-${difficultyId}`,
        questId: encounter.questId,
        heroLevel: encounter.heroLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId,
        runs: 4,
        seed: encounter.seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    ));
    console.table(results);
    for (const encounter of encounters) {
      const standard = results.find((result) => result.scenarioId === `prepared-${encounter.id}-standard`)!;
      const hard = results.find((result) => result.scenarioId === `prepared-${encounter.id}-veteran`)!;
      const iron = results.find((result) => result.scenarioId === `prepared-${encounter.id}-iron_guild`)!;
      expect(standard.winRate).toBeGreaterThanOrEqual(hard.winRate);
      expect(hard.winRate).toBeGreaterThanOrEqual(iron.winRate);
      expect(hard.winRate, `${encounter.id} prepared Hard viability`).toBeGreaterThanOrEqual(.5);
      if (encounter.id === "vaelith") {
        expect(iron.wins, `${encounter.id} prepared Iron should remain possible`).toBeGreaterThan(0);
      }
      expect(iron.averageSurvivingHeroes, `${encounter.id} Iron pressure`).toBeLessThanOrEqual(hard.averageSurvivingHeroes);
    }

    const serekhIronFrontline = simulateCombatScenario({
      id: "prepared-serekh-iron-heavy-frontline",
      questId: "serekh_chartmaker_boss",
      heroLevel: 17,
      partyClasses: ["warrior", "berserker", "cleric", "spellbow"],
      difficultyId: "iron_guild",
      runs: 4,
      seed: 8975,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    });
    expect(serekhIronFrontline.wins, "Serekh Iron should remain possible with a sturdier prepared composition").toBeGreaterThan(0);
    expect(serekhIronFrontline.winRate, "Serekh Iron should remain unforgiving").toBeLessThanOrEqual(.5);
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

  it("reports Chapter 4–6 transition combat with lagged basic gear", () => {
    const scenarios = [
      { id: "chapter4-blackwater-l6", questId: "return_to_blackwater", heroLevel: 6, seed: 8500 },
      { id: "chapter4-procession-l6", questId: "procession_at_low_water", heroLevel: 6, seed: 8510 },
      { id: "chapter4-bell-widow-l6", questId: "bell_widow_boss", heroLevel: 6, seed: 8520 },
      { id: "chapter4-bell-widow-l7", questId: "bell_widow_boss", heroLevel: 7, seed: 8530 },
      { id: "chapter4-morrowveil-l7", questId: "morrowveil_drowned_archivist_boss", heroLevel: 7, seed: 8540 },
      { id: "chapter5-road-underprepared", questId: "road_of_glass", heroLevel: 7, seed: 8600 },
      { id: "chapter5-road-ready", questId: "road_of_glass", heroLevel: 8, seed: 8610 },
      { id: "chapter5-siege", questId: "siege_of_emberfall", heroLevel: 8, seed: 8620 },
      { id: "chapter5-keeper", questId: "keeper_of_cinders_boss", heroLevel: 8, seed: 8630 },
      { id: "chapter5-causeway", questId: "the_burning_causeway", heroLevel: 9, seed: 8640 },
      { id: "chapter5-solkar", questId: "solkar_ash_herald_boss", heroLevel: 9, seed: 8650 },
      { id: "chapter6-laurel-law-underprepared", questId: "laurel_law", heroLevel: 9, seed: 8700, gearProfile: "lagged_basic" as const },
      { id: "chapter6-laurel-law-basic-l10", questId: "laurel_law", heroLevel: 10, seed: 8710, gearProfile: "lagged_basic" as const },
      { id: "chapter6-laurel-law-prepared", questId: "laurel_law", heroLevel: 10, seed: 8710, gearProfile: "optional_progression" as const },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      ...scenario,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 6,
      gearProfile: "gearProfile" in scenario ? scenario.gearProfile : "lagged_basic",
      progressionProfile: "subclass_ready",
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    const byId = new Map(results.map((result) => [result.scenarioId, result]));
    expect(byId.get("chapter4-bell-widow-l7")!.averageSurvivingHeroes).toBeGreaterThanOrEqual(byId.get("chapter4-bell-widow-l6")!.averageSurvivingHeroes);
    expect(byId.get("chapter5-road-ready")!.averageSurvivingHeroes).toBeGreaterThan(byId.get("chapter5-road-underprepared")!.averageSurvivingHeroes);
    expect(byId.get("chapter5-road-underprepared")!.averageSurvivingHeroes).toBeLessThanOrEqual(3.2);
    expect(byId.get("chapter5-road-ready")!.averageSurvivingHeroes).toBeLessThan(4);
    expect(byId.get("chapter6-laurel-law-prepared")!.winRate).toBeGreaterThanOrEqual(byId.get("chapter6-laurel-law-basic-l10")!.winRate);
    expect(byId.get("chapter4-procession-l6")!.winRate).toBeGreaterThan(0);
    expect(byId.get("chapter5-siege")!.winRate).toBeGreaterThan(0);
    expect(byId.get("chapter5-causeway")!.winRate).toBeGreaterThan(0);
    expect(byId.get("chapter6-laurel-law-prepared")!.winRate).toBeGreaterThan(0);
    expect(byId.get("chapter6-laurel-law-basic-l10")!.averageSurvivingHeroes).toBeLessThan(4);
  }, 240_000);

  it("reports prepared Standard survivor baselines for the midgame pressure checks", () => {
    const scenarios = [
      { id: "prepared-road-of-glass", questId: "road_of_glass", heroLevel: 8, seed: 8800 },
      { id: "prepared-laurel-law", questId: "laurel_law", heroLevel: 10, seed: 8810 },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      ...scenario,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 12,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    for (const result of results) {
      expect(result.winRate, `${result.scenarioId} prepared Standard win rate`).toBeGreaterThanOrEqual(.75);
      expect(result.averageSurvivingHeroes, `${result.scenarioId} prepared Standard survivors`).toBeGreaterThanOrEqual(2.4);
      expect(result.averageSurvivingHeroes, `${result.scenarioId} prepared Standard survivors`).toBeLessThanOrEqual(3.4);
      expect(result.averageFallenHeroesOnWins, `${result.scenarioId} casualty pressure`).toBeGreaterThanOrEqual(.5);
      expect(result.averageFallenHeroesOnWins, `${result.scenarioId} casualty pressure`).toBeLessThanOrEqual(1.6);
    }
  }, 120_000);

  it("reports prepared Standard casualty pressure through Chapters 7–9", () => {
    const scenarios = [
      { id: "prepared-ch7-siege", questId: "siege_of_skyvault", heroLevel: 13, seed: 8900 },
      { id: "prepared-ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 8910 },
      { id: "prepared-ch8-siege", questId: "siege_of_tidewatch", heroLevel: 15, seed: 8920 },
      { id: "prepared-ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 8930 },
      { id: "prepared-ch9-chain", questId: "chain_beneath_fleet", heroLevel: 17, seed: 8940 },
      { id: "prepared-ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 8950 },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      ...scenario,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 6,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    for (const result of results) {
      const boss = /varkesh|nhal|serekh/.test(result.scenarioId);
      expect(result.winRate, `${result.scenarioId} prepared Standard win rate`).toBeGreaterThanOrEqual(2 / 3);
      expect(result.averageSurvivingHeroes, `${result.scenarioId} prepared Standard survivors`).toBeGreaterThanOrEqual(boss ? 2.2 : 2.5);
      expect(result.averageFallenHeroesOnWins, `${result.scenarioId} excessive casualty pressure`).toBeLessThanOrEqual(boss ? 1.8 : 1.5);
    }
    const pressuredScenarios = results.filter((result) => result.averageFallenHeroesOnWins >= .5);
    const averageFallen = results.reduce((sum, result) => sum + result.averageFallenHeroesOnWins, 0) / results.length;
    expect(pressuredScenarios.length, "late prepared missions with meaningful casualty pressure").toBeGreaterThanOrEqual(5);
    expect(averageFallen, "average late prepared casualty pressure").toBeGreaterThanOrEqual(.75);
  }, 180_000);

  it("keeps underprepared late-chapter bosses dangerous without becoming guaranteed wipes", () => {
    const scenarios = [
      { id: "underprepared-ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 12, seed: 8960 },
      { id: "underprepared-ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 14, seed: 8970 },
      { id: "underprepared-ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 16, seed: 8980 },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      ...scenario,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 6,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    for (const result of results) {
      expect(result.winRate, `${result.scenarioId} underprepared win rate`).toBeGreaterThanOrEqual(.5);
      expect(result.averageSurvivingHeroes, `${result.scenarioId} surviving heroes`).toBeLessThanOrEqual(3.25);
      expect(result.averageFallenHeroesOnWins, `${result.scenarioId} casualties on surviving attempts`).toBeGreaterThanOrEqual(.5);
      expect(result.victoriesWithAnyFallRate, `${result.scenarioId} casualty frequency`).toBeGreaterThanOrEqual(.5);
    }
    expect(results.filter((result) => result.wipeRate > 0).length, "late underprepared bosses should still produce occasional wipes").toBeGreaterThanOrEqual(1);
  }, 180_000);

  it("keeps late boss preparation meaningfully better across shared seeds", () => {
    const bosses = [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", preparedLevel: 13, seed: 9300 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", preparedLevel: 15, seed: 9400 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", preparedLevel: 17, seed: 9500 },
    ] as const;
    for (const boss of bosses) {
      const prepared = simulateCombatScenario({
        id: `${boss.id}-prepared-shared`,
        questId: boss.questId,
        heroLevel: boss.preparedLevel,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 8,
        seed: boss.seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      });
      const underprepared = simulateCombatScenario({
        id: `${boss.id}-underprepared-shared`,
        questId: boss.questId,
        heroLevel: boss.preparedLevel - 1,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 8,
        seed: boss.seed,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      });
      const severe = simulateCombatScenario({
        id: `${boss.id}-severe-shared`,
        questId: boss.questId,
        heroLevel: boss.preparedLevel - 1,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 8,
        seed: boss.seed,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      });
      console.table([prepared, underprepared, severe]);
      expect(prepared.winRate, `${boss.id} prepared reliability`).toBeGreaterThanOrEqual(.625);
      const preparationShows =
        prepared.winRate > underprepared.winRate
        || prepared.averageFallenHeroesOnWins + .5 <= underprepared.averageFallenHeroesOnWins;
      expect(preparationShows, `${boss.id} preparation payoff`).toBe(true);
      expect(underprepared.averageFallenHeroesOnWins, `${boss.id} underprepared casualties`).toBeGreaterThanOrEqual(1);
      expect(severe.wipeRate, `${boss.id} severe underprepared wipe pressure`).toBeGreaterThanOrEqual(.625);
    }
  }, 300_000);

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
