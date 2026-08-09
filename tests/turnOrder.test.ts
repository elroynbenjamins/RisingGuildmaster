import { describe, expect, it } from "vitest";
import { determineTurnOrder } from "../src/game/combat/turnOrder";
import { combatUnit, sequenceRandom } from "./combatTestUtils";
describe("turn order", () => { it("sorts living units by current speed and uses centralized RNG for ties", () => { const slow = combatUnit("slow", "heroes", { stats: { ...combatUnit("x").stats, speed: 10 } }); const tiedA = combatUnit("a", "heroes"); const tiedB = combatUnit("b", "enemies"); const dead = combatUnit("dead", "enemies", { isAlive: false }); expect(determineTurnOrder([slow, tiedA, tiedB, dead], sequenceRandom([0, .8, .2, .1])).map((unit) => unit.combatantId)).toEqual(["b", "a", "slow"]); }); });
