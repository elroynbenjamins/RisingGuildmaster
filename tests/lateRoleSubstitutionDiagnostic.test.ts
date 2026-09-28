import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import type { ClassId } from "../src/game/heroes/types";

type Scenario = {
  id: string;
  classes: readonly ClassId[];
  gearProfile: "lagged_basic" | "optional_progression";
};

const scenarios: readonly Scenario[] = [
  { id: "damage-mage", classes: ["warrior", "ranger", "cleric", "mage"], gearProfile: "optional_progression" },
  { id: "damage-berserker", classes: ["warrior", "ranger", "cleric", "berserker"], gearProfile: "optional_progression" },
  { id: "damage-monk", classes: ["warrior", "ranger", "cleric", "monk"], gearProfile: "optional_progression" },
  { id: "damage-spellbow", classes: ["warrior", "ranger", "cleric", "spellbow"], gearProfile: "optional_progression" },
  { id: "damage-summoner", classes: ["warrior", "ranger", "cleric", "summoner"], gearProfile: "optional_progression" },

  { id: "tank-paladin", classes: ["paladin", "ranger", "cleric", "mage"], gearProfile: "optional_progression" },
  { id: "tank-bulwark", classes: ["bulwark", "ranger", "cleric", "mage"], gearProfile: "optional_progression" },

  { id: "support-bard", classes: ["warrior", "ranger", "bard", "mage"], gearProfile: "optional_progression" },

  { id: "gear-classic-lagged", classes: ["warrior", "ranger", "cleric", "mage"], gearProfile: "lagged_basic" },
  { id: "gear-aggressive-lagged", classes: ["warrior", "ranger", "cleric", "berserker"], gearProfile: "lagged_basic" },
  { id: "gear-premium-flex", classes: ["bulwark", "spellbow", "bard", "mage"], gearProfile: "optional_progression" },
  { id: "gear-premium-flex-lagged", classes: ["bulwark", "spellbow", "bard", "mage"], gearProfile: "lagged_basic" },
];

describe("current-main Chapter 9 role substitution diagnostic", () => {
  it("isolates Tank, Damage, Support and gear-state effects against Serekh", () => {
    for (const [index, scenario] of scenarios.entries()) {
      const result = simulateCombatScenario({
        id: scenario.id,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: scenario.classes,
        difficultyId: "standard",
        runs: 12,
        seed: 13_900 + index * 400,
        gearProfile: scenario.gearProfile,
        progressionProfile: "subclass_ready",
      });
      console.log("LATE_ROLE_DIAGNOSTIC", result);
      expect(result.stalled, scenario.id).toBe(0);
    }
  }, 720_000);
});
