import { describe, expect, it } from "vitest";
import { TRAITS } from "../src/data/traits/traits";
import { ATTRIBUTE_KEYS } from "../src/game/attributes/types";

describe("D&D-style trait rules", () => {
  it("does not alter permanent ability scores or obsolete attribute growth", () => {
    const forbiddenTargets = new Set<string>([...ATTRIBUTE_KEYS, "intelligenceGrowth"]);
    for (const trait of Object.values(TRAITS)) {
      expect(trait.modifiers.filter((modifier) => forbiddenTargets.has(modifier.target)), trait.id).toEqual([]);
    }
  });
});
