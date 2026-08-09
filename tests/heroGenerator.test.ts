import { describe, expect, it } from "vitest";
import { generateCandidates, generateHero } from "../src/game/heroes/heroGenerator";
import { createSeededRandom } from "../src/utils/random";
describe("hero generation", () => { it("is deterministic with a seed", () => expect(generateHero(createSeededRandom(42))).toEqual(generateHero(createSeededRandom(42)))); it("creates three unique, JSON-serializable candidates", () => { const heroes = generateCandidates(createSeededRandom(7)); expect(heroes).toHaveLength(3); expect(new Set(heroes.map((hero) => hero.id)).size).toBe(3); expect(() => JSON.parse(JSON.stringify(heroes))).not.toThrow(); }); });
