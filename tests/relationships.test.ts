import { describe, expect, it } from "vitest";
import { healingReceivedFromHeroModifier, relationshipBand, relationshipCombatBonuses, setRelationship } from "../src/game/relationships/relationshipService";
import { combatUnit } from "./combatTestUtils";
describe("hero relationships", () => {
  it("maps and clamps relationship bands", () => { expect(relationshipBand(-100)).toBe("rival"); expect(relationshipBand(-21)).toBe("dislike"); expect(relationshipBand(20)).toBe("neutral"); expect(relationshipBand(21)).toBe("friend"); expect(relationshipBand(100)).toBe("close_friend"); });
  it("grants adjacent friends +1 attack roll", () => { const relations = setRelationship([], "a", "b", 40); expect(relationshipCombatBonuses("a", [combatUnit("a", "heroes", { position: { x: 1, y: 1 } }), combatUnit("b", "heroes", { position: { x: 2, y: 1 } })], relations).attackRollModifier).toBe(1); });
  it("gives rivals damage tension and reduced mutual healing", () => { const relations = setRelationship([], "a", "b", -80); expect(relationshipCombatBonuses("a", [combatUnit("a", "heroes"), combatUnit("b", "heroes")], relations).physicalDamageModifier).toBe(.05); expect(healingReceivedFromHeroModifier("a", "b", relations)).toBe(-.10); });
});
