import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_PORTRAITS } from "../src/data/enemies/enemyPortraits";
import { HERO_PORTRAIT_KEYS } from "../src/data/heroes/heroPortraits";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { ASH_STORY_SKILL_ICON_COORDINATES, DROWNED_SEVENTH_CHAPTER_9_SKILL_ICON_COORDINATES, ENEMY_SKILL_EXPANSION_A_COORDINATES, ENEMY_SKILL_EXPANSION_B_COORDINATES, ENEMY_SKILL_ICON_COORDINATES, GREENVEIL_CHAPTER_6_SKILL_ICON_COORDINATES, HERO_SKILL_ICON_COORDINATES, IRON_HILLS_CHAPTER_7_SKILL_ICON_COORDINATES, WESTERN_SEA_CHAPTER_8_SKILL_ICON_COORDINATES } from "../src/data/skills/skillArt";
import { GAME_ICON_COORDINATES, GAME_ICON_IDS } from "../src/data/ui/gameIcons";

describe("visual asset registry coverage", () => {
  it("covers every playable race, class and supported gender portrait", () => {
    expect(HERO_PORTRAIT_KEYS).toHaveLength(154);
    expect(new Set(HERO_PORTRAIT_KEYS).size).toBe(154);
  });

  it("gives every enemy definition an authored portrait crop", () => {
    expect(Object.keys(ENEMIES).filter((id) => !ENEMY_PORTRAITS[id])).toEqual([]);
  });

  it("keeps Chapter 5 campaign enemies on distinct authored cells", () => {
    const ids=["glasswing_stalker","ashbound_sentinel","cinder_keeper","solkar_ash_herald"];
    expect(new Set(ids.map((id)=>{const art=ENEMY_PORTRAITS[id]!;return `${art.atlasId}:${art.column}:${art.row}`;})).size).toBe(ids.length);
    expect(ids.every((id)=>ENEMY_PORTRAITS[id]?.atlasId==="ashlandsChapter5")).toBe(true);
  });

  it("gives each Guildhaven sewer enemy a distinct authored portrait", () => {
    const ids=["sewer_rat","giant_rat","sewer_slime"];
    expect(new Set(ids.map((id)=>{const art=ENEMY_PORTRAITS[id]!;return `${art.atlasId}:${art.column}:${art.row}`;})).size).toBe(3);
    expect(ids.every((id)=>ENEMY_PORTRAITS[id]?.atlasId==="guildhavenSewers")).toBe(true);
  });

  it("gives every combat skill an explicit icon instead of the hash fallback", () => {
    expect(Object.keys(HERO_SKILLS).filter((id) => !HERO_SKILL_ICON_COORDINATES[id])).toEqual([]);
    expect(Object.keys(ENEMY_SKILLS).filter((id) => !ENEMY_SKILL_ICON_COORDINATES[id] && !ASH_STORY_SKILL_ICON_COORDINATES[id] && !ENEMY_SKILL_EXPANSION_A_COORDINATES[id] && !ENEMY_SKILL_EXPANSION_B_COORDINATES[id] && !GREENVEIL_CHAPTER_6_SKILL_ICON_COORDINATES[id] && !IRON_HILLS_CHAPTER_7_SKILL_ICON_COORDINATES[id] && !WESTERN_SEA_CHAPTER_8_SKILL_ICON_COORDINATES[id] && !DROWNED_SEVENTH_CHAPTER_9_SKILL_ICON_COORDINATES[id])).toEqual([]);
  });

  it("keeps every UI icon inside the six-by-six atlas", () => {
    expect(Object.keys(GAME_ICON_COORDINATES).sort()).toEqual([...GAME_ICON_IDS].sort());
    for (const coordinate of Object.values(GAME_ICON_COORDINATES)) {
      expect(coordinate.column).toBeGreaterThanOrEqual(0); expect(coordinate.column).toBeLessThan(6);
      expect(coordinate.row).toBeGreaterThanOrEqual(0); expect(coordinate.row).toBeLessThan(6);
    }
  });
});
