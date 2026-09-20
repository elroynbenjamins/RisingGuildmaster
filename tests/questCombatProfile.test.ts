import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { applyQuestDifficultyCombatSetup, getQuestCombatProfile } from "../src/game/quests/questCombatProfileService";

describe("quest combat profiles", () => {
  it("briefs the guild on the Goblin Patrol's physical threat", () => {
    const profile = getQuestCombatProfile(QUESTS.goblin_patrol!);
    expect(profile.physicalThreat).toBeGreaterThan(profile.magicThreat);
    expect(profile.summary).toContain("physical");
  });

  it("adds +1 attack roll and +5 percent damage to ordinary side quests only", () => {
    expect(applyQuestDifficultyCombatSetup(QUESTS.echoes_of_mosswatch!)).toMatchObject({ enemyAttackRollModifier: 1, enemyDamageModifier: .05 });
    expect(applyQuestDifficultyCombatSetup(QUESTS.wardstone_depths_expedition!)).toBeUndefined();
    expect(applyQuestDifficultyCombatSetup(QUESTS.goblin_patrol!)).toBeUndefined();
  });

  it("keeps threat shares normalized and returns actionable offense advice", () => {
    for (const quest of Object.values(QUESTS).slice(0, 20)) {
      const profile = getQuestCombatProfile(quest);
      expect(profile.physicalThreat + profile.magicThreat).toBeCloseTo(1);
      expect(["physical", "magic", "mixed"]).toContain(profile.recommendedDamage);
      expect(new Set(profile.conditionIds).size).toBe(profile.conditionIds.length);
    }
  });
});
