import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { getQuestCombatProfile } from "../src/game/quests/questCombatProfileService";

describe("quest combat profiles", () => {
  it("briefs the guild on the Goblin Patrol's physical threat", () => {
    const profile = getQuestCombatProfile(QUESTS.goblin_patrol!);
    expect(profile.physicalThreat).toBeGreaterThan(profile.magicThreat);
    expect(profile.summary).toContain("physical");
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
