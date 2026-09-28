import { describe, expect, it } from "vitest";
import { DUNGEON_NODES, DUNGEON_RUN_MODIFIERS } from "../src/data/dungeons/dungeons";
import { availableDungeonNodeIds, chooseDungeonNode, markDungeonNodeResolved, startDungeonRun } from "../src/game/dungeons/dungeonService";
import { getDungeonCatchupXpTarget, getDungeonEnemyLevelModifier, getExpeditionCacheTopItemIds, getRogueliteXpForHero } from "../src/game/dungeons/dungeonRunService";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { generateHero } from "../src/game/heroes/heroGenerator";
import type { ClassId, EquipmentSlot, Hero } from "../src/game/heroes/types";
import { createSeededRandom } from "../src/utils/random";
describe("branching dungeon runs", () => {
  it("requires node resolution before offering three routes and allows branches to merge", () => { let run = startDungeonRun("wardstone_depths", ["brutal_host"]); expect(availableDungeonNodeIds(run)).toEqual([]); run = markDungeonNodeResolved(run, "Seal opened"); expect(availableDungeonNodeIds(run)).toEqual(["depths_combat", "depths_elite", "depths_trial"]); expect(() => chooseDungeonNode(run, "depths_boss")).toThrow("not connected"); run = chooseDungeonNode(run, "depths_elite"); expect(run.currentNodeId).toBe("depths_elite"); expect(run.status).toBe("active"); expect(DUNGEON_NODES.depths_combat?.nextNodeIds).toEqual(["depths_treasure"]); expect(DUNGEON_NODES.depths_elite?.nextNodeIds).toEqual(["depths_treasure"]); });
  it("defines all seven node types and explicit rest values", () => { expect(new Set(Object.values(DUNGEON_NODES).map((node) => node.type))).toEqual(new Set(["combat", "elite", "event", "treasure", "rest", "merchant", "boss"])); expect(DUNGEON_NODES.depths_rest).toMatchObject({ healMaxHpModifier: .25, manaRecoveryModifier: .40, staminaRecoveryModifier: .40 }); });
  it("uses decimal risk and reward run modifiers", () => { expect(DUNGEON_RUN_MODIFIERS.brutal_host).toMatchObject({ rewardGoldModifier: .30, scoreBonus: 100 }); expect(DUNGEON_RUN_MODIFIERS.withered_grace).toMatchObject({ healingPowerModifier: -.25, rareLootModifier: .20, scoreBonus: 100 }); expect(DUNGEON_RUN_MODIFIERS.predators_clock).toMatchObject({ enemyInitiativeModifier: 2 }); });
  it("targets about twenty percent of a level from a full successful catch-up run", () => { for (const level of [5,6,7,8,9,10]) expect(getDungeonCatchupXpTarget(level)).toBe(Math.round(xpRequiredForNextLevel(level) * .20)); });
  it("uses catch-up caches on badly lagging weapons before accessories", () => {
    const classes: ClassId[] = ["warrior", "ranger", "cleric", "mage"];
    const bestUsable = (classId: ClassId, slot: EquipmentSlot, minLevel: number, maxLevel: number) =>
      Object.values(EQUIPMENT)
        .filter((item) => item.slot === slot && item.levelRequirement >= minLevel && item.levelRequirement <= maxLevel)
        .filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(classId))
        .sort((a, b) => b.levelRequirement - a.levelRequirement || b.value - a.value)[0];

    const party: Hero[] = classes.map((classId, index) => {
      const hero = generateHero(createSeededRandom(7400 + index), { classId });
      const oldWeapon = bestUsable(classId, "weapon", 1, 7)!;
      const oldArmor = bestUsable(classId, "armor", 1, 7)!;
      return { ...hero, id: `cache-${classId}`, level: 13, equipment: { ...hero.equipment, weapon: oldWeapon.id, armor: oldArmor.id } };
    });

    const candidates = getExpeditionCacheTopItemIds(party, [], false);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((id) => EQUIPMENT[id]?.slot === "weapon")).toBe(true);
    expect(candidates.every((id) => (EQUIPMENT[id]?.levelRequirement ?? 0) >= 11)).toBe(true);
  });

  it("uses catch-up caches on badly lagging armor once weapons are current", () => {
    const classes: ClassId[] = ["warrior", "ranger", "cleric", "mage"];
    const bestUsable = (classId: ClassId, slot: EquipmentSlot, minLevel: number, maxLevel: number) =>
      Object.values(EQUIPMENT)
        .filter((item) => item.slot === slot && item.levelRequirement >= minLevel && item.levelRequirement <= maxLevel)
        .filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(classId))
        .sort((a, b) => b.levelRequirement - a.levelRequirement || b.value - a.value)[0];

    const party: Hero[] = classes.map((classId, index) => {
      const hero = generateHero(createSeededRandom(7500 + index), { classId });
      const currentWeapon = bestUsable(classId, "weapon", 11, 12)!;
      const oldArmor = bestUsable(classId, "armor", 1, 7)!;
      return { ...hero, id: `cache-armor-${classId}`, level: 13, equipment: { ...hero.equipment, weapon: currentWeapon.id, armor: oldArmor.id } };
    });

    const candidates = getExpeditionCacheTopItemIds(party, [], false);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((id) => EQUIPMENT[id]?.slot === "armor")).toBe(true);
    expect(candidates.every((id) => (EQUIPMENT[id]?.levelRequirement ?? 0) >= 11)).toBe(true);
  });

  it("keeps late-game expeditions relevant by scaling enemies upward without reducing XP", () => { expect(getDungeonEnemyLevelModifier(8, 8)).toBe(0); expect(getDungeonEnemyLevelModifier(8, 12)).toBe(4); expect(getDungeonEnemyLevelModifier(13, 17)).toBe(4); expect(getRogueliteXpForHero(2400, 17, 10)).toBe(2400); });
});
