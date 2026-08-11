import type { TraitId } from "../../game/heroes/types";
import type { Modifier } from "../../game/modifiers/types";

export type TraitCategory = "combat" | "progression" | "economy" | "recovery" | "fortune";
export type TraitPolarity = "positive" | "mixed" | "negative";
export interface TraitDefinition { id: TraitId; name: string; description: string; category: TraitCategory; polarity: TraitPolarity; generationWeight: number; modifiers: Modifier[] }

const pct = (sourceId: TraitId, target: Modifier["target"], value: number, condition?: Modifier["condition"]): Modifier => ({ source: "trait", sourceId, target, operation: "percentage", value, condition });
const flat = (sourceId: TraitId, target: Modifier["target"], value: number): Modifier => ({ source: "trait", sourceId, target, operation: "flat", value });
const define = (id: TraitId, name: string, description: string, category: TraitCategory, polarity: TraitPolarity, generationWeight: number, modifiers: Modifier[]): TraitDefinition => ({ id, name, description, category, polarity, generationWeight, modifiers });

export const TRAITS: Record<TraitId, TraitDefinition> = {
  brave: define("brave", "Brave", "Fights harder while wounded.", "combat", "positive", 10, [pct("brave", "physicalDamage", .10, { type: "hpRatioAtMost", value: .50 })]),
  greedy: define("greedy", "Greedy", "Finds more gold, but demands more pay.", "economy", "mixed", 8, [pct("greedy", "questGold", .10), pct("greedy", "salary", .15)]),
  lazy: define("lazy", "Lazy", "Learns slowly and takes longer to recover.", "progression", "negative", 7, [pct("lazy", "trainingXp", -.15), pct("lazy", "recoveryDuration", .10)]),
  genius: define("genius", "Genius", "Excels at training and intellectual growth.", "progression", "positive", 6, [pct("genius", "trainingXp", .20), pct("genius", "intelligenceGrowth", .15)]),
  lucky: define("lucky", "Lucky", "Has a knack for treasure and critical hits.", "fortune", "positive", 4, [pct("lucky", "rareLoot", .10), flat("lucky", "criticalChance", .03)]),
  reckless: define("reckless", "Reckless", "Deals more physical damage at greater risk of injury.", "combat", "mixed", 8, [pct("reckless", "physicalDamage", .15), pct("reckless", "injuryChance", .10)]),

  tough: define("tough", "Tough", "Can absorb punishment that would fell another adventurer.", "combat", "positive", 9, [pct("tough", "maxHP", .10)]),
  nimble: define("nimble", "Nimble", "Quick and precise, but less physically robust.", "combat", "mixed", 8, [flat("nimble", "dexterity", 2), flat("nimble", "constitution", -1)]),
  iron_willed: define("iron_willed", "Iron-Willed", "Possesses exceptional resolve against magic and fear.", "combat", "positive", 7, [flat("iron_willed", "wisdom", 2), pct("iron_willed", "magicDefense", .10)]),
  arcane_touched: define("arcane_touched", "Arcane-Touched", "Channels unusually potent magic through a fragile body.", "combat", "mixed", 5, [pct("arcane_touched", "magicPower", .15), pct("arcane_touched", "maxHP", -.08)]),
  cautious: define("cautious", "Cautious", "Prioritizes defense over finishing an enemy quickly.", "combat", "mixed", 8, [pct("cautious", "physicalDefense", .15), pct("cautious", "physicalAttack", -.08)]),
  fleet_footed: define("fleet_footed", "Fleet-Footed", "Moves rapidly but sacrifices some protection.", "combat", "mixed", 7, [pct("fleet_footed", "speed", .15), pct("fleet_footed", "physicalDefense", -.05)]),
  hardy: define("hardy", "Hardy", "Recovers quickly and possesses a durable constitution.", "recovery", "positive", 7, [flat("hardy", "constitution", 2), pct("hardy", "recoveryDuration", -.15)]),
  quick_learner: define("quick_learner", "Quick Learner", "Improves rapidly in training but knows their value.", "progression", "mixed", 7, [pct("quick_learner", "trainingXp", .12), pct("quick_learner", "salary", .05)]),
  frugal: define("frugal", "Frugal", "Accepts modest pay, but rarely pushes for extra profit.", "economy", "mixed", 6, [pct("frugal", "salary", -.10), pct("frugal", "questGold", -.05)]),
  silver_tongued: define("silver_tongued", "Silver-Tongued", "Negotiates with effortless charm and expects premium treatment.", "economy", "mixed", 6, [flat("silver_tongued", "charisma", 3), pct("silver_tongued", "salary", .10)]),
  sickly: define("sickly", "Sickly", "A frail constitution limits endurance and survivability.", "recovery", "negative", 6, [flat("sickly", "constitution", -2), pct("sickly", "maxHP", -.05)]),
  clumsy: define("clumsy", "Clumsy", "Poor coordination makes movement and precise action difficult.", "combat", "negative", 7, [flat("clumsy", "dexterity", -2), pct("clumsy", "speed", -.10)]),
};
