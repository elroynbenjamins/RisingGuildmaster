import type { EnemyFactionId } from "../../game/enemies/enemyTypes";

export interface EnemyFactionDefinition { id: EnemyFactionId; name: string }

export const ENEMY_FACTIONS: Record<EnemyFactionId, EnemyFactionDefinition> = {
  goblins: { id: "goblins", name: "Goblins" },
  undead: { id: "undead", name: "Undead" },
  beasts: { id: "beasts", name: "Beasts" },
  bandits: { id: "bandits", name: "Bandits" },
  orcs: { id: "orcs", name: "Orcs" },
};
