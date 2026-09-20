import { BOSS_PHASES } from "../../data/bosses/bossPhases";
import { findRaidByQuestId } from "../raids/raidService";
import type { CombatState, EnemyCombatant, HeroCombatant } from "../combat/combatEngine";
import type { CombatBoardState, GridPosition } from "../combat/grid/gridTypes";
import { getTile } from "../combat/grid/gridTypes";
import { setOccupant } from "../combat/grid/boardFactory";
import { resolveNewBossPhases } from "./bossPhaseService";

const phaseSource = (phaseId: string) => `boss_phase:${phaseId}`;
const distance = (a: GridPosition, b: GridPosition) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function appendLog(state: CombatState, phaseId: string, message: string): CombatState {
  return {
    ...state,
    log: [...state.log, { turn: state.turn, actorId: "boss_mechanic", actionId: phaseId, targetIds: [], message }],
    lastVisualEvent: { id: state.log.length + 1 + state.turn * 1000, kind: "phase", actionId: phaseId, actorId: "boss_mechanic", range: 0, effects: [] },
  };
}

function freeSpawnPositions(board: CombatBoardState, origin: GridPosition): GridPosition[] {
  return board.tiles
    .filter((tile) => !tile.blocksMovement && tile.occupantId === null)
    .map((tile) => tile.position)
    .sort((a, b) => distance(a, origin) - distance(b, origin) || a.y - b.y || a.x - b.x);
}

function cloneSummon(template: EnemyCombatant, instanceId: string, position: GridPosition): EnemyCombatant {
  const permanentModifiers = template.unit.activeModifiers.filter((modifier) => modifier.durationTurns < 0 && !modifier.sourceSkillId.startsWith("boss_phase:"));
  return {
    instance: {
      ...template.instance,
      instanceId,
      currentHP: template.instance.maxHP,
      activeConditionIds: [],
      activeConditions: [],
      activeCooldowns: {},
      isAlive: true,
      position: { ...position },
      triggeredPhaseIds: [],
    },
    unit: {
      ...template.unit,
      combatantId: instanceId,
      currentHP: template.unit.maxHP,
      activeConditions: [],
      activeModifiers: permanentModifiers,
      isAlive: true,
      position: { ...position },
    },
  };
}

function applyHeroPulse(state: CombatState, ratio: number, phaseName: string): CombatState {
  let board = state.board;
  let casualties = 0;
  const heroes = state.heroes.map((hero) => {
    if (!hero.unit.isAlive) return hero;
    const damage = Math.max(1, Math.round(hero.unit.maxHP * ratio));
    const hp = Math.max(0, hero.unit.currentHP - damage);
    if (hp === 0) {
      casualties++;
      const tile = getTile(board, hero.unit.position);
      if (tile?.occupantId === hero.unit.combatantId) board = setOccupant(board, hero.unit.position, null);
    }
    return {
      ...hero,
      unit: { ...hero.unit, currentHP: hp, isAlive: hp > 0 },
      instance: { ...hero.instance, currentHP: hp, isAlive: hp > 0 },
    };
  });
  const message = `${phaseName}: the phase shock deals ${Math.round(ratio * 100)}% max-HP pressure to the company${casualties ? ` · ${casualties} hero${casualties === 1 ? "" : "es"} fell` : ""}.`;
  return { ...appendLog({ ...state, heroes, board }, "boss_phase_pulse", message), status: heroes.every((hero) => !hero.unit.isAlive) ? "defeat" : state.status };
}

function applyHeroModifiers(heroes: HeroCombatant[], phaseId: string, modifiers: NonNullable<(typeof BOSS_PHASES)[string]["heroModifiers"]>): HeroCombatant[] {
  const sourceSkillId = phaseSource(phaseId);
  return heroes.map((hero) => !hero.unit.isAlive ? hero : {
    ...hero,
    unit: { ...hero.unit, activeModifiers: [...hero.unit.activeModifiers, ...modifiers.map((modifier) => ({ ...modifier, sourceSkillId }))] },
  });
}

function applyPhase(state: CombatState, enemyIndex: number, phaseId: string): CombatState {
  const phase = BOSS_PHASES[phaseId];
  if (!phase) return state;
  let next = state;
  const currentBoss = next.enemies[enemyIndex];
  if (!currentBoss?.unit.isAlive) return next;

  const sourceSkillId = phaseSource(phase.id);
  const bossModifiers = phase.selfModifiers.map((modifier) => ({ ...modifier, sourceSkillId }));
  let bossUnit = bossModifiers.length ? { ...currentBoss.unit, activeModifiers: [...currentBoss.unit.activeModifiers, ...bossModifiers] } : currentBoss.unit;
  let bossInstance = currentBoss.instance;
  if (phase.bossHealMaxHpRatio) {
    const heal = Math.max(1, Math.round(bossUnit.maxHP * phase.bossHealMaxHpRatio));
    const hp = Math.min(bossUnit.maxHP, bossUnit.currentHP + heal);
    bossUnit = { ...bossUnit, currentHP: hp };
    bossInstance = { ...bossInstance, currentHP: hp };
  }
  const enemies = [...next.enemies];
  enemies[enemyIndex] = { ...currentBoss, instance: bossInstance, unit: bossUnit };
  next = { ...next, enemies };

  if (phase.heroModifiers?.length) next = { ...next, heroes: applyHeroModifiers(next.heroes, phase.id, phase.heroModifiers) };

  if (phase.summonGroups.length) {
    let board = next.board;
    const additions: EnemyCombatant[] = [];
    const spawnPositions = freeSpawnPositions(board, bossUnit.position);
    let positionCursor = 0;
    for (const group of phase.summonGroups) {
      const template = next.enemies.find((entry) => entry.instance.enemyDefinitionId === group.enemyDefinitionId);
      if (!template) continue;
      for (let index = 0; index < group.count; index++) {
        const position = spawnPositions[positionCursor++];
        if (!position) break;
        const instanceId = `${currentBoss.instance.instanceId}-${phase.id}-${group.enemyDefinitionId}-${index + 1}`;
        const summon = cloneSummon(template, instanceId, position);
        board = setOccupant(board, position, instanceId);
        additions.push(summon);
      }
    }
    if (additions.length) next = { ...next, board, enemies: [...next.enemies, ...additions], turnOrderIds: [...next.turnOrderIds, ...additions.map((entry) => entry.unit.combatantId)] };
  }

  next = appendLog(next, phase.id, `BOSS PHASE — ${phase.name}. ${phase.announcement}`);
  if (phase.bossHealMaxHpRatio) next = appendLog(next, `${phase.id}_heal`, `${phase.name}: the boss restores ${Math.round(phase.bossHealMaxHpRatio * 100)}% of maximum HP.`);
  if (phase.heroPulseDamageMaxHpRatio) next = applyHeroPulse(next, phase.heroPulseDamageMaxHpRatio, phase.name);
  return next;
}

/**
 * Resolves newly crossed standard-boss thresholds. Raid quests are explicitly
 * excluded so their bespoke eight-hero phase engine remains the only mechanic
 * controller in raid encounters.
 */
export function resolveBossPhaseTransitions(state: CombatState): CombatState {
  if (state.status !== "active" || findRaidByQuestId(state.questId)) return state;
  let next = state;
  for (let index = 0; index < next.enemies.length; index++) {
    const enemy = next.enemies[index]!;
    const resolved = resolveNewBossPhases(enemy.instance);
    if (!resolved.triggeredPhaseIds.length) continue;
    const enemies = [...next.enemies];
    enemies[index] = { ...enemy, instance: resolved.instance };
    next = { ...next, enemies };
    for (const phaseId of resolved.triggeredPhaseIds) {
      next = applyPhase(next, index, phaseId);
      if (next.status !== "active") return next;
    }
  }
  return next;
}

export function getLatestBossPhaseId(state: CombatState): string | null {
  if (findRaidByQuestId(state.questId)) return null;
  for (let index = state.enemies.length - 1; index >= 0; index--) {
    const ids = state.enemies[index]?.instance.triggeredPhaseIds;
    if (ids?.length) return ids[ids.length - 1] ?? null;
  }
  return null;
}
