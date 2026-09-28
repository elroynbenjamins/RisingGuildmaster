import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late role substitution diagnostic", () => {
  it("screens prepared class substitutions against Nhal and Serekh", () => {
    const bosses = [
      { id: "nhal", questId: "admiral_nhal_veyr_boss", level: 15, seed: 14_800 },
      { id: "serekh", questId: "serekh_chartmaker_boss", level: 17, seed: 14_900 },
    ] as const;
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "front-paladin", classes: ["paladin", "ranger", "cleric", "mage"] as const },
      { id: "front-berserker", classes: ["berserker", "ranger", "cleric", "mage"] as const },
      { id: "front-monk", classes: ["monk", "ranger", "cleric", "mage"] as const },
      { id: "front-bulwark", classes: ["bulwark", "ranger", "cleric", "mage"] as const },
      { id: "ranged-spellbow", classes: ["warrior", "spellbow", "cleric", "mage"] as const },
      { id: "support-bard", classes: ["warrior", "ranger", "bard", "mage"] as const },
      { id: "support-summoner", classes: ["warrior", "ranger", "summoner", "mage"] as const },
    ] as const;

    for (const boss of bosses) {
      for (const party of parties) {
        console.log("ROLE_SUB", simulateCombatScenario({
          id: `${boss.id}-${party.id}`,
          questId: boss.questId,
          heroLevel: boss.level,
          partyClasses: party.classes,
          difficultyId: "standard",
          runs: 4,
          seed: boss.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 420_000);
});
