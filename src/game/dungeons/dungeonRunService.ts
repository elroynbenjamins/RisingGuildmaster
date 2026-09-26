import { DUNGEONS, DUNGEON_NODES, DUNGEON_RUN_MODIFIERS } from "../../data/dungeons/dungeons";
import { EQUIPMENT } from "../../data/equipment/equipment";
import { CRAFTING_RECIPES } from "../../data/crafting/recipes";
import type { RandomSource } from "../../utils/random";
import type { HeroCombatInstance, QuestCombatSetup } from "../combat/combatTypes";
import type { CombatState } from "../combat/combatEngine";
import { createHeroCombatInstance } from "../combat/heroCombatFactory";
import type { GuildState } from "../guild/types";
import { grantHeroXp } from "../progression/levelSystem";
import { finishRogueliteRun, resolveRogueliteRecipeDrop, startRogueliteRun } from "../roguelite/recipeRewardService";
import { resolveAbilityCheck, type AbilityCheckResult } from "../world/worldEventResolver";
import { markDungeonNodeResolved, startDungeonRun } from "./dungeonService";
import { DUNGEON_UNLOCK_HERO_COUNT } from "./dungeonDraftService";
import { isChapterOneComplete } from "./rogueliteRotationService";
import { getDifficulty } from "../../data/difficulty/difficulties";
import { calculateDungeonRunScore } from "./dungeonIntelService";
import { createRogueliteDungeonRecord } from "./rogueliteRotationTypes";
import { chooseDungeonBoon, offerDungeonBoonChoices, sumDungeonBoonValue } from "./dungeonBoonService";

export type DungeonMerchantChoice = "buy_supplies" | "leave";
export interface DungeonNodeResolution { guild: GuildState; check: AbilityCheckResult | null; text: string; goldDelta: number; recipeId: string | null }

function activeRun(guild: GuildState) { const run = guild.activeDungeonRun; if (!run || run.status !== "active") throw new Error("No active dungeon run"); return run; }
function rewardMultiplier(guild: GuildState): number { const run = activeRun(guild); return 1 + run.selectedModifierIds.reduce((sum, id) => sum + (DUNGEON_RUN_MODIFIERS[id]?.rewardGoldModifier ?? 0), 0) + sumDungeonBoonValue(run, "rewardGoldModifier"); }
function healingMultiplier(guild: GuildState): number { const run = activeRun(guild); const themeHealing = DUNGEONS[run.dungeonId]?.combatModifiers.heroHealingPowerModifier ?? 0; return Math.max(0, 1 + themeHealing + run.selectedModifierIds.reduce((sum, id) => sum + (DUNGEON_RUN_MODIFIERS[id]?.healingPowerModifier ?? 0), 0) + sumDungeonBoonValue(run, "heroHealingPowerModifier")); }
function scaledGold(guild: GuildState, amount: number): number { return Math.max(0, Math.round(amount * rewardMultiplier(guild) * getDifficulty(guild.difficultyId).questGoldMultiplier)); }
function updateRun(guild: GuildState, run: NonNullable<GuildState["activeDungeonRun"]>): GuildState { return { ...guild, activeDungeonRun: run }; }
function recoverInstances(instances: readonly HeroCombatInstance[], hpRatio: number, manaRatio: number, staminaRatio: number): HeroCombatInstance[] {
  return instances.map((instance) => instance.isAlive ? { ...instance, currentHP: Math.min(instance.maxHP, instance.currentHP + Math.round(instance.maxHP * hpRatio)), currentMana: Math.min(instance.maxMana, instance.currentMana + Math.round(instance.maxMana * manaRatio)), currentStamina: Math.min(instance.maxStamina, instance.currentStamina + Math.round(instance.maxStamina * staminaRatio)) } : instance);
}
export function getRogueliteXpForHero(baseXp: number, heroLevel: number, recommendedLevelMax: number): number {
  const levelsAbove = Math.max(0, heroLevel - recommendedLevelMax);
  const multiplier = levelsAbove === 0 ? 1 : levelsAbove === 1 ? .50 : levelsAbove === 2 ? .25 : levelsAbove === 3 ? .10 : 0;
  return Math.max(0, Math.round(baseXp * multiplier));
}
function syncHeroes(guild: GuildState, instances: readonly HeroCombatInstance[], xp = 0, recommendedLevelMax?: number): GuildState {
  const byId = new Map(instances.map((instance) => [instance.heroId, instance]));
  return { ...guild, heroes: guild.heroes.map((hero) => { const instance = byId.get(hero.id); if (!instance) return hero; const synced = { ...hero, currentHP: Math.round(instance.currentHP), isAvailable: instance.isAlive }; const earnedXp = recommendedLevelMax === undefined ? xp : getRogueliteXpForHero(xp, hero.level, recommendedLevelMax); return instance.isAlive ? grantHeroXp(synced, earnedXp) : synced; }) };
}

const DUNGEON_CACHE_EXCLUDED_IDS = new Set(Object.values(CRAFTING_RECIPES).filter((recipe) => Boolean(recipe.unlockSource) || recipe.id.startsWith("hunt_")).map((recipe) => recipe.outputEquipmentId));

export function chooseDungeonCacheEquipmentId(guild: GuildState, partyHeroIds: readonly string[], random: RandomSource): string | null {
  const party = guild.heroes.filter((hero) => partyHeroIds.includes(hero.id));
  if (!party.length) return null;
  const averageLevel = Math.max(1, Math.round(party.reduce((sum, hero) => sum + hero.level, 0) / party.length));
  const targetMin = Math.max(1, averageLevel - 2);
  const targetMax = Math.max(targetMin, averageLevel - 1);
  const ownedIds = new Set([...guild.inventory, ...party.flatMap((hero) => Object.values(hero.equipment).filter((id): id is string => Boolean(id)))]);
  const usable = (item: (typeof EQUIPMENT)[string]) => !item.classRestrictions.length || party.some((hero) => item.classRestrictions.includes(hero.classId));
  const isOrdinary = (item: (typeof EQUIPMENT)[string]) => !DUNGEON_CACHE_EXCLUDED_IDS.has(item.id) && !item.specialEffectIds.some((id) => id.includes("trophy"));
  const normal = Object.values(EQUIPMENT).filter((item) => isOrdinary(item) && usable(item) && item.levelRequirement >= targetMin && item.levelRequirement <= targetMax && (item.rarity === "common" || item.rarity === "uncommon"));
  const rare = Object.values(EQUIPMENT).filter((item) => isOrdinary(item) && usable(item) && item.levelRequirement >= targetMin && item.levelRequirement <= targetMax && item.rarity === "rare");
  let pool = random.next() < .15 && rare.length ? [...normal, ...rare] : normal;
  if (!pool.length) pool = rare;
  if (!pool.length) pool = Object.values(EQUIPMENT).filter((item) => isOrdinary(item) && usable(item) && item.levelRequirement >= Math.max(1, averageLevel - 3) && item.levelRequirement <= targetMax && ["common","uncommon","rare"].includes(item.rarity));
  if (!pool.length) return null;
  const uniquePool = pool.filter((item) => !ownedIds.has(item.id));
  if (uniquePool.length) pool = uniquePool;
  const score = (item: (typeof EQUIPMENT)[string]) => {
    let value = ownedIds.has(item.id) ? -4 : 2;
    for (const hero of party) {
      if (item.classRestrictions.length && !item.classRestrictions.includes(hero.classId)) continue;
      const currentId = hero.equipment[item.slot];
      const current = currentId ? EQUIPMENT[currentId] : undefined;
      if (!current) value += 8;
      else if (item.levelRequirement > current.levelRequirement) value += 4 + (item.levelRequirement - current.levelRequirement) * 2;
      else if (item.levelRequirement === current.levelRequirement && item.rarity === "rare" && current.rarity !== "rare") value += 2;
    }
    return value;
  };
  const ranked = [...pool].sort((a, b) => score(b) - score(a) || b.levelRequirement - a.levelRequirement || b.value - a.value || a.id.localeCompare(b.id));
  const bestScore = score(ranked[0]!);
  return random.pick(ranked.filter((item) => score(item) >= bestScore - 1).slice(0, 4)).id;
}

export function beginDungeonExpedition(guild: GuildState, dungeonId: string, partyHeroIds: string[], modifierIds: string[] = [], random?: RandomSource): GuildState {
  if (guild.activeDungeonRun || guild.activeRogueliteRun) throw new Error("Another dungeon run is already active");
  if (!isChapterOneComplete(guild)) throw new Error("Complete Chapter 1 to unlock Roguelite Expeditions");
  if (guild.currentDay < guild.rogueliteRotation.cooldownUntilDay) throw new Error(`Roguelite Expeditions recover on Day ${guild.rogueliteRotation.cooldownUntilDay}`);
  if (!guild.rogueliteRotation.offeredDungeonIds.includes(dungeonId)) throw new Error("Choose one of the three current expedition themes");
  if (guild.heroes.length < DUNGEON_UNLOCK_HERO_COUNT) throw new Error(`Roguelite Expeditions unlock at ${DUNGEON_UNLOCK_HERO_COUNT} owned heroes`);
  const party = guild.heroes.filter((hero) => partyHeroIds.includes(hero.id));
  if (party.length !== 4 || party.length !== new Set(partyHeroIds).size) throw new Error("A roguelite dungeon party requires exactly four unique drafted heroes");
  if (party.some((hero) => !hero.isAvailable || hero.currentHP <= 0)) throw new Error("Every dungeon hero must be available and alive");
  const partyAverageLevel = party.reduce((sum, hero) => sum + hero.level, 0) / party.length;
  const run = startDungeonRun(dungeonId, modifierIds, partyHeroIds, party.map(createHeroCombatInstance), random, guild.discoveredEnemyIds, partyAverageLevel);
  const withRoguelite = startRogueliteRun(guild, run.id);
  const record = guild.rogueliteRotation.records[dungeonId] ?? createRogueliteDungeonRecord();
  return { ...withRoguelite, recentPartyHeroIds: partyHeroIds, rogueliteRotation: { ...guild.rogueliteRotation, selectedDungeonId: dungeonId, records: { ...guild.rogueliteRotation.records, [dungeonId]: { ...record, attempts: record.attempts + 1 } } }, activeDungeonRun: run };
}

export function beginDungeonCombatCheckpoint(guild: GuildState, randomState: number): GuildState {
  const run = activeRun(guild); const node = DUNGEON_NODES[run.currentNodeId];
  if (!node || !["combat", "elite", "boss"].includes(node.type)) throw new Error("Current dungeon node is not a combat encounter");
  return updateRun(guild, { ...run, combatState: null, combatRandomState: randomState });
}

export function checkpointDungeonCombat(guild: GuildState, state: CombatState, randomState: number): GuildState {
  const run = activeRun(guild);
  if (state.questId !== "wardstone_depths_expedition") throw new Error("Dungeon combat checkpoint belongs to another combat");
  return updateRun(guild, { ...run, combatState: state, combatRandomState: randomState });
}

export function getDungeonCombatSetup(guild: GuildState): QuestCombatSetup {
  const run = activeRun(guild); const node = DUNGEON_NODES[run.currentNodeId]; const dungeon = DUNGEONS[run.dungeonId]; const encounterId = node ? run.selectedEncounterIds?.[node.id] ?? node.encounterId ?? node.encounterPoolIds?.[0] : undefined;
  if (!node || !dungeon || !encounterId || !["combat", "elite", "boss"].includes(node.type)) throw new Error("Current dungeon node is not a combat encounter");
  let enemyPhysicalDamageModifier = 0; let enemyDamageModifier = 0;
  for (const id of run.selectedModifierIds) for (const modifier of DUNGEON_RUN_MODIFIERS[id]?.enemyModifiers ?? []) {
    if (modifier.target === "physicalDamage") enemyPhysicalDamageModifier += modifier.value;
    if (modifier.target === "damage") enemyDamageModifier += modifier.value;
  }
  const theme = dungeon.combatModifiers; enemyPhysicalDamageModifier += theme.enemyPhysicalDamageModifier ?? 0; enemyDamageModifier += theme.enemyDamageModifier ?? 0;
  const oathEnemyInitiative = run.selectedModifierIds.reduce((sum, id) => sum + (DUNGEON_RUN_MODIFIERS[id]?.enemyInitiativeModifier ?? 0), 0);
  const oathEnemyMovement = run.selectedModifierIds.reduce((sum, id) => sum + (DUNGEON_RUN_MODIFIERS[id]?.enemyMovementRangeModifier ?? 0), 0);
  const heroHealingPowerModifier = run.selectedModifierIds.reduce((sum, id) => sum + (DUNGEON_RUN_MODIFIERS[id]?.healingPowerModifier ?? 0), 0) + (theme.heroHealingPowerModifier ?? 0) + sumDungeonBoonValue(run, "heroHealingPowerModifier");
  return { encounterIds: [encounterId], label: node.title, heroInitiativeModifier: (theme.heroInitiativeModifier ?? 0) + sumDungeonBoonValue(run, "heroInitiativeModifier"), enemyInitiativeModifier: (theme.enemyInitiativeModifier ?? 0) + oathEnemyInitiative + sumDungeonBoonValue(run, "enemyInitiativeModifier"), heroArmorClassModifier: sumDungeonBoonValue(run, "heroArmorClassModifier"), heroOpeningAttackRollModifier: sumDungeonBoonValue(run, "heroOpeningAttackRollModifier"), enemyOpeningAttackRollModifier: sumDungeonBoonValue(run, "enemyOpeningAttackRollModifier"), enemyPhysicalDamageModifier, enemyDamageModifier, heroHealingPowerModifier, heroMovementRangeModifier: (theme.heroMovementRangeModifier ?? 0) + sumDungeonBoonValue(run, "heroMovementRangeModifier"), enemyMovementRangeModifier: (theme.enemyMovementRangeModifier ?? 0) + oathEnemyMovement };
}

export function resolveDungeonUtilityNode(guild: GuildState, random: RandomSource, merchantChoice?: DungeonMerchantChoice): DungeonNodeResolution {
  const run = activeRun(guild); const node = DUNGEON_NODES[run.currentNodeId]; if (!node) throw new Error("Unknown dungeon node");
  if (run.resolvedNodeIds.includes(node.id)) throw new Error("Dungeon node has already been resolved");
  if (["combat", "elite", "boss"].includes(node.type)) throw new Error("Combat nodes must be won in tactical combat");
  let nextGuild = guild; let instances = run.heroInstances; let check: AbilityCheckResult | null = null; let goldDelta = 0; let text = "";
  if (node.type === "event") {
    if (!node.abilityCheck) throw new Error("Dungeon event has no ability check");
    const heroes = guild.heroes.filter((hero) => run.partyHeroIds.includes(hero.id)); check = resolveAbilityCheck(node.abilityCheck, heroes, random);
    goldDelta = check.success ? scaledGold(guild, node.successGoldReward ?? 0) : 0;
    if (!check.success && (node.failureDamageMaxHpModifier ?? 0) > 0) instances = instances.map((instance) => instance.isAlive ? { ...instance, currentHP: Math.max(1, instance.currentHP - Math.round(instance.maxHP * node.failureDamageMaxHpModifier!)) } : instance);
    text = check.success ? `The seal yields. D20 ${check.diceRoll} + ${check.modifier} = ${check.total}; the party recovers ${goldDelta} gold from the antechamber.` : `The route turns against them. D20 ${check.diceRoll} + ${check.modifier} = ${check.total} against DC ${check.difficultyClass}; each living hero loses ${Math.round((node.failureDamageMaxHpModifier ?? 0) * 100)}% max HP.`;
  } else if (node.type === "treasure") { goldDelta = scaledGold(guild, node.goldReward ?? 0); text = `The cache contains ${goldDelta} gold.`;
  } else if (node.type === "rest") { const power = healingMultiplier(guild); instances = recoverInstances(instances, (node.healMaxHpModifier ?? 0) * power, node.manaRecoveryModifier ?? 0, node.staminaRecoveryModifier ?? 0); text = "The party binds its wounds and recovers mana and stamina.";
  } else {
    if (!merchantChoice) throw new Error("Choose whether to buy supplies or leave");
    if (merchantChoice === "buy_supplies") { const cost = node.merchantCost ?? 0; if (guild.gold < cost) throw new Error("Not enough gold for the peddler's supplies"); nextGuild = { ...nextGuild, gold: nextGuild.gold - cost }; instances = recoverInstances(instances, (node.healMaxHpModifier ?? 0) * healingMultiplier(guild), node.manaRecoveryModifier ?? 0, node.staminaRecoveryModifier ?? 0); goldDelta = -cost; text = `The party buys supplies for ${cost} gold and recovers.`; }
    else text = "The party leaves the Lantern Peddler's wares untouched.";
  }
  let resolved = markDungeonNodeResolved({ ...run, heroInstances: instances }, text);
  if (node.type === "treasure") resolved = offerDungeonBoonChoices(resolved, random);
  nextGuild = updateRun({ ...nextGuild, gold: nextGuild.gold + Math.max(0, goldDelta) }, { ...resolved, goldEarned: resolved.goldEarned + goldDelta });
  nextGuild = syncHeroes(nextGuild, instances);
  return { guild: nextGuild, check, text, goldDelta, recipeId: null };
}

export function resolveDungeonCombat(guild: GuildState, status: "victory" | "defeat", instances: HeroCombatInstance[], random: RandomSource): DungeonNodeResolution {
  const run = activeRun(guild); const node = DUNGEON_NODES[run.currentNodeId]; if (!node || !["combat", "elite", "boss"].includes(node.type)) throw new Error("Current dungeon node is not combat");
  if (run.resolvedNodeIds.includes(node.id)) throw new Error("Dungeon node has already been resolved");
  if (status === "defeat") { const defeatedRun = { ...run, heroInstances: instances, combatState: null, combatRandomState: null, status: "defeat" as const, lastResolutionText: "The expedition was defeated in the depths." }; const next = syncHeroes(updateRun(guild, defeatedRun), instances); return { guild: next, check: null, text: defeatedRun.lastResolutionText, goldDelta: 0, recipeId: null }; }
  const goldDelta = scaledGold(guild, node.goldReward ?? 0); const xp = node.xpRewardPerHero ?? 0; const text = `${node.title} cleared. ${goldDelta} gold and up to ${xp} XP per surviving hero.`;
  let resolvedRun = markDungeonNodeResolved({ ...run, heroInstances: instances, combatState: null, combatRandomState: null }, text);
  resolvedRun = { ...resolvedRun, goldEarned: resolvedRun.goldEarned + goldDelta, xpEarnedPerHero: resolvedRun.xpEarnedPerHero + xp };
  if (node.type !== "boss") resolvedRun = offerDungeonBoonChoices(resolvedRun, random);
  let next = syncHeroes(updateRun({ ...guild, gold: guild.gold + goldDelta }, resolvedRun), instances, xp, DUNGEONS[run.dungeonId]!.recommendedLevelMax);
  let recipeId: string | null = null;
  if (node.type === "elite" || node.type === "boss") { const rareLootModifier = run.selectedModifierIds.reduce((sum, id) => sum + (DUNGEON_RUN_MODIFIERS[id]?.rareLootModifier ?? 0), 0) + sumDungeonBoonValue(run, "rareLootModifier"); const party = next.heroes.filter((hero) => run.partyHeroIds.includes(hero.id)); const partyAverageLevel = party.reduce((sum, hero) => sum + hero.level, 0) / Math.max(1, party.length); const encounterId = run.selectedEncounterIds[node.id]; const drop = resolveRogueliteRecipeDrop(next, node.type, random, rareLootModifier, DUNGEONS[run.dungeonId]!.themeId, { encounterId, partyAverageLevel }); next = drop.guild; recipeId = drop.result.droppedRecipeId; if (recipeId && next.activeDungeonRun) next = updateRun(next, { ...next.activeDungeonRun, recipeIdsUnlocked: [...next.activeDungeonRun.recipeIdsUnlocked, recipeId] }); }
  let cacheEquipmentId: string | null = null;
  if (next.activeDungeonRun?.status === "victory") {
    cacheEquipmentId = chooseDungeonCacheEquipmentId(next, run.partyHeroIds, random);
    if (cacheEquipmentId) next = { ...next, inventory: [...next.inventory, cacheEquipmentId], activeDungeonRun: { ...next.activeDungeonRun, cacheEquipmentId } };
    const score = calculateDungeonRunScore(next.activeDungeonRun!); const record = next.rogueliteRotation.records[run.dungeonId] ?? createRogueliteDungeonRecord();
    next = { ...next, rogueliteRotation: { ...next.rogueliteRotation, records: { ...next.rogueliteRotation.records, [run.dungeonId]: { ...record, victories: record.victories + 1, bestScore: Math.max(record.bestScore, score.total), bestGrade: score.total >= record.bestScore ? score.grade : record.bestGrade, lastVictoryDay: next.currentDay } } } };
  }
  const resultText = cacheEquipmentId ? `${text} Expedition cache: ${EQUIPMENT[cacheEquipmentId]?.name ?? cacheEquipmentId}.` : text;
  if (cacheEquipmentId && next.activeDungeonRun) next = updateRun(next, { ...next.activeDungeonRun, lastResolutionText: resultText });
  return { guild: next, check: null, text: resultText, goldDelta, recipeId };
}

export function selectDungeonBoon(guild: GuildState, boonId: string): GuildState {
  const run = activeRun(guild);
  return updateRun(guild, chooseDungeonBoon(run, boonId));
}

export function closeDungeonExpedition(guild: GuildState, abandon = false): GuildState {
  if (!guild.activeDungeonRun) throw new Error("No dungeon run to close");
  const run = guild.activeDungeonRun; const heroIds = new Set(run.partyHeroIds); const won = run.status === "victory" && !abandon; let next: GuildState = { ...guild, heroes: guild.heroes.map((hero) => heroIds.has(hero.id) && hero.currentHP > 0 ? { ...hero, isAvailable: true } : hero), rogueliteRotation: won ? { ...guild.rogueliteRotation, offeredDungeonIds: [], selectedDungeonId: null, cooldownUntilDay: guild.currentDay + 7 } : { ...guild.rogueliteRotation, selectedDungeonId: null }, activeDungeonRun: null };
  if (next.activeRogueliteRun) next = finishRogueliteRun(next);
  return next;
}
