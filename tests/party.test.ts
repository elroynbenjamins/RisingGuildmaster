import { describe, expect, it } from "vitest";
import { addHeroToParty, createParty } from "../src/game/party/partyService";
import { validateParty } from "../src/game/party/partyValidator";
import { testHero } from "./testHero";
describe("party system", () => {
  it("requires one to four heroes", () => { expect(validateParty(createParty(), [testHero()]).valid).toBe(false); const heroes = Array.from({ length: 5 }, (_, i) => ({ ...testHero(), id: `h${i}` })); expect(validateParty({ id: "p", heroIds: heroes.map((hero) => hero.id) }, heroes).valid).toBe(false); expect(validateParty({ id: "p", heroIds: heroes.slice(0, 4).map((hero) => hero.id) }, heroes).valid).toBe(true); });
  it("rejects duplicates, missing, dead, and unavailable heroes", () => { const hero = testHero(); expect(validateParty({ id: "p", heroIds: [hero.id, hero.id, "missing"] }, [hero]).errors).toHaveLength(2); expect(() => addHeroToParty(createParty(), { ...hero, currentHP: 0 })).toThrow(); expect(() => addHeroToParty(createParty(), { ...hero, isAvailable: false })).toThrow(); });
});
