import { describe, expect, it } from "vitest";
import { applyModifiers } from "../src/game/modifiers/modifierEngine";
import type { Modifier } from "../src/game/modifiers/types";
const m = (operation: Modifier["operation"], value: number, condition?: Modifier["condition"]): Modifier => ({ source: "trait", sourceId: "test", target: "strength", operation, value, condition });
describe("modifiers", () => {
  it.each([["flat positive", 10, [m("flat", 3)], 13], ["flat negative", 10, [m("flat", -3)], 7], ["percentage positive", 10, [m("percentage", .1)], 11], ["percentage negative", 10, [m("percentage", -.1)], 9]])("applies %s", (_n, base, mods, result) => expect(applyModifiers(base as number, "strength", mods as Modifier[])).toBeCloseTo(result as number));
  it("applies flat before combined percentages", () => expect(applyModifiers(10, "strength", [m("flat", 5), m("percentage", .1), m("percentage", .2)])).toBeCloseTo(19.5));
  it("evaluates conditions", () => { const mod = m("flat", 4, { type: "hpRatioAtMost", value: .5 }); expect(applyModifiers(10, "strength", [mod], { currentHP: 40, maxHP: 100 })).toBe(14); expect(applyModifiers(10, "strength", [mod], { currentHP: 60, maxHP: 100 })).toBe(10); });
  it("removal removes the effect", () => { const mods = [m("flat", 5)]; expect(applyModifiers(10, "strength", mods)).toBe(15); expect(applyModifiers(10, "strength", [])).toBe(10); });
});
