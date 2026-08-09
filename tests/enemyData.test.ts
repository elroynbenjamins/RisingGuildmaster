import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_ABILITIES } from "../src/data/enemies/enemyAbilities";
import { ENEMY_FACTIONS } from "../src/data/enemies/factions";
import { ENEMY_LOOT_TABLES } from "../src/data/loot/enemyLootTables";
import { rollEnemyRewards } from "../src/game/enemies/enemyService";
import { createSeededRandom } from "../src/utils/random";

describe("enemy data integrity and rewards", () => {
  it("retains the initial 12 enemies plus the Chapter 1 boss", () => { expect(Object.keys(ENEMIES)).toHaveLength(13); expect(ENEMIES.goblin_chieftain).toBeDefined(); });
  it("contains the five initial factions", () => expect(Object.keys(ENEMY_FACTIONS)).toEqual(["goblins", "undead", "beasts", "bandits", "orcs"]));
  it("resolves every ability and loot reference", () => {
    for (const enemy of Object.values(ENEMIES)) {
      expect(enemy.goldRewardMin).toBeLessThanOrEqual(enemy.goldRewardMax);
      expect(ENEMY_FACTIONS[enemy.factionId]).toBeDefined();
      expect(ENEMY_LOOT_TABLES[enemy.lootTableId]).toBeDefined();
      for (const id of enemy.abilityIds) expect(ENEMY_ABILITIES[id]).toBeDefined();
    }
  });
  it("rolls inclusive gold ranges and exposes XP and loot", () => {
    for (const enemy of Object.values(ENEMIES)) {
      const rewards = rollEnemyRewards(enemy, createSeededRandom(9));
      expect(rewards.gold).toBeGreaterThanOrEqual(enemy.goldRewardMin);
      expect(rewards.gold).toBeLessThanOrEqual(enemy.goldRewardMax);
      expect(rewards).toMatchObject({ xp: enemy.xpReward, lootTableId: enemy.lootTableId });
    }
  });
});
