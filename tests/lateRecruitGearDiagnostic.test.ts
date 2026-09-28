import { describe, it } from "vitest";
import { generateRecruitmentCandidate } from "../src/game/recruitment/candidateGenerator";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { createSeededRandom } from "../src/utils/random";
import type { ClassId } from "../src/game/heroes/types";

describe("late recruit gear diagnostic", () => {
  it("reports primary gear lag for higher-level recruits", () => {
    const classes: ClassId[] = ["warrior","ranger","mage","cleric","paladin","berserker","monk","bard","spellbow","bulwark","summoner"];
    for (const level of [12, 14, 16]) {
      for (const [index, classId] of classes.entries()) {
        const candidate = generateRecruitmentCandidate(
          createSeededRandom(20_000 + level * 100 + index),
          10,
          80,
          "standard",
          "human",
          classId,
          undefined,
          undefined,
          { standard: { min: level, max: level } },
        );
        const weapon = EQUIPMENT[candidate.heroPreview.equipment.weapon!]!;
        const armor = EQUIPMENT[candidate.heroPreview.equipment.armor!]!;
        console.log("RECRUIT_GEAR", {
          level,
          classId,
          weapon: weapon.id,
          weaponLevel: weapon.levelRequirement,
          weaponLag: level - weapon.levelRequirement,
          weaponEffects: weapon.specialEffectIds.length,
          armor: armor.id,
          armorLevel: armor.levelRequirement,
          armorLag: level - armor.levelRequirement,
          armorEffects: armor.specialEffectIds.length,
        });
      }
    }
  });
});
