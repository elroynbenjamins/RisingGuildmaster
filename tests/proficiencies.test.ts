import { describe, expect, it } from "vitest";
import { SKILLS } from "../src/data/proficiencies/skills";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { generateSkillProficiencies, getProficiencyBonus } from "../src/game/proficiencies/proficiencyService";
import { resolveAbilityCheck } from "../src/game/world/worldEventResolver";
import { createSeededRandom } from "../src/utils/random";
import { sequenceRandom } from "./combatTestUtils";

describe("D20 skill proficiencies", () => {
  it("defines all eighteen standard skills and their governing attributes", () => {
    expect(Object.keys(SKILLS)).toHaveLength(18);
    expect(SKILLS.athletics.attribute).toBe("strength");
    expect(SKILLS.stealth.attribute).toBe("dexterity");
    expect(SKILLS.perception.attribute).toBe("wisdom");
  });

  it("uses the standard level-based proficiency progression", () => {
    expect([1, 4, 5, 9, 13, 17, 20].map(getProficiencyBonus)).toEqual([2, 2, 3, 4, 5, 6, 6]);
  });

  it("derives proficiencies from class and background and adds them to checks", () => {
    expect(generateSkillProficiencies("ranger", "street_urchin")).toEqual(["survival", "perception", "stealth", "sleight_of_hand"]);
    const hero = generateHero(createSeededRandom(8), { classId: "ranger", backgroundId: "street_urchin" });
    const result = resolveAbilityCheck({ attribute: "wisdom", skillId: "perception", difficultyClass: 10 }, [hero], sequenceRandom([.45]));
    expect(result.proficiencyBonus).toBe(2);
    expect(result.skillId).toBe("perception");
  });
});
