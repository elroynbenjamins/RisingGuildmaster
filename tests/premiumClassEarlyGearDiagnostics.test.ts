import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("premium class early bridge combat diagnostics", () => {
  it("compares Level-6 premium substitutions against the normal Vaelith party", () => {
    const scenarios = [
      { id: "reference", partyClasses: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "bulwark-frontline", partyClasses: ["bulwark", "ranger", "cleric", "mage"] as const },
      { id: "spellbow-ranged", partyClasses: ["warrior", "spellbow", "cleric", "mage"] as const },
      { id: "bard-support", partyClasses: ["warrior", "ranger", "bard", "mage"] as const },
      { id: "summoner-caster", partyClasses: ["warrior", "ranger", "cleric", "summoner"] as const },
      { id: "monk-melee", partyClasses: ["warrior", "monk", "cleric", "mage"] as const },
    ];
    const results = scenarios.map((scenario) => simulateCombatScenario({
      id: scenario.id,
      questId: "vaelith_pale_echo_boss",
      heroLevel: 6,
      partyClasses: scenario.partyClasses,
      difficultyId: "standard",
      runs: 8,
      seed: 9400,
      gearProfile: "lagged_basic",
      progressionProfile: "subclass_ready",
    }));
    console.log("PREMIUM_EARLY_COMBAT");
    console.table(results);
  }, 180_000);
});
