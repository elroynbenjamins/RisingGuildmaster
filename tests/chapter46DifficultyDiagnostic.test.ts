import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const PARTIES = [
  { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
  { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
  { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
  { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
] as const;

describe("Midgame finale tuning diagnostic", () => {
  it("rechecks Solkar after the targeted boss-strength increase", () => {
    const prepared = (["standard", "veteran", "iron_guild"] as const).map((difficultyId, index) =>
      simulateCombatScenario({
        id: `solkar-prepared-${difficultyId}`,
        questId: "solkar_ash_herald_boss",
        heroLevel: 9,
        partyClasses: PARTIES[0].classes,
        difficultyId,
        runs: 4,
        seed: 37_100 + index * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    );
    const underprepared = (["veteran", "iron_guild"] as const).map((difficultyId, index) =>
      simulateCombatScenario({
        id: `solkar-underprepared-${difficultyId}`,
        questId: "solkar_ash_herald_boss",
        heroLevel: 8,
        partyClasses: PARTIES[0].classes,
        difficultyId,
        runs: 4,
        seed: 37_500 + index * 100,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      }),
    );

    const results = [...prepared, ...underprepared];
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 300_000);

  it("rechecks Cassian Iron after reducing only honor-guard durability", () => {
    const honorGuard = PARTIES.map((party, partyIndex) =>
      simulateCombatScenario({
        id: `cassian-iron-honor-${party.id}`,
        questId: "cassian_vane_boss",
        heroLevel: 11,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 2,
        seed: 38_100 + partyIndex * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
        encounterLimit: 1,
      }),
    );
    const fullQuest = PARTIES.map((party, partyIndex) =>
      simulateCombatScenario({
        id: `cassian-iron-full-${party.id}`,
        questId: "cassian_vane_boss",
        heroLevel: 11,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 2,
        seed: 38_500 + partyIndex * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    );

    const results = [...honorGuard, ...fullQuest];
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 360_000);
});
