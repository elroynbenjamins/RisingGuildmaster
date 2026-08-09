import { ENCOUNTERS } from "../../data/enemies/encounters";
import type { RandomSource } from "../../utils/random";
import { createEncounterInstances, type CreateEnemyOptions } from "./enemyFactory";
import type { EnemyBaseStats, EnemyInstance } from "./enemyTypes";

export function createEncounter(encounterId: string, baseStats: EnemyBaseStats, random: RandomSource, options: CreateEnemyOptions = {}): EnemyInstance[] {
  const template = ENCOUNTERS[encounterId];
  if (!template) throw new Error(`Unknown encounter template: ${encounterId}`);
  return createEncounterInstances(template.enemies, baseStats, random, options);
}
