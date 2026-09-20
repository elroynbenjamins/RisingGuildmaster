import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const party = ["warrior", "paladin", "cleric", "ranger", "berserker", "mage", "cleric", "ranger"] as const;
const raids = [
  { questId: "raid_broodheart_awakening", level: 10 },
  { questId: "raid_white_maw_unbound", level: 12 },
  { questId: "raid_chartmaker_ascendant", level: 18 },
] as const;

describe("raid balance simulations", () => {
  it("reports baseline raid completion at intended levels on Standard", () => {
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
    expect(results[0]!.winRate).toBeLessThanOrEqual(.75);
    expect(results[1]!.winRate).toBeLessThanOrEqual(.75);
  }, 120_000);
});
