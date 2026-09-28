import { describe, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const classes = ["warrior", "ranger", "cleric", "mage"] as const;

describe("late severe soft-gate tuning diagnostics", () => {
  it("settles Nhal severe and prepared viability", () => {
    const quest = QUESTS.admiral_nhal_veyr_boss!;
    const originalRecovery = quest.betweenEncounterHpRecoveryRatio;
    for (const recovery of [.20, .25, .30] as const) {
      quest.betweenEncounterHpRecoveryRatio = recovery;
      console.log("NHAL_SEVERE", recovery, simulateCombatScenario({
        id: `nhal-severe-r${recovery}`,
        questId: "admiral_nhal_veyr_boss",
        heroLevel: 14,
        partyClasses: classes,
        difficultyId: "standard",
        runs: 8,
        seed: 8970,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      }));
      console.log("NHAL_PREPARED", recovery, simulateCombatScenario({
        id: `nhal-prepared-r${recovery}`,
        questId: "admiral_nhal_veyr_boss",
        heroLevel: 15,
        partyClasses: classes,
        difficultyId: "standard",
        runs: 6,
        seed: 8930,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }
    quest.betweenEncounterHpRecoveryRatio = originalRecovery;
  }, 240_000);

  it("settles Serekh severe pressure without breaking prepared viability", () => {
    const quest = QUESTS.serekh_chartmaker_boss!;
    const first = QUEST_ENCOUNTERS.chart_hall_guard!;
    const second = QUEST_ENCOUNTERS.collapsing_tidal_engine!;
    const originalRecovery = quest.betweenEncounterHpRecoveryRatio;
    const originalFirst = first.enemies.map((group) => group.difficultyMultiplier);
    const originalSecond = second.enemies.map((group) => group.difficultyMultiplier);

    const variants = [
      { id: "baseline", recovery: .15, prelude: .60 },
      { id: "pre70", recovery: .15, prelude: .70 },
      { id: "recovery10", recovery: .10, prelude: .60 },
      { id: "pre70-recovery10", recovery: .10, prelude: .70 },
    ] as const;

    for (const variant of variants) {
      quest.betweenEncounterHpRecoveryRatio = variant.recovery;
      first.enemies.forEach((group) => { group.difficultyMultiplier = variant.prelude; });
      second.enemies.forEach((group) => { group.difficultyMultiplier = variant.prelude; });

      console.log("SEREKH_SEVERE", variant.id, simulateCombatScenario({
        id: `serekh-severe-${variant.id}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 16,
        partyClasses: classes,
        difficultyId: "standard",
        runs: 8,
        seed: 8980,
        gearProfile: "lagged_basic",
        progressionProfile: "subclass_ready",
      }));
      console.log("SEREKH_PREPARED", variant.id, simulateCombatScenario({
        id: `serekh-prepared-${variant.id}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: classes,
        difficultyId: "standard",
        runs: 6,
        seed: 8950,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }

    quest.betweenEncounterHpRecoveryRatio = originalRecovery;
    first.enemies.forEach((group, index) => { group.difficultyMultiplier = originalFirst[index]; });
    second.enemies.forEach((group, index) => { group.difficultyMultiplier = originalSecond[index]; });
  }, 300_000);
});
