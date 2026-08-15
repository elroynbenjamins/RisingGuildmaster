import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { MOSSWATCH_EXPLORATION } from "../src/data/quests/mosswatchExploration";
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";
import { QUEST_OUTCOME_NARRATIVES } from "../src/data/quests/questOutcomeNarratives";
import { QUESTS } from "../src/data/quests/quests";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { resolveQuestExplorationStage } from "../src/game/quests/questExplorationService";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

describe("Echoes of Mosswatch", () => {
  it("adds a Chapter 1 Greenveil side story with three checks and two encounters", () => {
    expect(QUESTS.echoes_of_mosswatch).toMatchObject({ questType: "side", regionId: "greenveil", repeatable: false, recommendedLevelMin: 2, recommendedLevelMax: 4, explorationStageIds: ["mosswatch_cipher", "mosswatch_gate", "mosswatch_resonance"], encounterIds: ["mosswatch_courtyard_encounter", "mosswatch_vault_encounter"] });
    expect(QUESTS.echoes_of_mosswatch!.explorationStageIds?.every((id) => QUEST_EXPLORATION_STAGES[id]?.questId === "echoes_of_mosswatch")).toBe(true);
  });

  it("uses explicit Intelligence, Strength, and Wisdom D20 checks", () => {
    expect(Object.values(MOSSWATCH_EXPLORATION).map(({ attribute, difficultyClass }) => [attribute, difficultyClass])).toEqual([["intelligence", 12], ["strength", 13], ["wisdom", 14]]);
    const skilledHero = { ...testHero(), baseAttributes: { ...testHero().baseAttributes, intelligence: 14, strength: 14 } };
    const success = resolveQuestExplorationStage(MOSSWATCH_EXPLORATION.mosswatch_cipher!, [skilledHero], sequenceRandom([.50]));
    expect(success.check).toMatchObject({ diceRoll: 11, modifier: 2, total: 13, success: true });
    const failure = resolveQuestExplorationStage(MOSSWATCH_EXPLORATION.mosswatch_gate!, [skilledHero], sequenceRandom([0]));
    expect(failure).toMatchObject({ appliedConditionId: "injured", check: { diceRoll: 1, modifier: 2, total: 3, success: false } });
  });

  it("progresses from a battlefield courtyard to a grand Warden vault", () => {
    expect(BATTLEFIELDS[QUEST_ENCOUNTERS.mosswatch_courtyard_encounter!.battlefieldId]).toMatchObject({ id: "mosswatch_courtyard", boardSizeId: "battlefield" });
    expect(BATTLEFIELDS[QUEST_ENCOUNTERS.mosswatch_vault_encounter!.battlefieldId]).toMatchObject({ id: "mosswatch_vault", boardSizeId: "grand_battlefield" });
    expect(BATTLEFIELDS.mosswatch_vault?.terrainPlacements.some((tile) => tile.terrainType === "shallow_water")).toBe(true);
  });

  it("introduces a data-driven Goblin Wardbreaker and its magical hex", () => {
    expect(ENEMIES.goblin_wardbreaker).toMatchObject({ factionId: "goblins", role: "debuffer", magicDamageModifier: .35, skillIds: ["splinter_bolt", "wardstone_hex"], behaviorId: "goblin_wardbreaker_behavior" });
    expect(ENEMY_SKILLS.splinter_bolt).toMatchObject({ damageType: "magic", range: 5 });
    expect(ENEMY_SKILLS.wardstone_hex).toMatchObject({ damageType: "magic", cooldownTurns: 3, targetModifiers: [{ stat: "magicDefenseScore", operation: "flat", value: -2, durationTurns: 2 }] });
  });

  it("reveals a Wardstone connection in the victory and journal story", () => {
    expect(QUEST_OUTCOME_NARRATIVES.echoes_of_mosswatch?.victory).toContain("Wardstone");
    expect(QUEST_OUTCOME_NARRATIVES.echoes_of_mosswatch?.journalUpdate).toContain("Wardstones");
  });
});
