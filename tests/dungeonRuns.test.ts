import { describe, expect, it } from "vitest";
import { DUNGEON_NODES, DUNGEON_RUN_MODIFIERS } from "../src/data/dungeons/dungeons";
import { availableDungeonNodeIds, chooseDungeonNode, markDungeonNodeResolved, startDungeonRun } from "../src/game/dungeons/dungeonService";
import { getDungeonCatchupXpTarget, getDungeonEnemyLevelModifier, getRogueliteXpForHero } from "../src/game/dungeons/dungeonRunService";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
describe("branching dungeon runs", () => {
  it("requires node resolution before offering three routes and allows branches to merge", () => { let run = startDungeonRun("wardstone_depths", ["brutal_host"]); expect(availableDungeonNodeIds(run)).toEqual([]); run = markDungeonNodeResolved(run, "Seal opened"); expect(availableDungeonNodeIds(run)).toEqual(["depths_combat", "depths_elite", "depths_trial"]); expect(() => chooseDungeonNode(run, "depths_boss")).toThrow("not connected"); run = chooseDungeonNode(run, "depths_elite"); expect(run.currentNodeId).toBe("depths_elite"); expect(run.status).toBe("active"); expect(DUNGEON_NODES.depths_combat?.nextNodeIds).toEqual(["depths_treasure"]); expect(DUNGEON_NODES.depths_elite?.nextNodeIds).toEqual(["depths_treasure"]); });
  it("defines all seven node types and explicit rest values", () => { expect(new Set(Object.values(DUNGEON_NODES).map((node) => node.type))).toEqual(new Set(["combat", "elite", "event", "treasure", "rest", "merchant", "boss"])); expect(DUNGEON_NODES.depths_rest).toMatchObject({ healMaxHpModifier: .25, manaRecoveryModifier: .40, staminaRecoveryModifier: .40 }); });
  it("uses decimal risk and reward run modifiers", () => { expect(DUNGEON_RUN_MODIFIERS.brutal_host).toMatchObject({ rewardGoldModifier: .30, scoreBonus: 100 }); expect(DUNGEON_RUN_MODIFIERS.withered_grace).toMatchObject({ healingPowerModifier: -.25, rareLootModifier: .20, scoreBonus: 100 }); expect(DUNGEON_RUN_MODIFIERS.predators_clock).toMatchObject({ enemyInitiativeModifier: 2 }); });
  it("targets about twenty percent of a level from a full successful catch-up run", () => { for (const level of [5,6,7,8,9,10]) expect(getDungeonCatchupXpTarget(level)).toBe(Math.round(xpRequiredForNextLevel(level) * .20)); });
  it("keeps late-game expeditions relevant by scaling enemies upward without reducing veteran XP", () => {
    expect(getDungeonEnemyLevelModifier(8, 8)).toBe(0);
    expect(getDungeonEnemyLevelModifier(8, 12)).toBe(4);
    expect(getDungeonEnemyLevelModifier(13, 17)).toBe(4);
    expect(getRogueliteXpForHero(2400, 17, 17)).toBe(2400);
    expect(getRogueliteXpForHero(2400, 18, 17)).toBe(2400);
  });

  it("accelerates XP only for heroes below the drafted party reference level", () => {
    expect(getRogueliteXpForHero(1000, 12, 13)).toBe(3100);
    expect(getRogueliteXpForHero(1000, 13, 13)).toBe(1000);
    expect(getRogueliteXpForHero(1000, 14, 13)).toBe(1000);
  });

  it("lets two successful low-combat routes bridge a typical one-level replacement gap", () => {
    for (const referenceLevel of [13, 17]) {
      const fullTarget = getDungeonCatchupXpTarget(referenceLevel);
      const guardXp = Math.round(fullTarget * .30);
      const bossXp = Math.round(fullTarget * .45);
      const replacementLevel = referenceLevel - 1;
      const twoLowCombatClears = 2 * (
        getRogueliteXpForHero(guardXp, replacementLevel, referenceLevel)
        + getRogueliteXpForHero(bossXp, replacementLevel, referenceLevel)
      );
      expect(twoLowCombatClears).toBeGreaterThanOrEqual(xpRequiredForNextLevel(replacementLevel));
    }
  });
});
