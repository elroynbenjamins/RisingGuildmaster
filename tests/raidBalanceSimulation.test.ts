import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const party = ["warrior", "paladin", "cleric", "ranger", "berserker", "mage", "cleric", "ranger"] as const;
const raids = [
  { questId: "raid_broodheart_awakening", level: 10 },
  { questId: "raid_white_maw_unbound", level: 12 },
  { questId: "raid_chartmaker_ascendant", level: 18 },
] as const;

describe("raid balance simulations", () => {
  it("reports baseline raid pressure at intended levels on Standard", () => {
    const results = raids.flatMap((raid, raidIndex) => (["standard"] as const).map((difficultyId, difficultyIndex) => simulateCombatScenario({
      id: `${raid.questId}-${difficultyId}`,
      questId: raid.questId,
      heroLevel: raid.level,
      partyClasses: party,
      difficultyId,
      runs: 4,
      seed: 12_000 + raidIndex * 1_000 + difficultyIndex * 100,
    })));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    expect(results.every((result) => result.winRate > 0)).toBe(true);
    expect(results.every((result) => result.averageSurvivingHeroes <= 7.5)).toBe(true);
    expect(results.slice(0,2).every((result) => result.averageFallenHeroesOnWins >= .5)).toBe(true);
  }, 120_000);

  it("measures Chartmaker with a normal Lv 18 progressed raid roster", () => {
    const result = simulateCombatScenario({
      id: "raid-chartmaker-prepared-standard",
      questId: "raid_chartmaker_ascendant",
      heroLevel: 18,
      partyClasses: party,
      difficultyId: "standard",
      runs: 8,
      seed: 15_500,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    });
    console.table([result]);
    expect(result.stalled).toBe(0);
    expect(result.winRate).toBeGreaterThanOrEqual(.75);
    expect(result.averageSurvivingHeroes).toBeGreaterThanOrEqual(4.8);
    expect(result.averageSurvivingHeroes).toBeLessThanOrEqual(6.5);
    expect(result.averageFallenHeroesOnWins).toBeGreaterThanOrEqual(1.5);
  }, 120_000);
});
