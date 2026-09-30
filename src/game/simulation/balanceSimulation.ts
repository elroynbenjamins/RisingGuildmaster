import { CLASS_SKILL_TREES } from "../../data/skills/classSkillTrees";
import { HERO_SKILLS } from "../../data/skills/heroSkills";
import { QUESTS } from "../../data/quests/quests";
import { GAME_CONFIG } from "../../config/gameConfig";
import type { RandomSource } from "../../utils/random";
import { createSeededRandom } from "../../utils/random";
import { createCombatState, beginCombat, endCurrentHeroTurn, moveCurrentHero, performHeroTurn, type CombatState } from "../combat/combatEngine";
import { getHeroSkillAvailability } from "../combat/heroActionService";
import { getEffectiveMovementRange } from "../combat/conditionResolver";
import { getReachablePositions } from "../combat/grid/pathfinding";
import { manhattanDistance } from "../combat/grid/distanceCalculator";
import type { CombatSkillDefinition } from "../combat/skillTypes";
import type { Hero, ClassId } from "../heroes/types";
import type { GameDifficultyId } from "../difficulty/difficultyTypes";
import { generateHero } from "../heroes/heroGenerator";
import { xpRequiredForNextLevel } from "../progression/xpSystem";
import { grantHeroXp } from "../progression/levelSystem";
import { advanceToNextEncounter, getQuestEnemyXpPool } from "../quests/questResolver";
import { rollQuestGold } from "../quests/questService";
import { getDifficulty } from "../../data/difficulty/difficulties";
import { createGuild } from "../guild/guildService";
import { advanceGuildTime, totalSalaryArrears } from "../economy/guildCalendarService";
import { createHeroContract } from "../recruitment/contractService";
import { calculateWeeklySalary } from "../recruitment/recruitmentCostCalculator";
import { EQUIPMENT } from "../../data/equipment/equipment";
import { RECRUITMENT_FIELD_GEAR_IDS } from "../../data/equipment/equipmentBalanceExpansion";
import { calculateHero } from "../heroes/heroCalculator";
import { FIRST_SUBCLASS_LEVEL, SUBCLASSES } from "../../data/subclasses/subclasses";
import { getHeroSkillIds } from "../progression/subclasses/subclassService";
import type { EquipmentSlot } from "../heroes/types";

export type SimulationGearProfile = "starter" | "lagged_basic" | "prepared_minus_two" | "optional_progression";
export type SimulationProgressionProfile = "base" | "subclass_ready";
export type SimulationTacticsProfile = "basic" | "skilled";
export interface CombatSimulationScenario { id: string; questId: string; heroLevel: number; partyClasses: readonly ClassId[]; partyLevels?: readonly number[]; difficultyId: GameDifficultyId; runs: number; seed: number; gearProfile?: SimulationGearProfile; encounterLimit?: number; progressionProfile?: SimulationProgressionProfile; skillPathIndices?: readonly number[]; tacticsProfile?: SimulationTacticsProfile }
export interface CombatSimulationResult { scenarioId: string; wins: number; losses: number; stalled: number; winRate: number; wipeRate: number; averageRounds: number; averageSurvivingHeroes: number; averageFallenHeroesOnWins: number; victoriesWithAnyFallRate: number; victoriesWithTwoPlusFallsRate: number; averageRemainingHpRatioOnWins: number; enemyXpPool: number }
export interface EconomySimulationScenario { id: string; questId: string; difficultyId: GameDifficultyId; heroCount: number; heroLevel?: number; weeklySalaryPerHero?: number; questsPerWeek: number; days: number; travelGoldCostPerQuest?: number; healingGoldCostPerQuest?: number; repairGoldCostPerQuest?: number; rationGoldCostPerQuest?: number; facilityReserve?: number; seed: number }
export interface EconomySimulationResult { scenarioId: string; startingGold: number; endingGold: number; netGold: number; questIncome: number; tavernIncome: number; salaryPaid: number; fieldExpenses: number; arrears: number; breakEvenQuestsPerWeek: number; goldAfterFacilityReserve: number }

const SIMULATION_GEAR_SLOTS: readonly EquipmentSlot[] = ["weapon", "armor", "helmet", "boots", "accessory1", "accessory2"];

function progressionGearTargetLevel(heroLevel: number, slot: EquipmentSlot): number {
  const lag = slot === "weapon" || slot === "armor" ? 2 : 3;
  return Math.max(1, heroLevel - lag);
}

function equipProgressionGear(hero: Hero, profile: "lagged_basic" | "prepared_minus_two" | "optional_progression"): Hero {
  const equipment = { ...hero.equipment };
  for (const slot of SIMULATION_GEAR_SLOTS) {
    const targetLevel = profile === "optional_progression"
      ? Math.max(1, hero.level - (slot === "weapon" ? 0 : slot === "armor" ? 1 : 2))
      : profile === "prepared_minus_two"
        ? Math.max(1, hero.level - 2)
        : progressionGearTargetLevel(hero.level, slot);
    const candidates = Object.values(EQUIPMENT)
      .filter((item) => item.slot === slot)
      .filter((item) => !RECRUITMENT_FIELD_GEAR_IDS.has(item.id))
      .filter((item) => item.levelRequirement <= targetLevel)
      .filter((item) => profile === "optional_progression" || profile === "prepared_minus_two"
        ? item.rarity === "common" || item.rarity === "uncommon" || item.rarity === "rare" || item.rarity === "epic"
        : item.rarity === "common" || item.rarity === "uncommon")
      .filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(hero.classId))
      .sort((a, b) => b.levelRequirement - a.levelRequirement || b.value - a.value || a.id.localeCompare(b.id));
    if (candidates[0]) equipment[slot] = candidates[0].id;
  }
  const equipped = { ...hero, equipment };
  return { ...equipped, currentHP: calculateHero(equipped).stats.maxHP };
}

function levelHero(hero: Hero, level: number, index: number, gearProfile: SimulationGearProfile, progressionProfile: SimulationProgressionProfile, skillPathIndex: number = index): Hero {
  let xp = 0;
  for (let current = 1; current < level; current++) xp += xpRequiredForNextLevel(current);
  const leveled = grantHeroXp(hero, xp, level);
  const tree = CLASS_SKILL_TREES[leveled.classId];
  const normalizedSkillPathIndex = ((skillPathIndex % tree.recommendedPaths.length) + tree.recommendedPaths.length) % tree.recommendedPaths.length;
  const learnedSkillIds = tree.recommendedPaths[normalizedSkillPathIndex]!.skillIds.filter((skillId) => (tree.nodes.find((node) => node.skillId === skillId)?.requiredLevel ?? Infinity) <= level);
  const skilled = { ...leveled, learnedSkillIds };
  const subclass = progressionProfile === "subclass_ready" && level >= FIRST_SUBCLASS_LEVEL
    ? Object.values(SUBCLASSES).find((definition) => definition.baseClassId === skilled.classId)
    : undefined;
  const progressed = subclass ? { ...skilled, subclassId: subclass.id } : skilled;
  const prepared = gearProfile !== "starter" ? equipProgressionGear(progressed, gearProfile) : progressed;
  return { ...prepared, currentHP: calculateHero(prepared).stats.maxHP };
}

export function createSimulationParty(classes: readonly ClassId[], level: number, seed: number, gearProfile: SimulationGearProfile = "starter", progressionProfile: SimulationProgressionProfile = "base", skillPathIndices?: readonly number[]): Hero[] {
  return classes.map((classId, index) => levelHero(
    { ...generateHero(createSeededRandom(seed + index * 97), { classId }), id: `sim-${seed}-${index}` },
    level,
    index,
    gearProfile,
    progressionProfile,
    skillPathIndices?.[index] ?? index,
  ));
}

function skillTarget(state: CombatState, skill: CombatSkillDefinition): { targetId?: string; targetPosition?: { x: number; y: number } } {
  const actor = state.heroes.find((item) => item.hero.id === state.awaitingHeroId)!;
  const livingEnemies = state.enemies.filter((item) => item.unit.isAlive).sort((a, b) => a.unit.currentHP - b.unit.currentHP);
  const livingAllies = state.heroes.filter((item) => item.unit.isAlive).sort((a, b) => a.unit.currentHP / a.unit.maxHP - b.unit.currentHP / b.unit.maxHP);
  if (skill.targetType === "self") return { targetId: actor.hero.id };
  if (skill.targetType === "single_ally" || skill.targetType === "all_allies") return { targetId: livingAllies[0]?.hero.id };
  const target = livingEnemies[0]?.unit;
  return { targetId: target?.combatantId, targetPosition: skill.areaRadius !== undefined ? target?.position : undefined };
}

function skilledSkillScore(state: CombatState, skill: CombatSkillDefinition): number {
  const actor = state.heroes.find((item) => item.hero.id === state.awaitingHeroId)!;
  const livingEnemies = state.enemies.filter((item) => item.unit.isAlive);
  const livingAllies = state.heroes.filter((item) => item.unit.isAlive);
  const lowestAllyHpRatio = Math.min(...livingAllies.map((item) => item.unit.currentHP / item.unit.maxHP));

  if (skill.healMaxHpModifier) {
    if (skill.targetType === "self") {
      const hpRatio = actor.unit.currentHP / actor.unit.maxHP;
      if (hpRatio > .78) return -1000;
      return 250 + (1 - hpRatio) * 200 + skill.healMaxHpModifier * 100;
    }
    if (skill.targetType === "single_ally") {
      if (lowestAllyHpRatio > .80) return -1000;
      return 300 + (1 - lowestAllyHpRatio) * 220 + skill.healMaxHpModifier * 100;
    }
    if (skill.targetType === "all_allies") {
      const injured = livingAllies.filter((item) => item.unit.currentHP / item.unit.maxHP < .85).length;
      if (injured < 2 && lowestAllyHpRatio > .65) return -1000;
      return 320 + injured * 45 + skill.healMaxHpModifier * 120;
    }
  }

  let score = skill.type === "basic_attack" ? 20 : 70;
  if (skill.damageMultiplier) {
    const targetCount = skill.targetType === "all_enemies" ? Math.max(1, livingEnemies.length) : 1;
    score += skill.damageMultiplier * 100 * Math.min(targetCount, 3);
  }
  if (skill.conditionApplications?.length) score += 25;
  if (skill.targetModifiers?.length || skill.selfModifiers?.length || skill.taunt) score += 18;
  if (skill.targetType === "all_allies") score += 12;
  return score;
}

function tryHeroAction(state: CombatState, random: RandomSource, tacticsProfile: SimulationTacticsProfile = "basic"): CombatState | null {
  const actor = state.heroes.find((item) => item.hero.id === state.awaitingHeroId)!;
  const skillIds = [...getHeroSkillIds(actor.hero)].reverse();
  const orderedSkillIds = tacticsProfile === "skilled"
    ? skillIds
        .map((skillId) => ({ skillId, skill: HERO_SKILLS[skillId] }))
        .filter((entry): entry is { skillId: string; skill: CombatSkillDefinition } => Boolean(entry.skill))
        .sort((a, b) => skilledSkillScore(state, b.skill) - skilledSkillScore(state, a.skill))
        .map((entry) => entry.skillId)
    : skillIds;

  for (const skillId of orderedSkillIds) {
    const skill = HERO_SKILLS[skillId]; if (!skill) continue;
    if (tacticsProfile === "skilled" && skilledSkillScore(state, skill) < 0) continue;
    const availability = getHeroSkillAvailability(actor.hero, actor.instance, actor.unit, skillId, state.heroes.map((item) => item.unit), state.enemies.map((item) => item.unit), state.board);
    if (!availability.enabled) continue;
    try { const target = skillTarget(state, skill); return performHeroTurn(state, skillId, random, target.targetId, target.targetPosition); } catch { /* Try another legal action. */ }
  }
  return null;
}

function moveTowardGoal(state: CombatState, random: RandomSource, tacticsProfile: SimulationTacticsProfile = "basic"): CombatState {
  const actor = state.heroes.find((item) => item.hero.id === state.awaitingHeroId)!;
  const reachable = getReachablePositions(state.board, actor.unit.position, getEffectiveMovementRange(actor.unit), actor.unit.ignoredTerrainMovementCosts)
    .filter((position) => position.x !== actor.unit.position.x || position.y !== actor.unit.position.y);

  const targets = state.objective.type === "reach_zone"
    ? state.objective.positions
    : state.enemies.filter((item) => item.unit.isAlive).map((item) => item.unit.position);

  if (!targets.length) return state;
  if (state.objective.type === "reach_zone" && targets.some((position) => position.x === actor.unit.position.x && position.y === actor.unit.position.y)) return state;

  const distanceToGoal = (position: { x: number; y: number }) =>
    Math.min(...targets.map((target) => manhattanDistance(position, target)));

  if (tacticsProfile === "skilled" && state.objective.type !== "reach_zone") {
    const rangedClasses = new Set<ClassId>(["ranger", "mage", "cleric", "bard", "spellbow", "summoner"]);
    const preferredDistance = rangedClasses.has(actor.hero.classId) ? 4 : 1;
    const destination = reachable.sort((a, b) => {
      const aDistance = distanceToGoal(a);
      const bDistance = distanceToGoal(b);
      const aGap = Math.abs(aDistance - preferredDistance);
      const bGap = Math.abs(bDistance - preferredDistance);
      if (aGap !== bGap) return aGap - bGap;
      return rangedClasses.has(actor.hero.classId) ? bDistance - aDistance : aDistance - bDistance;
    })[0];
    return destination ? moveCurrentHero(state, destination, random) : state;
  }

  const destination = reachable.sort((a, b) => distanceToGoal(a) - distanceToGoal(b))[0];
  return destination ? moveCurrentHero(state, destination, random) : state;
}

function autoplayEncounter(initial: CombatState, random: RandomSource, tacticsProfile: SimulationTacticsProfile = "basic"): CombatState {
  let state = beginCombat(initial, random); let decisions = 0;
  while (state.status === "active" && decisions++ < 500) {
    if (!state.awaitingHeroId) break;
    let acted = tryHeroAction(state, random, tacticsProfile);
    if (!acted && !state.actions.movementUsed) {
      state = moveTowardGoal(state, random, tacticsProfile);
      if (state.status === "active" && state.awaitingHeroId) acted = tryHeroAction(state, random, tacticsProfile);
    }
    state = acted ?? state;
    if (state.status === "active" && state.awaitingHeroId) state = endCurrentHeroTurn(state, random);
  }
  return state;
}

export function simulateCombatScenario(scenario: CombatSimulationScenario): CombatSimulationResult {
  let wins = 0, losses = 0, stalled = 0, rounds = 0, survivors = 0, fallenOnWins = 0, winsWithAnyFall = 0, winsWithTwoPlusFalls = 0, hpRatios = 0;
  for (let run = 0; run < scenario.runs; run++) {
    const random = createSeededRandom(scenario.seed + run * 7919);
    const heroes = scenario.partyLevels?.length
      ? scenario.partyClasses.map((classId, index) => levelHero(
          { ...generateHero(createSeededRandom(scenario.seed + run * 31 + index * 97), { classId }), id: `sim-${scenario.seed + run * 31}-${index}` },
          scenario.partyLevels?.[index] ?? scenario.heroLevel,
          index,
          scenario.gearProfile ?? "starter",
          scenario.progressionProfile ?? "base",
          scenario.skillPathIndices?.[index] ?? index,
        ))
      : createSimulationParty(scenario.partyClasses, scenario.heroLevel, scenario.seed + run * 31, scenario.gearProfile ?? "starter", scenario.progressionProfile ?? "base", scenario.skillPathIndices);
    let carried = undefined; let final: CombatState | undefined;
    const encounterCount = Math.min(QUESTS[scenario.questId]!.encounterIds.length, scenario.encounterLimit ?? Number.POSITIVE_INFINITY);
    for (let encounterIndex = 0; encounterIndex < encounterCount; encounterIndex++) {
      final = autoplayEncounter(createCombatState(scenario.questId, encounterIndex, heroes, random, carried, undefined, [], scenario.difficultyId), random, scenario.tacticsProfile ?? "basic");
      if (final.status !== "victory") break;
      const advanced = advanceToNextEncounter({ questDefinitionId: scenario.questId, partyId: "sim", currentEncounterIndex: encounterIndex, status: "active", goldEarned: 0, xpEarnedPerHero: 0, collectedLootIds: [], collectedMaterials: {} }, final.heroes.map((item) => item.instance));
      carried = advanced.heroInstances;
    }
    rounds += final?.round ?? 0;
    if (final?.status === "victory") { wins++; const alive = final.heroes.filter((item) => item.unit.isAlive); const fallen = Math.max(0, final.heroes.length - alive.length); survivors += alive.length; fallenOnWins += fallen; if (fallen >= 1) winsWithAnyFall++; if (fallen >= 2) winsWithTwoPlusFalls++; hpRatios += alive.reduce((sum, item) => sum + item.unit.currentHP / item.unit.maxHP, 0) / Math.max(1, alive.length); }
    else if (final?.status === "defeat") losses++; else stalled++;
  }
  return { scenarioId: scenario.id, wins, losses, stalled, winRate: wins / scenario.runs, wipeRate: losses / scenario.runs, averageRounds: rounds / scenario.runs, averageSurvivingHeroes: wins ? survivors / wins : 0, averageFallenHeroesOnWins: wins ? fallenOnWins / wins : 0, victoriesWithAnyFallRate: wins ? winsWithAnyFall / wins : 0, victoriesWithTwoPlusFallsRate: wins ? winsWithTwoPlusFalls / wins : 0, averageRemainingHpRatioOnWins: wins ? hpRatios / wins : 0, enemyXpPool: getQuestEnemyXpPool(QUESTS[scenario.questId]!) };
}

export function simulateEconomyScenario(scenario: EconomySimulationScenario): EconomySimulationResult {
  const random = createSeededRandom(scenario.seed); let guild = createGuild("Simulation", scenario.difficultyId);
  guild.heroes = createSimulationParty(Array.from({ length: scenario.heroCount }, (_, index) => (["warrior", "ranger", "mage", "cleric"] as ClassId[])[index % 4]!), scenario.heroLevel ?? 1, scenario.seed);
  const weeklySalaries = guild.heroes.map((hero) => scenario.weeklySalaryPerHero ?? calculateWeeklySalary(hero));
  guild.heroContracts = guild.heroes.map((hero, index) => createHeroContract(hero, weeklySalaries[index]!, 52, guild.currentDay));
  const startingGold = guild.gold; let questIncome = 0; let fieldExpenses = 0; let questAccumulator = 0;
  for (let day = 0; day < scenario.days; day++) {
    const beforeTavern = guild.finance.totalTavernIncome; guild = advanceGuildTime(guild, 1).guild;
    questAccumulator += scenario.questsPerWeek / 7;
    while (questAccumulator >= 1) {
      const grossReward = Math.round(rollQuestGold(QUESTS[scenario.questId]!, random) * getDifficulty(scenario.difficultyId).questGoldMultiplier);
      const expense = (scenario.travelGoldCostPerQuest ?? 0) + (scenario.healingGoldCostPerQuest ?? 0) + (scenario.repairGoldCostPerQuest ?? 0) + (scenario.rationGoldCostPerQuest ?? 0);
      guild = { ...guild, gold: guild.gold + grossReward - expense }; questIncome += grossReward; fieldExpenses += expense; questAccumulator--;
    }
    void beforeTavern;
  }
  const averageQuestGold = ((QUESTS[scenario.questId]!.goldRewardMin + QUESTS[scenario.questId]!.goldRewardMax) / 2) * getDifficulty(scenario.difficultyId).questGoldMultiplier - (scenario.travelGoldCostPerQuest ?? 0) - (scenario.healingGoldCostPerQuest ?? 0) - (scenario.repairGoldCostPerQuest ?? 0) - (scenario.rationGoldCostPerQuest ?? 0);
  const weeklyPayroll = weeklySalaries.reduce((sum, salary) => sum + salary, 0);
  const weeklyDeficitBeforeQuests = weeklyPayroll - GAME_CONFIG.dailyTavernIncome * 7 * getDifficulty(scenario.difficultyId).tavernIncomeMultiplier;
  return { scenarioId: scenario.id, startingGold, endingGold: guild.gold, netGold: guild.gold - startingGold, questIncome, tavernIncome: guild.finance.totalTavernIncome, salaryPaid: guild.finance.totalSalaryPaid, fieldExpenses, arrears: totalSalaryArrears(guild), breakEvenQuestsPerWeek: Math.max(0, weeklyDeficitBeforeQuests / Math.max(1, averageQuestGold)), goldAfterFacilityReserve: guild.gold - (scenario.facilityReserve ?? 0) };
}
