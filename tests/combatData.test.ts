import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_BEHAVIORS } from "../src/data/enemyBehaviors/enemyBehaviors";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";

describe("combat data integrity", () => {
  it("gives every enemy exactly one valid basic attack and a valid behavior", () => {
    for (const enemy of Object.values(ENEMIES)) {
      const skills = enemy.skillIds.map((id) => ENEMY_SKILLS[id]);
      expect(skills.every(Boolean)).toBe(true);
      expect(skills.filter((skill) => skill?.type === "basic_attack")).toHaveLength(1);
      const behavior = ENEMY_BEHAVIORS[enemy.behaviorId];
      expect(behavior).toBeDefined();
      expect(behavior?.basicAttackSkillId).toBe(skills.find((skill) => skill?.type === "basic_attack")?.id);
      for (const rule of behavior?.rules ?? []) expect(enemy.skillIds).toContain(rule.skillId);
    }
  });
  it("uses decimal probabilities and nonnegative cooldowns", () => {
    for (const skill of Object.values(ENEMY_SKILLS)) {
      if (skill.type === "basic_attack") expect(skill.cooldownTurns).toBe(0);
      if (skill.accuracyModifier !== undefined) expect(Math.abs(skill.accuracyModifier)).toBeLessThanOrEqual(1);
      for (const application of skill.conditionApplications ?? []) {
        expect(application.chance).toBeGreaterThanOrEqual(0);
        expect(application.chance).toBeLessThanOrEqual(1);
      }
    }
  });
});
