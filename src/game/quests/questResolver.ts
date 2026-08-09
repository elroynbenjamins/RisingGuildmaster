import { COMBAT_CONDITIONS } from "../../data/conditions/combatConditions";
import { QUEST_LOOT_TABLES } from "../../data/loot/questLootTables";
import type { RandomSource } from "../../utils/random";
import { addCondition } from "../conditions/conditionService";
import type { HeroCombatInstance } from "../combat/combatTypes";
import { recoverBetweenEncounters } from "../combat/resourceService";
import type { GuildState } from "../guild/types";
import type { Hero } from "../heroes/types";
import type { Party } from "../party/partyTypes";
import { grantHeroXp } from "../progression/levelSystem";
import { getQuestDefinition, rollQuestGold } from "./questService";
import type { ActiveQuest } from "./questTypes";

export function isCombatVictory(enemies: readonly { isAlive: boolean }[]): boolean { return enemies.every((enemy) => !enemy.isAlive); }
export function isCombatDefeat(heroes: readonly { isAlive: boolean }[]): boolean { return heroes.every((hero) => !hero.isAlive); }
export function advanceToNextEncounter(activeQuest: ActiveQuest, instances: readonly HeroCombatInstance[]): { activeQuest: ActiveQuest; heroInstances: HeroCombatInstance[]; complete: boolean } {
  const quest = getQuestDefinition(activeQuest.questDefinitionId);
  const nextIndex = activeQuest.currentEncounterIndex + 1;
  if (nextIndex >= quest.encounterIds.length) return { activeQuest, heroInstances: [...instances], complete: true };
  return { activeQuest: { ...activeQuest, currentEncounterIndex: nextIndex }, heroInstances: instances.map(recoverBetweenEncounters), complete: false };
}

function persistHeroOutcome(hero: Hero, instance: HeroCombatInstance, xp: number, random: RandomSource): Hero {
  const defeated = !instance.isAlive || instance.currentHP <= 0;
  let conditions = [...hero.conditions];
  for (const active of instance.activeConditions) {
    if (COMBAT_CONDITIONS[active.conditionId]?.persistsAfterCombat && active.conditionId === "infected") conditions = addCondition(conditions, "infected");
  }
  if (defeated || (instance.currentHP / instance.maxHP <= .20 && random.next() < .15)) conditions = addCondition(conditions, "injured");
  return grantHeroXp({ ...hero, currentHP: defeated ? 1 : instance.currentHP, conditions, isAvailable: true }, defeated ? Math.round(xp * .5) : xp);
}

export function resolveQuestVictory(activeQuest: ActiveQuest, party: Party, guild: GuildState, instances: readonly HeroCombatInstance[], random: RandomSource): { activeQuest: ActiveQuest; guild: GuildState } {
  const quest = getQuestDefinition(activeQuest.questDefinitionId); const gold = rollQuestGold(quest, random);
  const byId = new Map(instances.map((instance) => [instance.heroId, instance]));
  const heroes = guild.heroes.map((hero) => party.heroIds.includes(hero.id) && byId.has(hero.id) ? persistHeroOutcome(hero, byId.get(hero.id)!, quest.xpRewardPerHero, random) : hero);
  const lootTable = QUEST_LOOT_TABLES[quest.lootTableId]; const lootId = lootTable?.itemIds.length ? random.pick(lootTable.itemIds) : null;
  return { activeQuest: { ...activeQuest, status: "victory", goldEarned: gold, xpEarnedPerHero: quest.xpRewardPerHero, collectedLootIds: lootId ? [lootId] : [] }, guild: { ...guild, gold: guild.gold + gold, heroes, inventory: lootId ? [...guild.inventory, lootId] : guild.inventory } };
}

export function resolveQuestDefeat(activeQuest: ActiveQuest, party: Party, guild: GuildState, instances: readonly HeroCombatInstance[], random: RandomSource): { activeQuest: ActiveQuest; guild: GuildState } {
  const byId = new Map(instances.map((instance) => [instance.heroId, instance]));
  const heroes = guild.heroes.map((hero) => party.heroIds.includes(hero.id) && byId.has(hero.id) ? persistHeroOutcome(hero, { ...byId.get(hero.id)!, currentHP: 0, isAlive: false }, 0, random) : hero);
  return { activeQuest: { ...activeQuest, status: "defeat" }, guild: { ...guild, heroes } };
}
