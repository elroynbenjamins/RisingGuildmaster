import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { REGIONS } from "../src/data/world/regions";

const hunts = ["coils_of_the_sunken_grove", "teeth_below_guildhaven", "white_maw_of_frostmarch"] as const;

describe("regional monster hunts", () => {
  it("defines three repeatable regional side quests with exploration, encounters, and trophy loot", () => {
    for (const questId of hunts) {
      const quest = QUESTS[questId]!;
      expect(quest).toMatchObject({ questType: "side", repeatable: true });
      expect(quest.explorationStageIds).toHaveLength(3);
      expect(quest.huntReward).toMatchObject({ firstVictoryCount: 1, repeatDropChance: .40, pityAfterFailures: 3 });
      expect(quest.encounterIds).toHaveLength(2);
      expect(QUEST_LOOT_TABLES[quest.lootTableId]).toBeDefined();
      for (const encounterId of quest.encounterIds) {
        const encounter = QUEST_ENCOUNTERS[encounterId]!;
        expect(encounter).toBeDefined();
        expect(BATTLEFIELDS[encounter.battlefieldId]).toBeDefined();
      }
    }
  });

  it("places every hunt in its regional quest pool", () => {
    expect(REGIONS.greenveil?.questPoolIds).toEqual(expect.arrayContaining(["coils_of_the_sunken_grove", "teeth_below_guildhaven"]));
    expect(REGIONS.frostmarch?.questPoolIds).toContain("white_maw_of_frostmarch");
  });

  it("gives each signature monster numerical mechanics", () => {
    expect(ENEMIES.great_forest_serpent?.skillIds).toEqual(expect.arrayContaining(["serpent_constrict", "venom_spit", "coiled_fury"]));
    expect(ENEMY_SKILLS.serpent_constrict?.conditionApplications?.[0]).toMatchObject({ conditionId: "stunned", chance: .30 });
    expect(ENEMIES.sewer_crocodile?.skillIds).toContain("death_roll");
    expect(ENEMY_SKILLS.death_roll?.damageMultiplier).toBe(1.35);
    expect(ENEMIES.frostmarch_yeti?.skillIds).toEqual(expect.arrayContaining(["avalanche_roar", "whiteout_fury"]));
    expect(ENEMY_SKILLS.whiteout_fury?.conditionalModifiers?.[0]?.conditions.selfHpRatioMax).toBe(.40);
  });

  it("uses unique lair battlefields for all three final encounters", () => {
    expect(QUEST_ENCOUNTERS.great_forest_serpent_boss?.battlefieldId).toBe("serpent_sunken_grove");
    expect(QUEST_ENCOUNTERS.sewer_crocodile_boss?.battlefieldId).toBe("guildhaven_sewer_cistern");
    expect(QUEST_ENCOUNTERS.frostmarch_yeti_boss?.battlefieldId).toBe("white_maw_lair");
  });
});
