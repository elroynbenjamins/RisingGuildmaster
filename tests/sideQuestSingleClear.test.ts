import { describe, expect, it } from "vitest";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUESTS } from "../src/data/quests/quests";
import { SETTLEMENTS } from "../src/data/world/settlements";
import type { HeroCombatInstance } from "../src/game/combat/combatTypes";
import { createGuild } from "../src/game/guild/guildService";
import { resolveQuestVictory } from "../src/game/quests/questResolver";
import { startQuest } from "../src/game/quests/questService";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

const instance = (heroId: string): HeroCombatInstance => ({ heroId, currentHP: 212, maxHP: 212, currentMana: 100, maxMana: 100, currentStamina: 100, maxStamina: 100, activeConditions: [], activeCooldowns: {}, isAlive: true, position: { x: 1, y: 2 }, movementRange: 3 });

describe("one-time side quests", () => {
  it("makes every visible side quest single-clear and assigns it to a real settlement", () => {
    const sideQuests = Object.values(QUESTS).filter((quest) => quest.questType === "side" && !quest.hiddenFromQuestBoard);
    expect(sideQuests.length).toBeGreaterThan(0);
    for (const quest of sideQuests) {
      expect(quest.repeatable, quest.id).toBe(false);
      expect(quest.settlementIds?.length, quest.id).toBeGreaterThan(0);
      for (const settlementId of quest.settlementIds ?? []) expect(SETTLEMENTS[settlementId], `${quest.id} -> ${settlementId}`).toBeDefined();
    }
  });

  it("guarantees material entries that formerly had a zero-minimum drop on the single clear", () => {
    const quest = QUESTS.ashes_of_blackbridge!;
    expect(quest.lootTableId).toBeDefined();
    const lootTable = quest.lootTableId ? QUEST_LOOT_TABLES[quest.lootTableId] : undefined;
    const zeroMinimumDrop = lootTable?.materialDrops?.find((drop) => drop.quantityMin === 0);
    expect(zeroMinimumDrop).toBeDefined();

    const heroes = ["sq1", "sq2", "sq3"].map((id) => ({ ...testHero(), id, name: id }));
    const guild = { ...createGuild(), heroes };
    const party = { id: "side-party", heroIds: heroes.map((hero) => hero.id) };
    const result = resolveQuestVictory(startQuest(quest, party), party, guild, heroes.map((hero) => instance(hero.id)), sequenceRandom([]));

    expect(result.activeQuest.collectedMaterials[zeroMinimumDrop!.materialId]).toBeGreaterThanOrEqual(1);
  });

  it("guarantees a hunt fragment because a visible hunt no longer has repeat attempts", () => {
    const quest = QUESTS.coils_of_the_sunken_grove!;
    expect(quest.repeatable).toBe(false);
    const heroes = ["hunt1", "hunt2", "hunt3"].map((id) => ({ ...testHero(), id, name: id, level: 5 }));
    const guild = { ...createGuild(), heroes };
    const party = { id: "hunt-party", heroIds: heroes.map((hero) => hero.id) };
    const result = resolveQuestVictory(startQuest(quest, party), party, guild, heroes.map((hero) => instance(hero.id)), sequenceRandom([]));

    expect(result.activeQuest.collectedMaterials.serpent_recipe_fragment).toBe(quest.huntReward?.firstVictoryCount ?? 1);
  });
});
