import type { ConditionId } from "../../game/heroes/types";
import type { Modifier } from "../../game/modifiers/types";
export interface ConditionDefinition { id: ConditionId; name: string; durationDays: number; stackable: boolean; modifiers: Modifier[] }
const pct = (sourceId: ConditionId, target: Modifier["target"], value: number): Modifier => ({ source: "condition", sourceId, target, operation: "percentage", value });
export const CONDITIONS: Record<ConditionId, ConditionDefinition> = {
  injured: { id: "injured", name: "Injured", durationDays: 5, stackable: false, modifiers: [pct("injured", "physicalDamage", -0.2), pct("injured", "physicalDefense", -0.1)] },
  exhausted: { id: "exhausted", name: "Exhausted", durationDays: 2, stackable: false, modifiers: [pct("exhausted", "damage", -0.1), pct("exhausted", "speed", -0.15)] },
  inspired: { id: "inspired", name: "Inspired", durationDays: 3, stackable: false, modifiers: [pct("inspired", "damage", 0.1), pct("inspired", "trainingXp", 0.15)] },
  poisoned: { id: "poisoned", name: "Poisoned", durationDays: 3, stackable: false, modifiers: [pct("poisoned", "maxHP", -0.1), pct("poisoned", "healingReceived", -0.25)] },
  infected: { id: "infected", name: "Infected", durationDays: 3, stackable: false, modifiers: [pct("infected", "physicalDamage", -0.10)] },
};
