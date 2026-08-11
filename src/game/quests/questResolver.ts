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
import { getTraitPercentage } from "../traits/traitService";
import type { MaterialId } from "../crafting/craftingTypes";
import { grantGuildmasterXp } from "../guildmaster/guildmasterProgression";
import type { HuntRewardProgress } from "../guild/types";

export function isCombatVictory(enemies: readonly { isAlive: boolean }[]): boolean { return enemies.every((enemy) => !enemy.isAlive); }
export function isCombatDefeat(heroes: readonly { isAlive: boolean }[]): boolean { return heroes.every((hero) => !hero.isAlive); }
export function advanceToNextEncounter(activeQuest: ActiveQuest, instances: readonly HeroCombatInstance[]): { activeQuest: ActiveQuest; heroInstances: HeroCombatInstance[]; complete: boolean } {
  const quest = getQuestDefinition(activeQuest.questDefinitionId);
  const nextIndex = activeQuest.currentEncounterIndex + 1;
  if (nextIndex >= quest.encounterIds.length) return { activeQuest, heroInstances: [...instances], complete: true };
  return { activeQuest: { ...activeQuest, currentEncounterIndex: nextIndex }, heroInstances: instances.map(recoverBetweenEncounters), complete: false };
}

export function rollHuntFragment(progress: HuntRewardProgress, firstVictoryCount: number, repeatDropChance: number, pityAfterFailures: number, random: RandomSource): { amount: number; progress: HuntRewardProgress } {
  const firstVictory = progress.victories === 0;
  const pityTriggered = !firstVictory && progress.failuresSinceFragment >= pityAfterFailures;
  const dropped = firstVictory || pityTriggered || random.next() < repeatDropChance;
  return {
    amount: firstVictory ? firstVictoryCount : dropped ? 1 : 0,
    progress: { victories: progress.victories + 1, failuresSinceFragment: dropped ? 0 : progress.failuresSinceFragment + 1 },
  };
}

export function getQuestXpForHero(hero: Hero, quest: ReturnType<typeof getQuestDefinition>): number {
  if (quest.questType !== "contract" || quest.recommendedLevelMax === undefined || hero.level <= quest.recommendedLevelMax) return quest.xpRewardPerHero;
  const levelsAbove = hero.level - quest.recommendedLevelMax;
  return Math.max(1, Math.round(quest.xpRewardPerHero * Math.max(.1, 1 - levelsAbove * .25)));
}

function persistHeroOutcome(hero: Hero, instance: HeroCombatInstance, xp: number, random: RandomSource): Hero {
  const defeated = !instance.isAlive || instance.currentHP <= 0;
  let conditions = [...hero.conditions];
  for (const active of instance.activeConditions) {
    if (COMBAT_CONDITIONS[active.conditionId]?.persistsAfterCombat && active.conditionId === "infected") conditions = addCondition(conditions, "infected");
  }
  const injuryChance = Math.max(0, Math.min(1, .15 * (1 + getTraitPercentage(hero, "injuryChance"))));
  if (defeated || (instance.currentHP / instance.maxHP <= .20 && random.next() < injuryChance)) conditions = addCondition(conditions, "injured");
  return grantHeroXp({ ...hero, currentHP: defeated ? 0 : instance.currentHP, conditions, isAvailable: !defeated }, defeated ? Math.round(xp * .5) : xp);
}

export function resolveQuestVictory(activeQuest: ActiveQuest, party: Party, guild: GuildState, instances: readonly HeroCombatInstance[], random: RandomSource): { activeQuest: ActiveQuest; guild: GuildState } {
  const quest = getQuestDefinition(activeQuest.questDefinitionId); const partyHeroes = guild.heroes.filter((hero) => party.heroIds.includes(hero.id)); const goldModifier = partyHeroes.reduce((sum, hero) => sum + getTraitPercentage(hero, "questGold"), 0); const gold = Math.max(0, Math.round(rollQuestGold(quest, random) * (1 + goldModifier)));
  const byId = new Map(instances.map((instance) => [instance.heroId, instance]));
  const heroes = guild.heroes.map((hero) => party.heroIds.includes(hero.id) && byId.has(hero.id) ? persistHeroOutcome(hero, byId.get(hero.id)!, getQuestXpForHero(hero, quest), random) : hero);
  const lootTable = QUEST_LOOT_TABLES[quest.lootTableId]; const lootId = lootTable?.itemIds.length ? random.pick(lootTable.itemIds) : null; const collectedMaterials: Partial<Record<MaterialId, number>> = {};
  for (const drop of lootTable?.materialDrops ?? []) { const amount = random.int(drop.quantityMin, drop.quantityMax); if (amount > 0) collectedMaterials[drop.materialId] = amount; }
  const huntRewardProgress = { ...guild.huntRewardProgress };
  if (quest.huntReward) {
    const previous = huntRewardProgress[quest.id] ?? { victories: 0, failuresSinceFragment: 0 };
    const rolled = rollHuntFragment(previous, quest.huntReward.firstVictoryCount, quest.huntReward.repeatDropChance, quest.huntReward.pityAfterFailures, random);
    huntRewardProgress[quest.id] = rolled.progress;
    if (rolled.amount > 0) collectedMaterials[quest.huntReward.recipeFragmentMaterialId] = (collectedMaterials[quest.huntReward.recipeFragmentMaterialId] ?? 0) + rolled.amount;
  }
  const materials = { ...guild.materials }; for (const [id, amount] of Object.entries(collectedMaterials) as [MaterialId, number][]) materials[id] = (materials[id] ?? 0) + amount;
  return { activeQuest: { ...activeQuest, status: "victory", goldEarned: gold, xpEarnedPerHero: quest.xpRewardPerHero, collectedLootIds: lootId ? [lootId] : [], collectedMaterials }, guild: { ...guild, guildmaster: grantGuildmasterXp(guild.guildmaster, quest.difficulty * 35), gold: guild.gold + gold, heroes, materials, huntRewardProgress, inventory: lootId ? [...guild.inventory, lootId] : guild.inventory } };
}

export function resolveQuestDefeat(activeQuest: ActiveQuest, party: Party, guild: GuildState, instances: readonly HeroCombatInstance[], random: RandomSource): { activeQuest: ActiveQuest; guild: GuildState } {
  const byId = new Map(instances.map((instance) => [instance.heroId, instance]));
  const heroes = guild.heroes.map((hero) => party.heroIds.includes(hero.id) && byId.has(hero.id) ? persistHeroOutcome(hero, { ...byId.get(hero.id)!, currentHP: 0, isAlive: false }, 0, random) : hero);
  return { activeQuest: { ...activeQuest, status: "defeat" }, guild: { ...guild, heroes } };
}
