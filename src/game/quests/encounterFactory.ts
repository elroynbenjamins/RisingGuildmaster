import { QUEST_ENCOUNTERS } from "../../data/encounters/questEncounters";
import { getEnemyDefinition } from "../../data/enemies";
import { ENEMY_BASE_STATS, ENEMY_LEVEL_STAT_GROWTH } from "../../config/combatConfig";
import type { RandomSource } from "../../utils/random";
import { calculateEnemyStats } from "../enemies/enemyCalculator";
import { createEnemyInstance } from "../enemies/enemyFactory";
import type { EnemyInstance } from "../enemies/enemyTypes";
import type { CombatUnit } from "../combat/combatTypes";
import { getPermanentPassiveModifiers } from "../combat/passiveService";
import { calculateEnemyInitiativeBonus } from "../combat/tacticalStats";

export interface GeneratedEnemy { instance: EnemyInstance; unit: CombatUnit }
export function createQuestEncounter(encounterId: string, random: RandomSource): GeneratedEnemy[] {
  const encounter = QUEST_ENCOUNTERS[encounterId]; if (!encounter) throw new Error(`Unknown quest encounter: ${encounterId}`);
  return encounter.enemies.flatMap((entry) => Array.from({ length: entry.count }, (_, index) => {
    const scaling = { levelMultiplier: 1 + (entry.level - 1) * ENEMY_LEVEL_STAT_GROWTH, difficultyMultiplier: entry.difficultyMultiplier ?? 1 };
    const instance = createEnemyInstance(entry.enemyDefinitionId, ENEMY_BASE_STATS, random, { level: entry.level, scaling });
    const definition = getEnemyDefinition(entry.enemyDefinitionId); const stats = calculateEnemyStats(ENEMY_BASE_STATS, definition, scaling);
    const movementRange = Math.min(5, Math.max(2, 3 + Math.floor(stats.speed / 30)));
    const position = entry.spawnPositions[index];
    if (!position) throw new Error(`Missing spawn position for ${entry.enemyDefinitionId}`);
    const unit: CombatUnit = { combatantId: instance.instanceId, side: "enemies", factionId: definition.factionId, currentHP: instance.currentHP, maxHP: instance.maxHP, stats: { physicalDamage: stats.physicalDamage, physicalDefense: stats.physicalDefense, magicDamage: stats.magicDamage, magicDefense: stats.magicDefense, speed: stats.speed, initiativeBonus: calculateEnemyInitiativeBonus(stats.speed), evasion: 0, criticalChance: .05, accuracy: 0, healingPower: 0, physicalAttackBonus: entry.level + 3, magicAttackBonus: entry.level + 2, armorClass: 12 + Math.floor(stats.physicalDefense / 20), magicDefenseScore: 11 + Math.floor(stats.magicDefense / 20), attackRollModifier: 0, rangedAttackRollModifier: 0 }, activeConditions: [], activeModifiers: getPermanentPassiveModifiers(definition).map((modifier) => ({ ...modifier, sourceSkillId: "enemy_passive" })), isAlive: true, position: instance.position, movementRange };
    instance.movementRange = movementRange;
    instance.position = { ...position };
    unit.position = { ...position };
    return { instance, unit };
  }));
}
