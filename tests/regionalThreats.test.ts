import { describe, expect, it } from "vitest";
import { advanceRegionalThreats, canUnlockRegionalThreats, getRegionThreatEffects, isSettlementAvailable, unlockRegionalThreats } from "../src/game/world/regionalThreatService";
import { createWorldState } from "../src/game/world/worldState";
describe("regional world threats", () => {
  it("stays locked until six heroes reach level 2", () => { const world = createWorldState(); expect(advanceRegionalThreats(world, 100)).toEqual(world); expect(canUnlockRegionalThreats(Array.from({ length: 5 }, () => ({ level: 2 })))).toBe(false); expect(canUnlockRegionalThreats([...Array.from({ length: 5 }, () => ({ level: 2 })), { level: 1 }])).toBe(false); expect(canUnlockRegionalThreats(Array.from({ length: 6 }, () => ({ level: 2 })))).toBe(true); });
  it("escalates an ignored Shadowfen crisis every 20 days", () => { let world = advanceRegionalThreats(unlockRegionalThreats(createWorldState()), 40); expect(world.regionThreat?.shadowfen).toBe(2); expect(getRegionThreatEffects(world, "shadowfen").enemyLevelModifier).toBe(1); world = advanceRegionalThreats(world, 20); expect(getRegionThreatEffects(world, "shadowfen")).toMatchObject({ enemyCountModifier: .25, contractGoldModifier: .25 }); world = advanceRegionalThreats(world, 20); expect(isSettlementAvailable(world, "blackwater")).toBe(false); });
  it("evacuates the guild from a settlement when escalation closes it", () => {
    let world = unlockRegionalThreats(createWorldState());
    world = {
      ...world,
      currentRegionId: "shadowfen",
      currentSettlementId: "blackwater",
      unlockedRegionIds: [...new Set([...world.unlockedRegionIds, "shadowfen"])],
      regionCrisisDays: { shadowfen: 79 },
      regionThreat: { shadowfen: 3 },
    };
    world = advanceRegionalThreats(world, 1);
    expect(world.regionThreat?.shadowfen).toBe(4);
    expect(world.currentRegionId).toBe("shadowfen");
    expect(world.currentSettlementId).toBeNull();
    expect(isSettlementAvailable(world, "blackwater")).toBe(false);
    expect(isSettlementAvailable(world, "mirewatch")).toBe(true);
  });

  it("stops escalation after the linked quest is completed", () => { const world = { ...unlockRegionalThreats(createWorldState()), completedQuestIds: ["hunt_spider_queen"] }; expect(advanceRegionalThreats(world, 100)).toEqual(world); });
});
