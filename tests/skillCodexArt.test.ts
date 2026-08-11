import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { ENEMY_SKILL_ICON_COORDINATES, HERO_SKILL_ICON_COORDINATES, getSkillIconArt, getSkillIconCoordinate } from "../src/data/skills/skillArt";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { getSkillDescriptionLines } from "../src/game/combat/skillDescription";

describe("skill artwork and Codex data", () => {
  it("gives every hero skill a valid authored atlas coordinate", () => {
    for (const id of Object.keys(HERO_SKILLS)) { const coordinate = HERO_SKILL_ICON_COORDINATES[id]; expect(coordinate, id).toBeDefined(); expect(coordinate!.column).toBeGreaterThanOrEqual(0); expect(coordinate!.column).toBeLessThan(6); expect(coordinate!.row).toBeGreaterThanOrEqual(0); expect(coordinate!.row).toBeLessThan(6); }
  });

  it("gives enemy skills stable icons and readable mechanics", () => {
    const discoveredIds = ENEMIES.goblin_scout!.skillIds;
    for (const id of discoveredIds) { expect(getSkillIconCoordinate(id)).toEqual(getSkillIconCoordinate(id)); expect(getSkillDescriptionLines(ENEMY_SKILLS[id]!)).not.toHaveLength(0); }
  });

  it("uses the dedicated enemy ability atlas for authored enemy actions", () => {
    expect(ENEMY_SKILL_ICON_COORDINATES.goblin_stab).toBeDefined(); expect(getSkillIconArt("goblin_stab").atlas).toBe("enemy"); expect(getSkillIconArt("mage_fireball").atlas).toBe("hero");
  });
});
