import { describe, expect, it } from "vitest";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { QUESTS } from "../src/data/quests/quests";
import type { HeroCombatInstance } from "../src/game/combat/combatTypes";
import { createGuild } from "../src/game/guild/guildService";
import { createQuestEncounter } from "../src/game/quests/encounterFactory";
import { getLevelAppropriateQuestLootIds, getQuestEnemyXpPool, getQuestXpForHero, isCombatDefeat, isCombatVictory, resolveQuestDefeat, resolveQuestVictory } from "../src/game/quests/questResolver";
import { startQuest } from "../src/game/quests/questService";
import { createSeededRandom } from "../src/utils/random";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";
import { EQUIPMENT } from "../src/data/equipment/equipment";
const instance = (values: Partial<HeroCombatInstance> = {}): HeroCombatInstance => ({ heroId: "hero-test", currentHP: 100, maxHP: 100, currentMana: 10, maxMana: 100, currentStamina: 10, maxStamina: 100, activeConditions: [], activeCooldowns: {}, isAlive: true, position: { x: 1, y: 2 }, movementRange: 3, ...values });

describe("quest loop", () => {
  it("generates every leveled encounter", () => { for (const encounter of Object.values(QUEST_ENCOUNTERS)) expect(createQuestEncounter(encounter.id, createSeededRandom(2))).toHaveLength(encounter.enemies.reduce((sum, entry) => sum + entry.count, 0)); });
  it("recognizes victory and defeat", () => { expect(isCombatVictory([{ isAlive: false }])).toBe(true); expect(isCombatDefeat([{ isAlive: false }])).toBe(true); });
  it("combines shared enemy and objective XP, then applies potential", () => { const quest = QUESTS.goblin_patrol!; expect(getQuestEnemyXpPool(quest)).toBe(300); expect(getQuestXpForHero({ ...testHero(), potential: 50 }, quest, 2)).toBe(450); expect(getQuestXpForHero({ ...testHero(), potential: 100 }, quest, 2)).toBe(675); });
  it("boosts level-three side quest authored XP by twenty five percent", () => {
    expect(QUESTS.echoes_of_mosswatch).toMatchObject({ questType: "side", recommendedLevelMin: 3, xpRewardPerHero: 875 });
    expect(QUESTS.brambleway_caravan?.xpRewardPerHero).toBe(800);
    expect(QUESTS.hunt_spider_queen?.xpRewardPerHero).toBe(320);
  });
  it("awards shared XP, gold, loot, materials and history", () => { const healthy = testHero(); const fallen = { ...testHero(), id: "h2" }; const guild = { ...createGuild(), heroes: [healthy, fallen] }; const party = { id: "p", heroIds: [healthy.id, fallen.id] }; const result = resolveQuestVictory(startQuest(QUESTS.goblin_patrol!, party), party, guild, [instance(), instance({ heroId: "h2", currentHP: 0, isAlive: false })], sequenceRandom([0, .9, 0, .5, .5])); expect(result.guild.heroes[0]?.xp).toBe(450); expect(result.guild.heroes[1]?.xp).toBe(225); expect(result.guild.inventory).toHaveLength(1); expect(result.guild.materials.iron_ore).toBeGreaterThan(0); expect(result.guild.heroes[0]?.history.questsCompleted).toBe(1); });
  it("keeps early quest gear within the roster's usable level range", () => {
    const heroes = [{ ...testHero(), id: "h2", level: 2 }, { ...testHero(), id: "h3", level: 3 }, { ...testHero(), id: "h4", level: 4 }];
    const candidates = getLevelAppropriateQuestLootIds(["steel-greatsword", "iron-warhammer", "topaz-precision-ring"], heroes);
    expect(candidates).toContain("iron-warhammer");
    expect(candidates).toContain("topaz-precision-ring");
    expect(candidates).not.toContain("steel-greatsword");
    const fallback = getLevelAppropriateQuestLootIds(["steel-greatsword"], heroes);
    expect(fallback.length).toBeGreaterThan(0);
    expect(fallback.every((id) => EQUIPMENT[id] && EQUIPMENT[id]!.levelRequirement >= 2 && EQUIPMENT[id]!.levelRequirement <= 4)).toBe(true);
  });
  it("can lose one equipped item on death without mutating definitions", () => { const hero = { ...testHero(), equipment: { ...testHero().equipment, weapon: "worn-sword" } }; const guild = { ...createGuild(), heroes: [hero] }; const party = { id: "p", heroIds: [hero.id, "support"] }; const result = resolveQuestDefeat(startQuest(QUESTS.goblin_patrol!, party), party, guild, [instance({ currentHP: 0, isAlive: false })], sequenceRandom([0])); expect(result.guild.heroes[0]?.equipment.weapon).toBeNull(); });
});
