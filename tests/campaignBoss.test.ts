import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { getAuraModifiersForEnemy } from "../src/game/combat/passiveService";
import { createEnemyInstance } from "../src/game/enemies/enemyFactory";
import { createSeededRandom } from "../src/utils/random";
import { QUESTS } from "../src/data/quests/quests";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { createQuestEncounter } from "../src/game/quests/encounterFactory";
const base = { hp: 100, physicalDamage: 10, physicalDefense: 10, magicDamage: 10, magicDefense: 10, speed: 10 };
describe("Goblin Chieftain boss", () => { it("uses explicit boss multipliers and multiple skills", () => expect(ENEMIES.goblin_chieftain).toMatchObject({ hpModifier: 1, physicalDamageModifier: .2, physicalDefenseModifier: .15, speedModifier: .05, skillIds: expect.arrayContaining(["chieftain_cleave", "chieftain_war_cry", "chieftain_presence", "desperate_command"]) })); it("activates Desperate Command at 40 percent without mutating definitions", () => { const random = createSeededRandom(4); const chief = createEnemyInstance("goblin_chieftain", base, random); const ally = createEnemyInstance("goblin_scout", base, random); expect(getAuraModifiersForEnemy([{ ...chief, currentHP: chief.maxHP * .41 }, ally], ally).map((modifier) => modifier.value)).not.toContain(.2); expect(getAuraModifiersForEnemy([{ ...chief, currentHP: chief.maxHP * .4 }, ally], ally)).toEqual(expect.arrayContaining([expect.objectContaining({ stat: "physicalDamage", value: .2 }), expect.objectContaining({ stat: "speed", value: .1 })])); }); });

describe("Goblin Chieftain difficulty gate", () => {
  it("requires an attrition encounter before the reinforced boss warband", () => {
    expect(QUESTS.goblin_chieftain_boss).toMatchObject({ difficulty: 5, recommendedLevelMin: 4, encounterIds: ["chieftain_outer_guard_encounter", "goblin_chieftain_encounter"] });
    expect(createQuestEncounter("chieftain_outer_guard_encounter", createSeededRandom(7))).toHaveLength(3);
    expect(createQuestEncounter("goblin_chieftain_encounter", createSeededRandom(7))).toHaveLength(5);
  });

  it("gives the Chieftain elite encounter scaling and a real adjacent cleave", () => {
    const chief = createQuestEncounter("goblin_chieftain_encounter", createSeededRandom(8)).find((enemy) => enemy.instance.enemyDefinitionId === "goblin_chieftain")!;
    expect(chief.instance.maxHP).toBeGreaterThan(350);
    expect(ENEMY_SKILLS.chieftain_cleave).toMatchObject({ targetType: "all_enemies", range: 1 });
  });
});
