import { describe, expect, it } from "vitest";
import { ENCOUNTERS } from "../src/data/enemies/encounters";
import { ENEMIES } from "../src/data/enemies";
import { createEncounter } from "../src/game/enemies/encounterFactory";
import { createEnemyInstance } from "../src/game/enemies/enemyFactory";
import { createSeededRandom } from "../src/utils/random";

const base = { hp: 100, physicalDamage: 10, physicalDefense: 10, magicDamage: 10, magicDefense: 10, speed: 10 };

describe("enemy factories", () => {
  it("creates an independent runtime enemy at full HP", () => {
    const before = structuredClone(ENEMIES.troll!);
    const enemy = createEnemyInstance("troll", base, createSeededRandom(1), { level: 3 });
    expect(enemy).toMatchObject({ enemyDefinitionId: "troll", level: 3, currentHP: 180, maxHP: 180, activeConditionIds: [], isAlive: true });
    enemy.currentHP = 1;
    expect(ENEMIES.troll).toEqual(before);
  });
  it("generates every test encounter with unique instance IDs", () => {
    expect(Object.keys(ENCOUNTERS)).toHaveLength(9);
    for (const template of Object.values(ENCOUNTERS)) {
      const enemies = createEncounter(template.id, base, createSeededRandom(42));
      expect(enemies).toHaveLength(template.enemies.reduce((sum, entry) => sum + entry.count, 0));
      expect(new Set(enemies.map((enemy) => enemy.instanceId)).size).toBe(enemies.length);
    }
  });
});
