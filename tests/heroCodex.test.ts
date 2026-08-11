import { describe, expect, it } from "vitest";
import { CLASS_CODEX, RACE_CODEX } from "../src/data/codex/heroCodex";
import { CLASSES } from "../src/data/classes/classes";
import { RACES } from "../src/data/races/races";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";

describe("Heroes' Codex data", () => {
  it("documents all four current playable races", () => {
    expect(Object.keys(RACE_CODEX).sort()).toEqual(Object.keys(RACES).sort());
    expect(Object.keys(RACE_CODEX)).toHaveLength(4);
  });
  it("documents all six current playable classes", () => {
    expect(Object.keys(CLASS_CODEX).sort()).toEqual(Object.keys(CLASSES).sort());
    expect(Object.keys(CLASS_CODEX)).toHaveLength(6);
  });
  it("references shared combat skill definitions", () => {
    for (const heroClass of Object.values(CLASSES)) expect(heroClass.skillIds.every((skillId) => HERO_SKILLS[skillId])).toBe(true);
  });
});
