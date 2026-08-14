import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_ABILITIES } from "../src/data/enemies/enemyAbilities";
import { ENEMY_FACTIONS } from "../src/data/enemies/factions";
import { ENEMY_LOOT_TABLES } from "../src/data/loot/enemyLootTables";
import { rollEnemyRewards } from "../src/game/enemies/enemyService";
import { createSeededRandom } from "../src/utils/random";

describe("enemy data integrity and rewards", () => {
  it("retains the foundation roster and adds the campaign enemies", () => {
    expect(Object.keys(ENEMIES)).toHaveLength(37);
    expect(ENEMIES.goblin_chieftain).toBeDefined();
    expect(ENEMIES).toMatchObject({ goblin_wardbreaker: { role: "debuffer" }, spiderling_swarm: { factionId: "beasts" }, webspinner: { factionId: "beasts" }, spider_broodguard: { factionId: "beasts" }, spider_queen: { role: "mini_boss" }, ashscale_vermin: { factionId: "beasts" }, cinder_touched_bandit: { role: "debuffer" }, wardstone_scale_guardian: { role: "mini_boss" } });
  });
  it("retains the five initial factions and adds Ward Constructs", () => expect(Object.keys(ENEMY_FACTIONS)).toEqual(["goblins", "undead", "beasts", "bandits", "orcs", "constructs"]));
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
