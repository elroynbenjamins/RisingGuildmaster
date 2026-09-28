import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("premium class early bridge combat diagnostics", () => {
  it("compares Level-6 premium substitutions against the normal Vaelith party", () => {
    const scenarios = [
      { id: "reference", partyClasses: ["warrior", "ranger", "cleric", "mage"] as const, seed: 9300 },
      { id: "bulwark-frontline", partyClasses: ["bulwark", "ranger", "cleric", "mage"] as const, seed: 9310 },
      { id: "spellbow-ranged", partyClasses: ["warrior", "spellbow", "cleric", "mage"] as const, seed: 9320 },
      { id: "bard-support", partyClasses: ["warrior", "ranger", "bard", "mage"] as const, seed: 9330 },
      { id: "summoner-caster", partyClasses: ["warrior", "ranger", "cleric", "summoner"] as const, seed: 9340 },
      { id: "monk-melee", partyClasses: ["warrior", "monk", "cleric", "mage"] as const, seed: 9350 },
    ];
    const results = scenarios.map((scenario) => simulateCombatScenario({
      id: scenario.id,
      questId: "vaelith_pale_echo_boss",
      heroLevel: 6,
      partyClasses: scenario.partyClasses,
      difficultyId: "standard",
      runs: 4,
      seed: scenario.seed,
      gearProfile: "lagged_basic",
      progressionProfile: "base",
    }));
    console.log("PREMIUM_EARLY_COMBAT");
    console.table(results);
  }, 180_000);
});
