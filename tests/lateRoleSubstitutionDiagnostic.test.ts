import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late role substitution diagnostic", () => {
  it("screens role-correct prepared substitutions on Hard", () => {
    const bosses = [
      { id: "nhal", questId: "admiral_nhal_veyr_boss", level: 15, seed: 16_800 },
      { id: "serekh", questId: "serekh_chartmaker_boss", level: 17, seed: 16_900 },
    ] as const;
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "front-bulwark", classes: ["bulwark", "ranger", "cleric", "mage"] as const },
      { id: "damage-berserker", classes: ["warrior", "berserker", "cleric", "mage"] as const },
      { id: "damage-monk", classes: ["warrior", "monk", "cleric", "mage"] as const },
      { id: "support-bard", classes: ["warrior", "ranger", "bard", "mage"] as const },
      { id: "support-summoner", classes: ["warrior", "ranger", "summoner", "mage"] as const },
    ] as const;

    for (const boss of bosses) {
      for (const party of parties) {
        console.log("ROLE_HARD", simulateCombatScenario({
          id: `${boss.id}-${party.id}-hard`,
          questId: boss.questId,
          heroLevel: boss.level,
          partyClasses: party.classes,
          difficultyId: "veteran",
          runs: 4,
          seed: boss.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 420_000);
});
