import { describe, expect, it } from "vitest";
import { COMPANION_PORTRAITS, isCompanionPortraitId } from "../src/data/companions/companionArt";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { COMPANIONS } from "../src/data/companions/companions";

describe("companion portrait coverage", () => {
  it("provides artwork for every companion summoned by a hero skill", () => {
    const companionIds = Object.values(HERO_SKILLS).flatMap((skill) => skill.companion ? [skill.companion.id] : []);
    expect(companionIds.length).toBeGreaterThan(0);
    expect(companionIds.every(isCompanionPortraitId)).toBe(true);
  });

  it("uses a distinct standalone portrait for every companion", () => {
    expect(Object.values(COMPANION_PORTRAITS).every(Boolean)).toBe(true);
    expect(new Set(Object.values(COMPANION_PORTRAITS)).size).toBe(3);
  });

  it("provides player-facing metadata for every portrait", () => {
    expect(Object.keys(COMPANIONS).sort()).toEqual(Object.keys(COMPANION_PORTRAITS).sort());
    expect(Object.values(COMPANIONS).every(({ name, role, description }) => name && role && description)).toBe(true);
  });
});
