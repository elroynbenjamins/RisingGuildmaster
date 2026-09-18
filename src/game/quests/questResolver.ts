import { COMBAT_CONDITIONS } from "../../data/conditions/combatConditions";
import { QUEST_LOOT_TABLES } from "../../data/loot/questLootTables";
import { EQUIPMENT } from "../../data/equipment/equipment";
import type { RandomSource } from "../../utils/random";
import { addCondition, isInjuryCondition } from "../conditions/conditionService";
import { applyOutcomeInjury } from "../conditions/injuryService";
import type { HeroCombatInstance } from "../combat/combatTypes";
import { recoverBetweenEncounters } from "../combat/resourceService";
import type { GuildState } from "../guild/types";
import type { Hero } from "../heroes/types";
import type { Party } from "../party/partyTypes";
import { grantCampaignHeroXp } from "../progression/levelSystem";
import { getQuestDefinition, rollQuestGold } from "./questService";
import type { ActiveQuest } from "./questTypes";
import { getTraitPercentage } from "../traits/traitService";
import type { MaterialId } from "../crafting/craftingTypes";
import { grantGuildmasterXp } from "../guildmaster/guildmasterProgression";
import type { HuntRewardProgress } from "../guild/types";
import { recordQuestHistory } from "../heroes/heroHistoryService";
import { getDifficulty } from "../../data/difficulty/difficulties";
import { QUEST_ENCOUNTERS } from "../../data/encounters/questEncounters";
import { getEnemyDefinition } from "../../data/enemies";
import { potentialMultiplier } from "../progression/potential";
import { applyCombatEquipmentWear } from "../equipment/equipmentDurabilityService";
import { getGuildRank, getQuestReputationReward } from "../renown/guildLegacyService";

export function getLevelAppropriateQuestLootIds(itemIds: readonly string[], heroes: readonly Hero[]): string[] {
  if (!itemIds.length) return [];
  const highestHeroLevel = Math.max(1, ...heroes.map((hero) => hero.level));
  const preferredFloor = highestHeroLevel >= 2 && highestHeroLevel <= 4 ? 2 : Math.max(1, highestHeroLevel - 2);
  const isEligible = (itemId: string, minimumLevel: number) => {
    const item = EQUIPMENT[itemId];
    return !item || (item.levelRequirement >= minimumLevel && item.levelRequirement <= highestHeroLevel);
  };
  const preferred = itemIds.filter((itemId) => isEligible(itemId, preferredFloor));
  if (preferred.length) return preferred;
  const classIds = new Set(heroes.map((hero) => hero.classId));
  const levelMatchedFallback = Object.values(EQUIPMENT)
    .filter((item) => item.levelRequirement >= preferredFloor && item.levelRequirement <= highestHeroLevel && (!item.classRestrictions.length || item.classRestrictions.some((classId) => classIds.has(classId))))
    .map((item) => item.id);
  if (levelMatchedFallback.length) return levelMatchedFallback;
  const eligible = itemIds.filter((itemId) => isEligible(itemId, 1));
  if (eligible.length) return eligible;
  return Object.values(EQUIPMENT)
    .filter((item) => item.levelRequirement <= highestHeroLevel && (!item.classRestrictions.length || item.classRestrictions.some((classId) => classIds.has(classId))))
    .map((item) => item.id);
}

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

export function getQuestEnemyXpPool(quest: ReturnType<typeof getQuestDefinition>): number {
  return quest.encounterIds.reduce((total, encounterId) => total + (QUEST_ENCOUNTERS[encounterId]?.enemies.reduce((sum, group) => sum + getEnemyDefinition(group.enemyDefinitionId).xpReward * group.count, 0) ?? 0), 0);
}

export function getQuestXpForHero(hero: Hero, quest: ReturnType<typeof getQuestDefinition>, partySize = 1): number {
  const sharedEnemyXp = Math.max(0, Math.floor(getQuestEnemyXpPool(quest) / Math.max(1, partySize)));
  // Completion XP rewards objectives, checks, rescues, and other authored work that
  // is not represented by the number of enemies killed.
  const developmentBase = sharedEnemyXp + Math.max(0, quest.xpRewardPerHero);
  const potentialXp = Math.round(developmentBase * potentialMultiplier(hero.potential));
  if (quest.questType !== "contract" || quest.recommendedLevelMax === undefined || hero.level <= quest.recommendedLevelMax) return potentialXp;
  const levelsAbove = hero.level - quest.recommendedLevelMax;
  return Math.max(1, Math.round(potentialXp * Math.max(.1, 1 - levelsAbove * .25)));
}

function persistHeroOutcome(hero: Hero, instance: HeroCombatInstance, xp: number, random: RandomSource, guild: GuildState): Hero {
  const defeated = !instance.isAlive || instance.currentHP <= 0;
  let conditions = [...hero.conditions];
  for (const active of instance.activeConditions) {
    const definition = COMBAT_CONDITIONS[active.conditionId];
    if (definition?.persistsAfterCombat && definition.persistentConditionId) conditions = addCondition(conditions, definition.persistentConditionId);
  }
  const injuryChance = Math.max(0, Math.min(1, .15 * (1 + getTraitPercentage(hero, "injuryChance"))));
  if (defeated) conditions = applyOutcomeInjury(conditions, hero.id, "major");
  else if (instance.currentHP / instance.maxHP <= .20 && random.next() < injuryChance) conditions = applyOutcomeInjury(conditions, hero.id, "minor");
  let equipment = hero.equipment;
  if (defeated && random.next() < .10) {
    const equipped = Object.entries(hero.equipment).filter((entry): entry is [keyof Hero["equipment"], string] => Boolean(entry[1]));
    if (equipped.length) { const [lostSlot] = random.pick(equipped); equipment = { ...equipment, [lostSlot]: null }; }
  }
  const afterBattle = { ...hero, equipment, currentHP: defeated ? 0 : instance.currentHP, conditions, isAvailable: !defeated };
  const damageRatio = defeated ? 1 : Math.max(0, (hero.currentHP - instance.currentHP) / Math.max(1, instance.maxHP));
  const worn = applyCombatEquipmentWear(afterBattle, damageRatio, random).hero;
  return grantCampaignHeroXp(worn, defeated ? Math.round(xp * .5) : xp, guild.world);
}

export function resolveQuestVictory(activeQuest: ActiveQuest, party: Party, guild: GuildState, instances: readonly HeroCombatInstance[], random: RandomSource): { activeQuest: ActiveQuest; guild: GuildState } {
  const quest = getQuestDefinition(activeQuest.questDefinitionId); const partyHeroes = guild.heroes.filter((hero) => party.heroIds.includes(hero.id)); const goldModifier = partyHeroes.reduce((sum, hero) => sum + getTraitPercentage(hero, "questGold"), 0) + (quest.questType === "contract" ? getGuildRank(guild.reputation).benefits.contractGoldModifier : 0); const gold = Math.max(0, Math.round(rollQuestGold(quest, random) * (1 + goldModifier) * getDifficulty(guild.difficultyId).questGoldMultiplier));
  const byId = new Map(instances.map((instance) => [instance.heroId, instance]));
  const heroes = guild.heroes.map((hero) => {
    if (!party.heroIds.includes(hero.id) || !byId.has(hero.id)) return hero;
    const instance = byId.get(hero.id)!; const xp = getQuestXpForHero(hero, quest, partyHeroes.length);
    const persisted = persistHeroOutcome(hero, instance, xp, random, guild); const newInjury = persisted.conditions.find((condition) => isInjuryCondition(condition.conditionId) && !hero.conditions.some((old) => old.conditionId === condition.conditionId)); const newlyInjured = Boolean(newInjury);
    return recordQuestHistory(persisted, { day: guild.currentDay, questId: quest.id, questName: quest.name, victory: true, xpEarned: instance.isAlive && instance.currentHP > 0 ? xp : Math.round(xp * .5), fellInBattle: !instance.isAlive || instance.currentHP <= 0, newlyInjured, injuryConditionId: newInjury?.conditionId, previousLevel: hero.level });
  });
  const lootTable = QUEST_LOOT_TABLES[quest.lootTableId]; const lootCandidates = lootTable ? getLevelAppropriateQuestLootIds(lootTable.itemIds, guild.heroes) : []; const lootId = lootCandidates.length ? random.pick(lootCandidates) : null; const collectedMaterials: Partial<Record<MaterialId, number>> = {};
  for (const drop of lootTable?.materialDrops ?? []) { const amount = random.int(drop.quantityMin, drop.quantityMax); if (amount > 0) collectedMaterials[drop.materialId] = amount; }
  const huntRewardProgress = { ...guild.huntRewardProgress };
  if (quest.huntReward) {
    const previous = huntRewardProgress[quest.id] ?? { victories: 0, failuresSinceFragment: 0 };
    const rolled = rollHuntFragment(previous, quest.huntReward.firstVictoryCount, quest.huntReward.repeatDropChance, quest.huntReward.pityAfterFailures, random);
    huntRewardProgress[quest.id] = rolled.progress;
    if (rolled.amount > 0) collectedMaterials[quest.huntReward.recipeFragmentMaterialId] = (collectedMaterials[quest.huntReward.recipeFragmentMaterialId] ?? 0) + rolled.amount;
  }
  const materials = { ...guild.materials }; for (const [id, amount] of Object.entries(collectedMaterials) as [MaterialId, number][]) materials[id] = (materials[id] ?? 0) + amount;
  const unlockedRecipeIds = [...new Set([...(guild.unlockedRecipeIds ?? []), ...(quest.recipeUnlockIdsOnVictory ?? [])])];
  const reputationEarned=getQuestReputationReward(guild.reputation,quest.questType,quest.difficulty);
  const baseXpPerHero = Math.floor(getQuestEnemyXpPool(quest) / Math.max(1, partyHeroes.length)) + quest.xpRewardPerHero;
  return { activeQuest: { ...activeQuest, status: "victory", goldEarned: gold, xpEarnedPerHero: baseXpPerHero, collectedLootIds: lootId ? [lootId] : [], collectedMaterials }, guild: { ...guild, guildmaster: grantGuildmasterXp(guild.guildmaster, quest.difficulty * 35), gold: guild.gold + gold, reputation:guild.reputation+reputationEarned, heroes, materials, huntRewardProgress, unlockedRecipeIds, inventory: lootId ? [...guild.inventory, lootId] : guild.inventory } };
}

export function resolveQuestDefeat(activeQuest: ActiveQuest, party: Party, guild: GuildState, instances: readonly HeroCombatInstance[], random: RandomSource): { activeQuest: ActiveQuest; guild: GuildState } {
  const quest = getQuestDefinition(activeQuest.questDefinitionId);
  const byId = new Map(instances.map((instance) => [instance.heroId, instance]));
  const heroes = guild.heroes.map((hero) => {
    if (!party.heroIds.includes(hero.id) || !byId.has(hero.id)) return hero;
    const persisted = persistHeroOutcome(hero, { ...byId.get(hero.id)!, currentHP: 0, isAlive: false }, 0, random, guild); const newInjury = persisted.conditions.find((condition) => isInjuryCondition(condition.conditionId) && !hero.conditions.some((old) => old.conditionId === condition.conditionId));
    return recordQuestHistory(persisted, { day: guild.currentDay, questId: quest.id, questName: quest.name, victory: false, xpEarned: 0, fellInBattle: true, newlyInjured: Boolean(newInjury), injuryConditionId: newInjury?.conditionId, previousLevel: hero.level });
  });
  return { activeQuest: { ...activeQuest, status: "defeat" }, guild: { ...guild, heroes } };
}
