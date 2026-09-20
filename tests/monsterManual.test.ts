import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { MONSTER_LORE } from "../src/data/enemies/monsterLore";
import { discoverEnemies, getMonsterManualProgress, isEnemyDiscovered } from "../src/game/enemies/monsterManualService";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";

describe("Monster Manual discovery", () => {
  it("starts hidden and reveals encountered definitions without duplicates", () => {
    const guild = createGuild(); expect(getMonsterManualProgress(guild)).toEqual({ discovered: 0, total: Object.keys(ENEMIES).length });
    const discovered = discoverEnemies(guild, ["goblin_scout", "goblin_archer", "goblin_scout"]);
    expect(discovered.discoveredEnemyIds).toEqual(["goblin_scout", "goblin_archer"]);
    expect(isEnemyDiscovered(discovered, "goblin_scout")).toBe(true);
    expect(getMonsterManualProgress(discovered).discovered).toBe(2);
  });

  it("ignores unknown IDs and returns the same state when nothing changes", () => {
    const guild = createGuild(); expect(discoverEnemies(guild, ["not_a_real_enemy"])).toBe(guild);
    const once = discoverEnemies(guild, ["troll"]); expect(discoverEnemies(once, ["troll"])).toBe(once);
  });

  it("persists discoveries and provides lore for every current enemy", () => {
    const guild = discoverEnemies(createGuild(), ["dire_wolf", "troll"]); const loaded = deserializeGuild(serializeGuild(guild));
    expect(loaded.discoveredEnemyIds).toEqual(["dire_wolf", "troll"]);
    expect(Object.keys(ENEMIES).every((id) => Boolean(MONSTER_LORE[id]))).toBe(true);
  });

  it("migrates saves created before the manual existed", () => {
    const legacy = JSON.parse(serializeGuild(createGuild())); delete legacy.discoveredEnemyIds;
    expect(deserializeGuild(JSON.stringify(legacy)).discoveredEnemyIds).toEqual([]);
  });
});
