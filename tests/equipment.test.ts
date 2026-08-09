import { describe, expect, it } from "vitest";
import { equipItem, unequipSlot } from "../src/game/equipment/equipmentService";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { testHero } from "./testHero";
describe("equipment", () => { it("changes calculated values but never base attributes", () => { const original = testHero(); const equipped = equipItem(original, "worn-sword"); expect(equipped.baseAttributes).toEqual(original.baseAttributes); expect(calculateHero(equipped).attributes.strength).toBe(calculateHero(original).attributes.strength + 2); const removed = unequipSlot(equipped, "weapon"); expect(calculateHero(removed).attributes.strength).toBe(calculateHero(original).attributes.strength); expect(removed.baseAttributes).toEqual(original.baseAttributes); }); it("enforces class restrictions", () => expect(() => equipItem({ ...testHero(), classId: "mage" }, "worn-sword")).toThrow()); });
