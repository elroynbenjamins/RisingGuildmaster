import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_PORTRAITS } from "../src/data/enemies/enemyPortraits";
import { HERO_PORTRAIT_KEYS } from "../src/data/heroes/heroPortraits";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { GENERATED_SKILL_ICON_ART, SKILL_ICON_ALIASES } from "../src/data/skills/generatedSkillIconArt";
import { SKILL_ICON_ART } from "../src/data/skills/skillIconArt";
import { GAME_ICON_ART } from "../src/data/ui/gameIconArt";
import { GAME_ICON_IDS } from "../src/data/ui/gameIcons";

describe("visual asset registry coverage", () => {
  it("covers every playable race, class and supported gender portrait", () => {
    expect(HERO_PORTRAIT_KEYS).toHaveLength(154);
    expect(new Set(HERO_PORTRAIT_KEYS).size).toBe(154);
  });

  it("gives every enemy definition an authored standalone portrait", () => {
    expect(Object.keys(ENEMIES).filter((id) => !ENEMY_PORTRAITS[id])).toEqual([]);
  });

  it("keeps Chapter 5 campaign enemies on distinct authored portraits", () => {
    const ids=["glasswing_stalker","ashbound_sentinel","cinder_keeper","solkar_ash_herald"];
    expect(new Set(ids.map((id)=>ENEMY_PORTRAITS[id])).size).toBe(ids.length);
    expect(ids.every((id)=>Boolean(ENEMY_PORTRAITS[id]))).toBe(true);
  });

  it("gives each Guildhaven sewer enemy a distinct authored portrait", () => {
    const ids=["sewer_rat","giant_rat","sewer_slime"];
    expect(new Set(ids.map((id)=>ENEMY_PORTRAITS[id])).size).toBe(3);
    expect(ids.every((id)=>Boolean(ENEMY_PORTRAITS[id]))).toBe(true);
  });

  it("gives every combat skill an explicit icon instead of the hash fallback", () => {
    const hasIcon = (id: string) => {
      const resolvedId = SKILL_ICON_ALIASES[id] ?? id;
      return Boolean(SKILL_ICON_ART[resolvedId] ?? GENERATED_SKILL_ICON_ART[resolvedId]);
    };
    expect(Object.keys(HERO_SKILLS).filter((id) => !hasIcon(id))).toEqual([]);
    expect(Object.keys(ENEMY_SKILLS).filter((id) => !hasIcon(id))).toEqual([]);
  });

  it("gives every UI icon a standalone source", () => {
    expect(Object.keys(GAME_ICON_ART).sort()).toEqual([...GAME_ICON_IDS].sort());
    expect(Object.values(GAME_ICON_ART).every(Boolean)).toBe(true);
  });
});
