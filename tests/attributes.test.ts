import { describe, expect, it } from "vitest";
import { calculateDerivedStats } from "../src/game/attributes/derivedStats";
describe("derived statistics", () => { it("calculates every formula", () => { expect(calculateDerivedStats({ strength: 10, dexterity: 20, constitution: 8, intelligence: 12, wisdom: 14, charisma: 5 })).toEqual({ maxHP: 200, physicalAttack: 60, physicalDefense: 34, magicPower: 76, magicDefense: 54, speed: 50, criticalChance: 0.15 }); }); });
