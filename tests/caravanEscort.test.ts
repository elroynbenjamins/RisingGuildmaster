import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { CARAVAN_DECISION_CHOICES, CARAVAN_DECISION_STAGES, CARAVAN_ESCORT_NPCS } from "../src/data/quests/caravanEscort";
import { QUESTS } from "../src/data/quests/quests";
import { createCombatState } from "../src/game/combat/combatEngine";
import { advanceQuestDecision, concludeCaravanDecisions, EMPTY_QUEST_DECISION_PROGRESS, resolveQuestDecision } from "../src/game/quests/questDecisionService";
import { createSeededRandom } from "../src/utils/random";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

describe("The Brambleway Run", () => {
  it("defines a two-stage side quest and two named escort NPCs", () => {
    expect(QUESTS.brambleway_caravan).toMatchObject({ questType: "side", repeatable: false, decisionStageIds: ["caravan_route", "caravan_warning"], encounterIds: ["brambleway_expected_ambush"] });
    expect(Object.keys(CARAVAN_DECISION_STAGES)).toEqual(["caravan_route", "caravan_warning"]);
    expect(CARAVAN_ESCORT_NPCS.map(({ name, role }) => ({ name, role }))).toEqual([{ name: "Aldren Vale", role: "Merchant" }, { name: "Mira Thorn", role: "Caravan Guard" }]);
  });

  it("uses D20 checks and party attributes to detect the ambush", () => {
    const hero = testHero();
    const first = resolveQuestDecision(CARAVAN_DECISION_CHOICES.scout_ahead!, [hero], sequenceRandom([.50]));
    expect(first).toMatchObject({ awarenessDelta: 1, check: { diceRoll: 11, modifier: 2, total: 13, difficultyClass: 12, success: true } });
    const progress = advanceQuestDecision(EMPTY_QUEST_DECISION_PROGRESS, first);
    expect(concludeCaravanDecisions(progress)).toMatchObject({ expectedAmbush: true, combatSetup: { encounterIds: ["brambleway_expected_ambush"], heroInitiativeModifier: 2 } });
  });

  it("turns failed or reckless choices into a surprise deployment with numerical penalties", () => {
    const failure = resolveQuestDecision(CARAVAN_DECISION_CHOICES.read_ambush_tracks!, [testHero()], sequenceRandom([0]));
    const reckless = resolveQuestDecision(CARAVAN_DECISION_CHOICES.press_on!, [testHero()], sequenceRandom([]));
    const progress = advanceQuestDecision(advanceQuestDecision(EMPTY_QUEST_DECISION_PROGRESS, failure), reckless);
    expect(concludeCaravanDecisions(progress)).toMatchObject({ expectedAmbush: false, combatSetup: { encounterIds: ["brambleway_surprise_ambush"], enemyInitiativeModifier: 2, heroOpeningAttackRollModifier: -1, enemyOpeningAttackRollModifier: 2 } });
  });

  it("builds a unique grand map with three caravan tiles and both NPC landmarks", () => {
    const field = BATTLEFIELDS.brambleway_caravan_road!;
    expect(field.boardSizeId).toBe("grand_battlefield");
    expect(field.terrainPlacements.filter((tile) => tile.terrainType === "caravan")).toHaveLength(3);
    expect(field.terrainPlacements.filter((tile) => tile.terrainType === "escort_npc")).toHaveLength(2);
    expect(QUEST_ENCOUNTERS.brambleway_expected_ambush?.battlefieldId).toBe(field.id);
    expect(QUEST_ENCOUNTERS.brambleway_surprise_ambush?.battlefieldId).toBe(field.id);
  });

  it("applies the selected setup only to runtime combatants", () => {
    const setup = concludeCaravanDecisions({ awareness: -1, heroArmorClassModifier: 1, results: [] }).combatSetup;
    const state = createCombatState("brambleway_caravan", 0, [testHero()], createSeededRandom(91), undefined, setup);
    expect(state.encounterIds).toEqual(["brambleway_surprise_ambush"]);
    expect(state.heroes[0]?.unit.stats.armorClass).toBeGreaterThan(0);
    expect(state.heroes[0]?.unit.activeModifiers).toContainEqual(expect.objectContaining({ sourceSkillId: "quest_preparation", stat: "attackRollModifier", value: -1 }));
    expect(state.enemies.every(({ unit }) => unit.stats.initiativeBonus >= 2)).toBe(true);
    expect(state.enemies.every(({ unit }) => unit.activeModifiers.some((modifier) => modifier.sourceSkillId === "quest_preparation" && modifier.value === 2))).toBe(true);
    expect(QUEST_ENCOUNTERS.brambleway_surprise_ambush?.enemies[1]?.difficultyMultiplier).toBe(1.05);
  });
});
