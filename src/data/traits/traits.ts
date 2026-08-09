import type { TraitId } from "../../game/heroes/types";
import type { Modifier } from "../../game/modifiers/types";
export interface TraitDefinition { id: TraitId; name: string; description: string; modifiers: Modifier[] }
const pct = (sourceId: TraitId, target: Modifier["target"], value: number, condition?: Modifier["condition"]): Modifier => ({ source: "trait", sourceId, target, operation: "percentage", value, condition });
const flat = (sourceId: TraitId, target: Modifier["target"], value: number): Modifier => ({ source: "trait", sourceId, target, operation: "flat", value });
export const TRAITS: Record<TraitId, TraitDefinition> = {
  brave: { id: "brave", name: "Brave", description: "Fights harder while wounded.", modifiers: [pct("brave", "physicalDamage", 0.1, { type: "hpRatioAtMost", value: 0.5 })] },
  greedy: { id: "greedy", name: "Greedy", description: "Finds more gold, but demands more pay.", modifiers: [pct("greedy", "questGold", 0.1), pct("greedy", "salary", 0.15)] },
  lazy: { id: "lazy", name: "Lazy", description: "Learns slowly and recovers slowly.", modifiers: [pct("lazy", "trainingXp", -0.15), pct("lazy", "recoveryDuration", 0.1)] },
  genius: { id: "genius", name: "Genius", description: "Excels at training and intellectual growth.", modifiers: [pct("genius", "trainingXp", 0.2), pct("genius", "intelligenceGrowth", 0.15)] },
  lucky: { id: "lucky", name: "Lucky", description: "Has a knack for treasure and critical hits.", modifiers: [pct("lucky", "rareLoot", 0.1), flat("lucky", "criticalChance", 0.03)] },
  reckless: { id: "reckless", name: "Reckless", description: "Deals more damage at greater risk.", modifiers: [pct("reckless", "physicalDamage", 0.15), pct("reckless", "injuryChance", 0.1)] },
};
