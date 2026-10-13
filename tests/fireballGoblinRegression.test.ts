import { describe, expect, it } from "vitest";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { CLASSES } from "../src/data/classes/classes";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { getAreaTargetableKeys } from "../src/game/combat/areaTargetService";
import { performHeroTurn, createCombatState } from "../src/game/combat/combatEngine";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";
import { combatUnit } from "./combatTestUtils";
import { getHeroSkillAvailability } from "../src/game/combat/heroActionService";
import { createHeroCombatInstance } from "../src/game/combat/heroCombatFactory";

describe("Fireball and early goblin combat safety", () => {
  it("does not highlight empty blasts that would throw No valid target", () => {
    const actor = combatUnit("mage", "heroes", { position: { x: 1, y: 2 } });
    const enemy = combatUnit("goblin", "enemies", { position: { x: 5, y: 2 } });
    const board = createCombatBoard();
    const keys = getAreaTargetableKeys(HERO_SKILLS.mage_fireball!, actor, [enemy], board, CLASSES.mage);
    expect(keys.has("5,2")).toBe(true);
    expect(keys.has("4,2")).toBe(true);
    expect(keys.has("1,2")).toBe(false);
    expect(keys.has("1,1")).toBe(false);
  });

  it("allows a Fireball that reaches a goblin through the blast radius", () => {
    const mage = { ...testHero(), id: "mage", classId: "mage" as const };
    const actor = combatUnit("mage", "heroes", { position: { x: 1, y: 2 } });
    const enemy = combatUnit("goblin", "enemies", { position: { x: 6, y: 2 } });
    const board = createCombatBoard();
    const instance = createHeroCombatInstance(mage);
    instance.currentMana = 100;
    instance.maxMana = 100;
    expect(getAreaTargetableKeys(HERO_SKILLS.mage_fireball!, actor, [enemy], board, CLASSES.mage).has("5,2")).toBe(true);
    expect(getHeroSkillAvailability(mage, instance, actor, "mage_fireball", [actor], [enemy], board).enabled).toBe(true);
  });

  it("removes dead goblins from the Fireball area targets", () => {
    const actor = combatUnit("mage", "heroes", { position: { x: 1, y: 2 } });
    const enemy = combatUnit("goblin", "enemies", { position: { x: 5, y: 2 }, isAlive: false, currentHP: 0 });
    expect(getAreaTargetableKeys(HERO_SKILLS.mage_fireball!, actor, [enemy], createCombatBoard(), CLASSES.mage).size).toBe(0);
  });

  it("creates the early Goblin Patrol encounter and handles a Fireball cast without crashing", () => {
    const mage = { ...testHero(), id: "mage", classId: "mage" as const, level: 2 };
    const warrior = { ...testHero(), id: "warrior" };
    const state = createCombatState("goblin_patrol", 0, [mage, warrior], createSeededRandom(19));
    expect(state.enemies.length).toBeGreaterThan(0);
    const mageCombatant = state.heroes.find((item) => item.hero.id === mage.id)!;
    const enemy = state.enemies.find((item) => item.unit.isAlive)!;
    const combat = {
      ...state,
      awaitingHeroId: mage.id,
      combatStarted: true,
      turnOrderIds: [mage.id, ...state.turnOrderIds.filter((id) => id !== mage.id)],
      turnCursor: 0,
      heroes: state.heroes.map((item) => item.hero.id === mage.id ? {
        ...item, instance: { ...item.instance, currentMana: Math.max(30, item.instance.currentMana), maxMana: Math.max(30, item.instance.maxMana) },
      } : item),
    };
    const keys = getAreaTargetableKeys(HERO_SKILLS.mage_fireball!, mageCombatant.unit, combat.enemies.map((item) => item.unit), combat.board, CLASSES.mage);
    const center = combat.board.tiles.find((tile) => keys.has(`${tile.position.x},${tile.position.y}`) && Math.abs(tile.position.x - enemy.unit.position.x) + Math.abs(tile.position.y - enemy.unit.position.y) <= 1);
    if (center) {
      const after = performHeroTurn(combat, "mage_fireball", createSeededRandom(7), undefined, center.position);
      expect(after.log.at(-1)?.actionId).toBe("mage_fireball");
      expect(after.actions.combatActionUsed).toBe(true);
    } else {
      // The encounter can spawn behind line-of-sight cover: the spell is correctly unusable.
      expect(keys.size).toBe(0);
    }
  });
});
