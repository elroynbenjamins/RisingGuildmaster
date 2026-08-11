import { CLASSES } from "../../data/classes/classes";
import { QUEST_ENCOUNTERS } from "../../data/encounters/questEncounters";
import { getEnemyDefinition } from "../../data/enemies";
import { QUESTS } from "../../data/quests/quests";
import { ENEMY_SKILLS } from "../../data/skills/enemySkills";
import { HERO_SKILLS } from "../../data/skills/heroSkills";
import type { RandomSource } from "../../utils/random";
import type { EnemyInstance } from "../enemies/enemyTypes";
import type { Hero } from "../heroes/types";
import { createQuestEncounter } from "../quests/encounterFactory";
import { advanceCombatConditions, resolveStartOfTurnConditions } from "./conditionResolver";
import { advanceCooldowns } from "./cooldownService";
import type { CombatLogEntry, CombatUnit, HeroCombatInstance, InitiativeRoll, QuestCombatSetup, SkillHitResult } from "./combatTypes";
import { createHeroCombatInstance, createHeroCombatUnit } from "./heroCombatFactory";
import { getHeroSkillAvailability, resolveHeroAction } from "./heroActionService";
import { regenerateHeroResources } from "./resourceService";
import { getTargetsInSkillRange, getValidTargets } from "./targetSelector";
import { rollInitiative } from "./turnOrder";
import { resolveEnemyTurn } from "./turnResolver";
import { createCombatBoard, setOccupant } from "./grid/boardFactory";
import type { CombatBoardState, GridPosition } from "./grid/gridTypes";
import { getTile, positionKey } from "./grid/gridTypes";
import { spawnOccupants } from "./grid/spawnService";
import { moveOccupant } from "./grid/movementService";
import { getAreaPositions } from "./grid/areaCalculator";
import { isPositionInSkillRange } from "./skillRangeService";
import { chooseEnemyDestination, getEnemyTacticalBehavior, selectTacticalTarget } from "./tacticalAiService";
import { getHeroSkillRange } from "../progression/subclasses/subclassService";
import { BATTLEFIELDS } from "../../data/combat/battlefields";
import { advanceSkillModifiers } from "./modifierService";

export interface HeroCombatant { hero: Hero; instance: HeroCombatInstance; unit: CombatUnit }
export interface EnemyCombatant { instance: EnemyInstance; unit: CombatUnit }
export type CombatStatus = "active" | "victory" | "defeat";
export interface CombatTurnActions { movementUsed: boolean; combatActionUsed: boolean; usedSkillId?: string }
export interface CombatState {
  questId: string; encounterIndex: number; round: number; turn: number;
  encounterIds: string[]; setupLabel?: string;
  heroes: HeroCombatant[]; enemies: EnemyCombatant[]; board: CombatBoardState;
  initiativeRolls: InitiativeRoll[]; combatStarted: boolean; turnOrderIds: string[]; turnCursor: number; awaitingHeroId: string | null;
  actions: CombatTurnActions; status: CombatStatus; log: CombatLogEntry[]; lastRoll: SkillHitResult | null;
}

export function createCombatState(questId: string, encounterIndex: number, heroes: readonly Hero[], random: RandomSource, carried?: readonly HeroCombatInstance[], setup?: QuestCombatSetup): CombatState {
  const quest = QUESTS[questId]; if (!quest) throw new Error(`Unknown quest: ${questId}`);
  const encounterIds = setup?.encounterIds ?? quest.encounterIds;
  const encounterId = encounterIds[encounterIndex]; const encounter = encounterId ? QUEST_ENCOUNTERS[encounterId] : undefined;
  if (!encounterId || !encounter) throw new Error(`Unknown quest encounter at index ${encounterIndex}`);
  const battlefield = BATTLEFIELDS[encounter.battlefieldId]; if (!battlefield) throw new Error(`Unknown battlefield: ${encounter.battlefieldId}`);
  const environment = battlefield.combatModifiers ?? {};
  const carriedById = new Map((carried ?? []).map((instance) => [instance.heroId, instance]));
  const heroCombatants = heroes.map((hero, index) => {
    const spawn = encounter.heroSpawnPositions[index]; if (!spawn) throw new Error("Encounter has too few hero spawn positions");
    const base = carriedById.get(hero.id) ?? createHeroCombatInstance(hero);
    const adjustedMovement = Math.max(0, base.movementRange + (environment.heroMovementRangeModifier ?? 0) + (setup?.heroMovementRangeModifier ?? 0));
    const instance = { ...base, position: { ...spawn }, movementRange: adjustedMovement };
    const baseUnit = createHeroCombatUnit(hero, instance);
    const unit = { ...baseUnit, position: { ...spawn }, movementRange: adjustedMovement, stats: { ...baseUnit.stats, initiativeBonus: baseUnit.stats.initiativeBonus + (setup?.heroInitiativeModifier ?? 0) + (environment.heroInitiativeModifier ?? 0), armorClass: baseUnit.stats.armorClass + (setup?.heroArmorClassModifier ?? 0), healingPower: baseUnit.stats.healingPower + (setup?.heroHealingPowerModifier ?? 0) }, activeModifiers: [...baseUnit.activeModifiers, ...((setup?.heroOpeningAttackRollModifier ?? 0) ? [{ stat: "attackRollModifier", operation: "flat" as const, value: setup!.heroOpeningAttackRollModifier, durationTurns: 1, sourceSkillId: "quest_preparation" }] : [])] };
    return { hero, instance, unit };
  });
  const enemies = createQuestEncounter(encounterId, random).map((item) => {
    const movementRange = Math.max(0, item.unit.movementRange + (environment.enemyMovementRangeModifier ?? 0) + (setup?.enemyMovementRangeModifier ?? 0));
    const physicalMultiplier = 1 + (setup?.enemyPhysicalDamageModifier ?? 0) + (setup?.enemyDamageModifier ?? 0);
    const magicMultiplier = 1 + (setup?.enemyDamageModifier ?? 0);
    return { ...item, instance: { ...item.instance, movementRange }, unit: { ...item.unit, movementRange, stats: { ...item.unit.stats, physicalDamage: item.unit.stats.physicalDamage * physicalMultiplier, magicDamage: item.unit.stats.magicDamage * magicMultiplier, initiativeBonus: item.unit.stats.initiativeBonus + (setup?.enemyInitiativeModifier ?? 0) + (environment.enemyInitiativeModifier ?? 0) }, activeModifiers: [...item.unit.activeModifiers, ...((setup?.enemyOpeningAttackRollModifier ?? 0) ? [{ stat: "attackRollModifier", operation: "flat" as const, value: setup!.enemyOpeningAttackRollModifier, durationTurns: 2, sourceSkillId: "quest_preparation" }] : [])] } };
  });
  let board = createCombatBoard(encounter.obstaclePositions, battlefield.boardSizeId, battlefield.terrainPlacements, battlefield.id);
  board = spawnOccupants(board, [...heroCombatants.map((item) => ({ occupantId: item.unit.combatantId, position: item.unit.position })), ...enemies.map((item) => ({ occupantId: item.unit.combatantId, position: item.unit.position }))]);
  const units = [...heroCombatants.map((item) => item.unit), ...enemies.map((item) => item.unit)];
  const initiative = rollInitiative(units, random);
  return { questId, encounterIndex, encounterIds, ...(setup?.label ? { setupLabel: setup.label } : {}), round: 1, turn: 1, heroes: heroCombatants, enemies, board, initiativeRolls: initiative.map(({ combatantId, d20, modifier, total }) => ({ combatantId, d20, modifier, total })), combatStarted: false, turnOrderIds: initiative.map((entry) => entry.combatantId), turnCursor: 0, awaitingHeroId: null, actions: { movementUsed: false, combatActionUsed: false }, status: "active", log: [], lastRoll: null };
}

export function beginCombat(state: CombatState, random: RandomSource): CombatState {
  if (state.combatStarted) return state;
  return advanceCombat({ ...state, combatStarted: true }, random);
}

function withOutcome(state: CombatState): CombatState {
  if (state.enemies.every((item) => !item.unit.isAlive)) return { ...state, status: "victory", awaitingHeroId: null };
  if (state.heroes.every((item) => !item.unit.isAlive)) return { ...state, status: "defeat", awaitingHeroId: null };
  return state;
}
function replaceUnits<T extends { unit: CombatUnit }>(items: T[], updates: readonly CombatUnit[]): T[] { const byId = new Map(updates.map((unit) => [unit.combatantId, unit])); return items.map((item) => byId.has(item.unit.combatantId) ? { ...item, unit: byId.get(item.unit.combatantId)! } : item); }
export function clearDefeatedOccupants(board: CombatBoardState, units: readonly CombatUnit[]): CombatBoardState {
  return units.filter((unit) => !unit.isAlive).reduce((current, unit) => {
    const tile = getTile(current, unit.position);
    return tile?.occupantId === unit.combatantId ? setOccupant(current, unit.position, null) : current;
  }, board);
}
function rollMessage(actorName: string, skillId: string, targetName: string, hit: SkillHitResult): string {
  const skill = HERO_SKILLS[skillId] ?? ENEMY_SKILLS[skillId];
  if (hit.diceRoll === undefined) return `${actorName} used ${skill?.name ?? skillId}${hit.damage ? ` for ${hit.damage} damage` : ""}.`;
  const attackBonus = hit.attackBonus ?? 0; const skillModifier = hit.skillAttackModifier ?? 0;
  return `${actorName} uses ${skill?.name ?? skillId} on ${targetName}. D20 ${hit.diceRoll} + attack ${attackBonus}${skillModifier ? ` ${skillModifier >= 0 ? "+" : ""}${skillModifier} skill` : ""} = ${hit.attackTotal} vs ${hit.targetValue}: ${hit.rollResult?.toUpperCase()}${hit.damage ? ` · ${hit.damage} damage` : ""}.`;
}
function addResolutionLog(state: CombatState, actorId: string, actorName: string, skillId: string, targets: readonly CombatUnit[], hits: readonly SkillHitResult[]): CombatState {
  const names = new Map<string, string>();
  state.heroes.forEach((item) => names.set(item.unit.combatantId, item.hero.name));
  state.enemies.forEach((item) => names.set(item.unit.combatantId, getEnemyDefinition(item.instance.enemyDefinitionId).name));
  const message = hits.map((hit) => rollMessage(actorName, skillId, names.get(hit.targetId) ?? hit.targetId, hit)).join(" ");
  const entry: CombatLogEntry = { turn: state.turn, actorId, actionId: skillId, targetIds: targets.map((target) => target.combatantId), message };
  return { ...state, log: [...state.log, entry], lastRoll: [...hits].reverse().find((hit) => hit.diceRoll !== undefined) ?? state.lastRoll };
}

/** Advances automatic turns until player input is needed or combat ends. */
export function advanceCombat(state: CombatState, random: RandomSource): CombatState {
  let next = withOutcome(state); let safety = 0;
  while (next.status === "active" && !next.awaitingHeroId && safety++ < 100) {
    if (next.turnCursor >= next.turnOrderIds.length) {
      next = { ...next, round: next.round + 1, turnCursor: 0 };
    }
    const actorId = next.turnOrderIds[next.turnCursor]; if (!actorId) break;
    const heroIndex = next.heroes.findIndex((item) => item.unit.combatantId === actorId);
    if (heroIndex >= 0) {
      const combatant = next.heroes[heroIndex]!;
      if (!combatant.unit.isAlive) { next = { ...next, turnCursor: next.turnCursor + 1 }; continue; }
      let instance = regenerateHeroResources(combatant.instance);
      const started = resolveStartOfTurnConditions({ ...combatant.unit, currentHP: instance.currentHP, activeConditions: instance.activeConditions });
      instance = { ...instance, currentHP: started.unit.currentHP, isAlive: started.unit.isAlive, activeConditions: started.unit.activeConditions };
      const heroItems = [...next.heroes]; heroItems[heroIndex] = { ...combatant, instance, unit: started.unit };
      next = withOutcome({ ...next, heroes: heroItems }); if (next.status !== "active") break;
      if (started.skipTurn) {
        instance = { ...instance, activeConditions: advanceCombatConditions(instance.activeConditions), activeCooldowns: advanceCooldowns(instance.activeCooldowns) };
        heroItems[heroIndex] = { ...heroItems[heroIndex]!, instance, unit: { ...started.unit, activeConditions: instance.activeConditions } };
        next = { ...next, heroes: heroItems, turnCursor: next.turnCursor + 1, turn: next.turn + 1 }; continue;
      }
      next = { ...next, heroes: heroItems, awaitingHeroId: actorId, actions: { movementUsed: false, combatActionUsed: false } }; break;
    }
    const enemyIndex = next.enemies.findIndex((item) => item.unit.combatantId === actorId);
    if (enemyIndex < 0 || !next.enemies[enemyIndex]!.unit.isAlive) { next = { ...next, turnCursor: next.turnCursor + 1 }; continue; }
    let enemy = next.enemies[enemyIndex]!; let board = next.board;
    const behavior = getEnemyTacticalBehavior(enemy.instance); const target = selectTacticalTarget(enemy.unit, next.heroes.map((item) => item.unit), behavior, random);
    if (target) {
      const destination = chooseEnemyDestination(board, enemy.unit, target, behavior);
      if (positionKey(destination) !== positionKey(enemy.unit.position)) {
        const moved = moveOccupant(board, actorId, enemy.unit.position, destination, enemy.unit.movementRange); board = moved.board;
        enemy = { instance: { ...enemy.instance, position: destination }, unit: { ...enemy.unit, position: destination } };
      }
    }
    const enemyItems = [...next.enemies]; enemyItems[enemyIndex] = enemy;
    const result = resolveEnemyTurn({ instance: enemy.instance, actor: enemy.unit, heroes: next.heroes.map((item) => item.unit), allies: enemyItems.map((item) => item.unit), enemyInstances: enemyItems.map((item) => item.instance), heroDefinitionsById: Object.fromEntries(next.heroes.map((item) => [item.hero.id, item.hero])), board }, random);
    let enemies = [...enemyItems]; enemies[enemyIndex] = { instance: result.instance, unit: result.actor }; let heroes = next.heroes;
    if (result.skillResult) {
      const heroTargets = result.skillResult.targets.filter((unit) => unit.side === "heroes"); const enemyTargets = result.skillResult.targets.filter((unit) => unit.side === "enemies");
      heroes = replaceUnits(heroes, heroTargets).map((item) => ({ ...item, instance: { ...item.instance, currentHP: item.unit.currentHP, isAlive: item.unit.isAlive, activeConditions: item.unit.activeConditions } }));
      enemies = replaceUnits(enemies, enemyTargets).map((item) => ({ ...item, instance: { ...item.instance, currentHP: item.unit.currentHP, isAlive: item.unit.isAlive, activeConditions: item.unit.activeConditions, activeConditionIds: item.unit.activeConditions.map((condition) => condition.conditionId) } }));
      next = addResolutionLog({ ...next, board }, actorId, getEnemyDefinition(enemy.instance.enemyDefinitionId).name, result.skillResult.resolution.skillId, result.skillResult.targets, result.skillResult.resolution.hits);
    }
    board = clearDefeatedOccupants(board, [...heroes.map((item) => item.unit), ...enemies.map((item) => item.unit)]);
    next = withOutcome({ ...next, board, enemies, heroes, turnCursor: next.turnCursor + 1, turn: next.turn + 1 });
  }
  return next;
}

export function moveCurrentHero(state: CombatState, destination: GridPosition): CombatState {
  if (!state.awaitingHeroId) throw new Error("No hero is awaiting input");
  if (state.actions.movementUsed) throw new Error("Movement action already used");
  const index = state.heroes.findIndex((item) => item.unit.combatantId === state.awaitingHeroId); const combatant = state.heroes[index]!;
  const moved = moveOccupant(state.board, combatant.unit.combatantId, combatant.unit.position, destination, combatant.unit.movementRange, combatant.unit.ignoredTerrainMovementCosts);
  const heroes = [...state.heroes]; heroes[index] = { ...combatant, instance: { ...combatant.instance, position: destination }, unit: { ...combatant.unit, position: destination } };
  return { ...state, board: moved.board, heroes, actions: { ...state.actions, movementUsed: true }, log: [...state.log, { turn: state.turn, actorId: combatant.hero.id, actionId: "move", targetIds: [], message: `${combatant.hero.name} moved ${moved.path.length - 1} tiles.` }] };
}

export function performHeroTurn(state: CombatState, skillId: string, random: RandomSource, selectedTargetId?: string, targetPosition?: GridPosition): CombatState {
  if (!state.awaitingHeroId) throw new Error("No hero is awaiting input");
  if (state.actions.combatActionUsed) throw new Error("Combat action already used");
  const heroIndex = state.heroes.findIndex((item) => item.hero.id === state.awaitingHeroId); const combatant = state.heroes[heroIndex]!;
  const skill = HERO_SKILLS[skillId]; if (!skill) throw new Error(`Unknown hero skill: ${skillId}`);
  const availability = getHeroSkillAvailability(combatant.hero, combatant.instance, combatant.unit, skillId, state.heroes.map((item) => item.unit), state.enemies.map((item) => item.unit), state.board);
  if (!availability.enabled) throw new Error(availability.reasons.join(", "));
  const allValid = getValidTargets(skill.targetType ?? "single_enemy", combatant.unit, state.heroes.map((item) => item.unit), state.enemies.map((item) => item.unit));
  const range = getHeroSkillRange(combatant.hero, skill);
  const inRange = getTargetsInSkillRange(skill, combatant.unit, allValid, state.board, range);
  let targets: CombatUnit[];
  if (skill.areaRadius !== undefined) {
    const center = targetPosition ?? inRange.find((unit) => unit.combatantId === selectedTargetId)?.position;
    if (!center || !isPositionInSkillRange(combatant.unit.position, center, skill, state.board, CLASSES[combatant.hero.classId])) throw new Error("Select a target tile in range");
    const area = new Set(getAreaPositions(center, skill.areaRadius, state.board).map(positionKey));
    const candidates = skill.friendlyFire ? [...state.heroes.map((item) => item.unit), ...state.enemies.map((item) => item.unit)] : state.enemies.map((item) => item.unit);
    targets = candidates.filter((unit) => unit.isAlive && area.has(positionKey(unit.position)));
  } else if (skill.targetType === "all_enemies" || skill.targetType === "all_allies" || skill.targetType === "self") targets = inRange;
  else {
    const explicit = inRange.find((unit) => unit.combatantId === selectedTargetId);
    targets = explicit ? [explicit] : inRange.length ? [random.pick(inRange)] : [];
  }
  if (!targets.length) throw new Error("No valid target in range");
  const action = resolveHeroAction(combatant.hero, combatant.instance, combatant.unit, targets, skillId, random);
  const heroes = [...state.heroes]; heroes[heroIndex] = { ...combatant, instance: action.instance, unit: action.actor };
  const enemyTargets = action.targets.filter((unit) => unit.side === "enemies"); const heroTargets = action.targets.filter((unit) => unit.side === "heroes");
  const enemies = replaceUnits(state.enemies, enemyTargets).map((item) => ({ ...item, instance: { ...item.instance, currentHP: item.unit.currentHP, isAlive: item.unit.isAlive, activeConditions: item.unit.activeConditions, activeConditionIds: item.unit.activeConditions.map((condition) => condition.conditionId) } }));
  const updatedHeroes = replaceUnits(heroes, heroTargets).map((item) => ({ ...item, instance: { ...item.instance, currentHP: item.unit.currentHP, isAlive: item.unit.isAlive, activeConditions: item.unit.activeConditions } }));
  const board = clearDefeatedOccupants(state.board, [...updatedHeroes.map((item) => item.unit), ...enemies.map((item) => item.unit)]);
  const logged = addResolutionLog({ ...state, board, heroes: updatedHeroes, enemies }, combatant.hero.id, combatant.hero.name, skillId, action.targets, action.skillResult.resolution.hits);
  return withOutcome({ ...logged, actions: { ...state.actions, combatActionUsed: true, usedSkillId: skillId } });
}

export function endCurrentHeroTurn(state: CombatState, random: RandomSource): CombatState {
  if (!state.awaitingHeroId) throw new Error("No hero is awaiting input");
  const index = state.heroes.findIndex((item) => item.hero.id === state.awaitingHeroId); const combatant = state.heroes[index]!;
  const instance = { ...combatant.instance, activeCooldowns: advanceCooldowns(combatant.instance.activeCooldowns, state.actions.usedSkillId), activeConditions: advanceCombatConditions(combatant.instance.activeConditions) };
  const heroes = [...state.heroes]; heroes[index] = { ...combatant, instance, unit: advanceSkillModifiers({ ...combatant.unit, activeConditions: instance.activeConditions }) };
  return advanceCombat(withOutcome({ ...state, heroes, awaitingHeroId: null, turnCursor: state.turnCursor + 1, turn: state.turn + 1 }), random);
}
