import { describe, expect, it } from "vitest";
import { determineTurnOrder, rollInitiative } from "../src/game/combat/turnOrder";
import { combatUnit, sequenceRandom } from "./combatTestUtils";
describe("turn order", () => {
  it("uses D20 plus initiative modifier and excludes defeated units", () => { const quick = combatUnit("quick", "heroes", { stats: { ...combatUnit("x").stats, initiativeBonus: 4 } }); const lucky = combatUnit("lucky", "enemies"); const dead = combatUnit("dead", "enemies", { isAlive: false }); const rolls = rollInitiative([quick, lucky, dead], sequenceRandom([.45, .70])); expect(rolls.map(({ combatantId, d20, modifier, total }) => ({ combatantId, d20, modifier, total }))).toEqual([{ combatantId: "lucky", d20: 15, modifier: 0, total: 15 }, { combatantId: "quick", d20: 10, modifier: 4, total: 14 }]); });
  it("breaks equal totals with the higher modifier", () => { const dexterous = combatUnit("dex", "heroes", { stats: { ...combatUnit("x").stats, initiativeBonus: 3 } }); const slow = combatUnit("slow", "enemies"); expect(determineTurnOrder([slow, dexterous], sequenceRandom([.60, .45])).map((unit) => unit.combatantId)).toEqual(["dex", "slow"]); });
});
