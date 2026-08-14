import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_PORTRAITS } from "../src/data/enemies/enemyPortraits";
import { ENEMY_BEHAVIORS } from "../src/data/enemyBehaviors/enemyBehaviors";
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";
import { QUEST_OUTCOME_NARRATIVES } from "../src/data/quests/questOutcomeNarratives";
import { QUESTS } from "../src/data/quests/quests";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { getSkillIconArt } from "../src/data/skills/skillArt";
import { LORE_ENTRIES } from "../src/data/world/lore";
import { isQuestAvailable } from "../src/game/quests/questAvailability";
import { createWorldState } from "../src/game/world/worldState";

const QUEST_IDS = ["smoke_without_fire", "the_scale_collector", "the_hollow_below"] as const;
const ENEMY_IDS = ["ashscale_vermin", "cinder_touched_bandit", "wardstone_scale_guardian"] as const;

describe("Ash Beneath Greenveil", () => {
  it("forms a sequential three-part Chapter 1 side story", () => {
    const start = { ...createWorldState(), completedCampaignNodeIds: ["missing_merchant"] };
    expect(isQuestAvailable(QUESTS.smoke_without_fire!, start)).toBe(true);
    expect(isQuestAvailable(QUESTS.the_scale_collector!, start)).toBe(false);
    const grove = { ...start, completedQuestIds: ["smoke_without_fire"], worldFlags: { ancient_scale_recovered: true } };
    expect(isQuestAvailable(QUESTS.the_scale_collector!, grove)).toBe(true);
    const collector = { ...grove, completedQuestIds: [...grove.completedQuestIds, "the_scale_collector"], worldFlags: { ...grove.worldFlags, scale_buyer_points_east: true } };
    expect(isQuestAvailable(QUESTS.the_hollow_below!, collector)).toBe(true);
  });

  it("connects every D20 stage, encounter, battlefield and aftermath", () => {
    for (const questId of QUEST_IDS) {
      const quest = QUESTS[questId]!;
      expect(quest.storyArcId).toBe("ash_beneath_greenveil");
      expect(quest.explorationStageIds).toHaveLength(3);
      for (const stageId of quest.explorationStageIds!) expect(QUEST_EXPLORATION_STAGES[stageId]?.questId).toBe(questId);
      for (const encounterId of quest.encounterIds) expect(BATTLEFIELDS[QUEST_ENCOUNTERS[encounterId]!.battlefieldId]).toBeDefined();
      expect(QUEST_OUTCOME_NARRATIVES[questId]?.journalUpdate).toBeTruthy();
    }
  });

  it("defines complete combat data for each unique enemy", () => {
    for (const enemyId of ENEMY_IDS) {
      const enemy = ENEMIES[enemyId]!;
      expect(enemy).toBeDefined(); expect(ENEMY_PORTRAITS[enemyId]).toBeDefined(); expect(ENEMY_BEHAVIORS[enemy.behaviorId]).toBeDefined();
      expect(enemy.skillIds.every((skillId) => ENEMY_SKILLS[skillId])).toBe(true);
    }
    expect(ENEMY_SKILLS.sleeping_ember?.conditionalModifiers?.[0]?.conditions.selfHpRatioMax).toBe(.40);
    expect(ENEMY_SKILLS.ash_bomb?.targetModifiers?.[0]).toMatchObject({ stat: "attackRollModifier", value: -1, durationTurns: 2 });
  });

  it("uses dedicated portraits and skill icons for the story enemies", () => {
    expect(ENEMY_PORTRAITS.ashscale_vermin).toMatchObject({ atlasId: "ashStory", column: 0, row: 0 });
    expect(ENEMY_PORTRAITS.cinder_touched_bandit).toMatchObject({ atlasId: "ashStory", column: 1, row: 0 });
    expect(ENEMY_PORTRAITS.wardstone_scale_guardian).toMatchObject({ atlasId: "ashStory", column: 2, row: 0 });
    ["ember_bite", "cinder_scuttle", "ember_fed", "cinder_blade", "ash_bomb", "scale_hammer", "wardfire_pulse", "ancient_scale_shell", "sleeping_ember"].forEach((skillId) => expect(getSkillIconArt(skillId).atlas).toBe("ashStory"));
  });

  it("foreshadows the First Crown without defining a dragon enemy", () => {
    expect(QUESTS.the_hollow_below?.setWorldFlagsOnVictory).toMatchObject({ ancient_dragon_stirring: true, first_crown_beast_omen: true });
    expect(LORE_ENTRIES.draconic_wardmakers?.unlockFlag).toBe("lore_draconic_wardmakers");
    expect(Object.keys(ENEMIES).some((id) => id.includes("dragon"))).toBe(false);
  });
});
