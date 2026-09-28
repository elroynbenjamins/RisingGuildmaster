import { describe, expect, it } from "vitest";
import {
  simulateCombatScenario,
  type CombatSimulationResult,
} from "../src/game/simulation/balanceSimulation";
import type { ClassId } from "../src/game/heroes/types";

type PartyCase = {
  id: string;
  classes: readonly ClassId[];
  skillPathIndices: readonly number[];
};

const LATE_BOSSES = [
  { id: "varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 10100 },
  { id: "nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 10200 },
  { id: "serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 10300 },
] as const;

const SENSIBLE_ROLE_MIXES = [
  {
    id: "classic-balanced",
    classes: ["warrior", "ranger", "cleric", "mage"] as const,
    skillPathIndices: [0, 1, 0, 1] as const,
  },
  {
    id: "physical-burst",
    classes: ["warrior", "berserker", "cleric", "ranger"] as const,
    skillPathIndices: [1, 0, 0, 0] as const,
  },
  {
    id: "physical-control",
    classes: ["warrior", "berserker", "cleric", "ranger"] as const,
    skillPathIndices: [1, 1, 0, 1] as const,
  },
  {
    id: "spellbow-strike",
    classes: ["warrior", "ranger", "cleric", "spellbow"] as const,
    skillPathIndices: [1, 0, 0, 1] as const,
  },
  {
    id: "premium-flex",
    classes: ["bulwark", "spellbow", "bard", "mage"] as const,
    skillPathIndices: [0, 1, 1, 0] as const,
  },
  {
    id: "hybrid-magic",
    classes: ["paladin", "monk", "cleric", "summoner"] as const,
    skillPathIndices: [1, 0, 0, 0] as const,
  },
] satisfies readonly PartyCase[];

const ROLE_EDGE_CASES = [
  {
    id: "double-support",
    classes: ["bulwark", "ranger", "cleric", "bard"] as const,
    skillPathIndices: [0, 0, 0, 1] as const,
  },
  {
    id: "no-healer",
    classes: ["warrior", "berserker", "ranger", "mage"] as const,
    skillPathIndices: [1, 0, 0, 0] as const,
  },
  {
    id: "no-dedicated-tank",
    classes: ["berserker", "monk", "cleric", "spellbow"] as const,
    skillPathIndices: [0, 0, 0, 1] as const,
  },
] satisfies readonly PartyCase[];

function average(results: readonly CombatSimulationResult[], selector: (result: CombatSimulationResult) => number): number {
  return results.reduce((sum, result) => sum + selector(result), 0) / Math.max(1, results.length);
}

function isAccidentalEasyResult(result: CombatSimulationResult): boolean {
  return result.winRate === 1
    && result.averageFallenHeroesOnWins < 0.25
    && result.averageRemainingHpRatioOnWins > 0.82;
}

function isAccidentalEasySweep(results: readonly CombatSimulationResult[]): boolean {
  return results.every(isAccidentalEasyResult);
}

describe("late campaign party-composition robustness", () => {
  it("keeps explicit Tank / Damage / Support builds viable while gear quality still matters", () => {
    const results = SENSIBLE_ROLE_MIXES.flatMap((party, partyIndex) =>
      LATE_BOSSES.flatMap((boss, bossIndex) =>
        (["optional_progression", "lagged_basic"] as const).map((gearProfile) =>
          simulateCombatScenario({
            id: `robust-${party.id}-${boss.id}-${gearProfile}`,
            questId: boss.questId,
            heroLevel: boss.heroLevel,
            partyClasses: party.classes,
            skillPathIndices: party.skillPathIndices,
            difficultyId: "standard",
            runs: 4,
            seed: boss.seed + partyIndex * 200 + bossIndex * 20,
            gearProfile,
            progressionProfile: "subclass_ready",
          }),
        ),
      ),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    for (const party of SENSIBLE_ROLE_MIXES) {
      const partyResults = results.filter((result) => result.scenarioId.startsWith(`robust-${party.id}-`));
      const prepared = partyResults.filter((result) => result.scenarioId.endsWith("-optional_progression"));
      const lagged = partyResults.filter((result) => result.scenarioId.endsWith("-lagged_basic"));

      expect(prepared, `${party.id} prepared coverage`).toHaveLength(LATE_BOSSES.length);
      expect(lagged, `${party.id} lagged coverage`).toHaveLength(LATE_BOSSES.length);

      expect(
        prepared.every((result) => result.wins > 0),
        `${party.id} should remain capable of beating every late boss when normally prepared`,
      ).toBe(true);

      expect(
        average(prepared, (result) => result.winRate),
        `${party.id} prepared aggregate win rate`,
      ).toBeGreaterThanOrEqual(0.50);

      const preparedWins = prepared.reduce((sum, result) => sum + result.wins, 0);
      const laggedWins = lagged.reduce((sum, result) => sum + result.wins, 0);
      expect(
        preparedWins,
        `${party.id} normal gear should not underperform deliberately lagged gear across the late bosses`,
      ).toBeGreaterThanOrEqual(laggedWins);

      expect(
        prepared.filter(isAccidentalEasyResult).length,
        `${party.id} may counter one boss cleanly, but should not turn multiple late bosses into easy mode`,
      ).toBeLessThanOrEqual(1);

      expect(
        lagged.some(isAccidentalEasyResult),
        `${party.id} should never trivialize a late boss with deliberately lagged gear`,
      ).toBe(false);
    }

    const preparedResults = results.filter((result) => result.scenarioId.endsWith("-optional_progression"));
    const laggedResults = results.filter((result) => result.scenarioId.endsWith("-lagged_basic"));

    expect(
      average(preparedResults, (result) => result.victoriesWithAnyFallRate),
      "prepared late bosses should still produce casualties often enough for recovery systems to matter",
    ).toBeGreaterThanOrEqual(0.35);

    expect(
      laggedResults.filter((result) => result.wipeRate > 0).length,
      "lagged late-game gear should produce occasional wipes across realistic party builds",
    ).toBeGreaterThanOrEqual(3);
  }, 540_000);

  it("keeps role-starved edge parties risky but not globally hard-bricked", () => {
    const results = ROLE_EDGE_CASES.flatMap((party, partyIndex) =>
      LATE_BOSSES.map((boss, bossIndex) =>
        simulateCombatScenario({
          id: `role-edge-${party.id}-${boss.id}`,
          questId: boss.questId,
          heroLevel: boss.heroLevel,
          partyClasses: party.classes,
          skillPathIndices: party.skillPathIndices,
          difficultyId: "standard",
          runs: 4,
          seed: boss.seed + 1000 + partyIndex * 200 + bossIndex * 20,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }),
      ),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);

    for (const party of ROLE_EDGE_CASES) {
      const partyResults = results.filter((result) => result.scenarioId.startsWith(`role-edge-${party.id}-`));
      expect(
        partyResults.reduce((sum, result) => sum + result.wins, 0),
        `${party.id} should have at least some late-campaign success rather than being globally impossible`,
      ).toBeGreaterThan(0);
      expect(
        isAccidentalEasySweep(partyResults),
        `${party.id} should not become an accidental easy-mode answer to all late bosses`,
      ).toBe(false);
    }
  }, 360_000);
});
