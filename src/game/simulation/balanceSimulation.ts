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
import { calculateHero } from "../heroes/heroCalculator";
import { FIRST_SUBCLASS_LEVEL, SUBCLASSES } from "../../data/subclasses/subclasses";
import { getHeroSkillIds } from "../progression/subclasses/subclassService";
import type { EquipmentSlot } from "../heroes/types";

export type SimulationGearProfile = "starter" | "lagged_basic";
export type SimulationProgressionProfile = "base" | "subclass_ready";
export interface CombatSimulationScenario { id: string; questId: string; heroLevel: number; partyClasses: readonly ClassId[]; difficultyId: GameDifficultyId; runs: number; seed: number; gearProfile?: SimulationGearProfile; encounterLimit?: number; progressionProfile?: SimulationProgressionProfile }
export interface CombatSimulationResult { scenarioId: string; wins: number; losses: number; stalled: number; winRate: number; averageRounds: number; averageSurvivingHeroes: number; averageRemainingHpRatioOnWins: number; enemyXpPool: number }
export interface EconomySimulationScenario { id: string; questId: string; difficultyId: GameDifficultyId; heroCount: number; heroLevel?: number; weeklySalaryPerHero?: number; questsPerWeek: number; days: number; travelGoldCostPerQuest?: number; healingGoldCostPerQuest?: number; repairGoldCostPerQuest?: number; rationGoldCostPerQuest?: number; facilityReserve?: number; seed: number }
export interface EconomySimulationResult { scenarioId: string; startingGold: number; endingGold: number; netGold: number; questIncome: number; tavernIncome: number; salaryPaid: number; fieldExpenses: number; arrears: number; breakEvenQuestsPerWeek: number; goldAfterFacilityReserve: number }

const SIMULATION_GEAR_SLOTS: readonly EquipmentSlot[] = ["weapon", "armor", "helmet", "boots", "accessory1", "accessory2"];

function progressionGearTargetLevel(heroLevel: number, slot: EquipmentSlot): number {
  const lag = slot === "weapon" || slot === "armor" ? 2 : 3;
  return Math.max(1, heroLevel - lag);
}

function equipLaggedBasicGear(hero: Hero): Hero {
  const equipment = { ...hero.equipment };
  for (const slot of SIMULATION_GEAR_SLOTS) {
    const targetLevel = progressionGearTargetLevel(hero.level, slot);
    const candidates = Object.values(EQUIPMENT)
      .filter((item) => item.slot === slot)
      .filter((item) => item.levelRequirement <= targetLevel)
      .filter((item) => item.rarity === "common" || item.rarity === "uncommon")
      .filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(hero.classId))
      .sort((a, b) => b.levelRequirement - a.levelRequirement || b.value - a.value || a.id.localeCompare(b.id));
    if (candidates[0]) equipment[slot] = candidates[0].id;
  }
  const equipped = { ...hero, equipment };
  return { ...equipped, currentHP: calculateHero(equipped).stats.maxHP };
}

function levelHero(hero: Hero, level: number, index: number, gearProfile: SimulationGearProfile, progressionProfile: SimulationProgressionProfile): Hero {
  let xp = 0;
  for (let current = 1; current < level; current++) xp += xpRequiredForNextLevel(current);
  const leveled = grantHeroXp(hero, xp, level);
  const tree = CLASS_SKILL_TREES[leveled.classId];
  const learnedSkillIds = tree.recommendedPaths[index % tree.recommendedPaths.length]!.skillIds.filter((skillId) => (tree.nodes.find((node) => node.skillId === skillId)?.requiredLevel ?? Infinity) <= level);
  const skilled = { ...leveled, learnedSkillIds };
  const subclass = progressionProfile === "subclass_ready" && level >= FIRST_SUBCLASS_LEVEL
    ? Object.values(SUBCLASSES).find((definition) => definition.baseClassId === skilled.classId)
    : undefined;
  const progressed = subclass ? { ...skilled, subclassId: subclass.id } : skilled;
  const prepared = gearProfile === "lagged_basic" ? equipLaggedBasicGear(progressed) : progressed;
  return { ...prepared, currentHP: calculateHero(prepared).stats.maxHP };
}

export function createSimulationParty(classes: readonly ClassId[], level: number, seed: number, gearProfile: SimulationGearProfile = "starter", progressionProfile: SimulationProgressionProfile = "base"): Hero[] {
  return classes.map((classId, index) => levelHero(
    { ...generateHero(createSeededRandom(seed + index * 97), { classId }), id: `sim-${seed}-${index}` },
    level,
    index,
    gearProfile,
    progressionProfile,
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

function tryHeroAction(state: CombatState, random: RandomSource): CombatState | null {
  const actor = state.heroes.find((item) => item.hero.id === state.awaitingHeroId)!;
  const skillIds = [...getHeroSkillIds(actor.hero)].reverse();
  for (const skillId of skillIds) {
    const skill = HERO_SKILLS[skillId]; if (!skill) continue;
    const availability = getHeroSkillAvailability(actor.hero, actor.instance, actor.unit, skillId, state.heroes.map((item) => item.unit), state.enemies.map((item) => item.unit), state.board);
    if (!availability.enabled) continue;
    try { const target = skillTarget(state, skill); return performHeroTurn(state, skillId, random, target.targetId, target.targetPosition); } catch { /* Try another legal action. */ }
  }
  return null;
}

function moveTowardEnemy(state: CombatState, random: RandomSource): CombatState {
  const actor = state.heroes.find((item) => item.hero.id === state.awaitingHeroId)!;
  const enemies = state.enemies.filter((item) => item.unit.isAlive);
  const reachable = getReachablePositions(state.board, actor.unit.position, getEffectiveMovementRange(actor.unit), actor.unit.ignoredTerrainMovementCosts);
  const destination = reachable.sort((a, b) => Math.min(...enemies.map((enemy) => manhattanDistance(a, enemy.unit.position))) - Math.min(...enemies.map((enemy) => manhattanDistance(b, enemy.unit.position))))[0];
  return destination ? moveCurrentHero(state, destination, random) : state;
}

function autoplayEncounter(initial: CombatState, random: RandomSource): CombatState {
  let state = beginCombat(initial, random); let decisions = 0;
  while (state.status === "active" && decisions++ < 500) {
    if (!state.awaitingHeroId) break;
    let acted = tryHeroAction(state, random);
    if (!acted && !state.actions.movementUsed) { state = moveTowardEnemy(state, random); acted = tryHeroAction(state, random); }
    state = acted ?? state;
    if (state.status === "active" && state.awaitingHeroId) state = endCurrentHeroTurn(state, random);
  }
  return state;
}

export function simulateCombatScenario(scenario: CombatSimulationScenario): CombatSimulationResult {
  let wins = 0, losses = 0, stalled = 0, rounds = 0, survivors = 0, hpRatios = 0;
  for (let run = 0; run < scenario.runs; run++) {
    const random = createSeededRandom(scenario.seed + run * 7919);
    const heroes = createSimulationParty(scenario.partyClasses, scenario.heroLevel, scenario.seed + run * 31, scenario.gearProfile ?? "starter", scenario.progressionProfile ?? "base");
    let carried = undefined; let final: CombatState | undefined;
    const encounterCount = Math.min(QUESTS[scenario.questId]!.encounterIds.length, scenario.encounterLimit ?? Number.POSITIVE_INFINITY);
    for (let encounterIndex = 0; encounterIndex < encounterCount; encounterIndex++) {
      final = autoplayEncounter(createCombatState(scenario.questId, encounterIndex, heroes, random, carried, undefined, [], scenario.difficultyId), random);
      if (final.status !== "victory") break;
      const advanced = advanceToNextEncounter({ questDefinitionId: scenario.questId, partyId: "sim", currentEncounterIndex: encounterIndex, status: "active", goldEarned: 0, xpEarnedPerHero: 0, collectedLootIds: [], collectedMaterials: {} }, final.heroes.map((item) => item.instance));
      carried = advanced.heroInstances;
    }
    rounds += final?.round ?? 0;
    if (final?.status === "victory") { wins++; const alive = final.heroes.filter((item) => item.unit.isAlive); survivors += alive.length; hpRatios += alive.reduce((sum, item) => sum + item.unit.currentHP / item.unit.maxHP, 0) / Math.max(1, alive.length); }
    else if (final?.status === "defeat") losses++; else stalled++;
  }
  return { scenarioId: scenario.id, wins, losses, stalled, winRate: wins / scenario.runs, averageRounds: rounds / scenario.runs, averageSurvivingHeroes: wins ? survivors / wins : 0, averageRemainingHpRatioOnWins: wins ? hpRatios / wins : 0, enemyXpPool: getQuestEnemyXpPool(QUESTS[scenario.questId]!) };
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
