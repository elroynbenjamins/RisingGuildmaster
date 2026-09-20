import { describe, expect, it } from "vitest";
import { getSkillDescriptionLines } from "../src/game/combat/skillDescription";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";

describe("skill descriptions", () => {
  it("explains damage, accuracy, resources, and cooldowns numerically", () => {
    const lines = getSkillDescriptionLines(HERO_SKILLS.warrior_power_strike!);
    expect(lines).toContain("Deals 1.50× physical damage.");
    expect(lines).toContain("Attack roll modifier: -2.");
    expect(lines).toContain("Accuracy modifier: -10%.");
    expect(lines).toContain("Costs 30 stamina.");
    expect(lines).toContain("Cooldown: 2 turns.");
  });

  it("explains areas and applied conditions", () => {
    const lines = getSkillDescriptionLines(HERO_SKILLS.mage_fireball!);
    expect(lines).toContain("Affects an area with radius 1; allies are safe.");
    expect(lines).toContain("20% chance to apply burning for 2 turns.");
  });

  it("explains passive triggers", () => {
    const lines = getSkillDescriptionLines(HERO_SKILLS.berserker_rage!);
    expect(lines.join(" ")).toContain("self HP ≤ 50%");
    expect(lines.join(" ")).toContain("physicalDamage +25%");
  });

  it("explains healing based on maximum HP", () => {
    const lines = getSkillDescriptionLines(HERO_SKILLS.cleric_heal!);
    expect(lines).toContain("Heals 25% of the target's maximum HP.");
  });
});
