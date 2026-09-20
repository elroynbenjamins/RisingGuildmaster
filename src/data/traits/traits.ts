import type { TraitId } from "../../game/heroes/types";
import type { Modifier } from "../../game/modifiers/types";

export type TraitCategory = "combat" | "progression" | "economy" | "recovery" | "fortune" | "exploration" | "social";
export type TraitPolarity = "positive" | "mixed" | "negative";
export interface TraitDefinition { id: TraitId; name: string; description: string; category: TraitCategory; polarity: TraitPolarity; generationWeight: number; modifiers: Modifier[]; incompatibleTraitIds?: TraitId[] }

const pct = (sourceId: TraitId, target: Modifier["target"], value: number, condition?: Modifier["condition"]): Modifier => ({ source: "trait", sourceId, target, operation: "percentage", value, condition });
const flat = (sourceId: TraitId, target: Modifier["target"], value: number): Modifier => ({ source: "trait", sourceId, target, operation: "flat", value });
const define = (id: TraitId, name: string, description: string, category: TraitCategory, polarity: TraitPolarity, generationWeight: number, modifiers: Modifier[]): TraitDefinition => ({ id, name, description, category, polarity, generationWeight, modifiers });

export const TRAITS: Record<TraitId, TraitDefinition> = {
  brave: define("brave", "Brave", "Fights harder while wounded.", "combat", "positive", 10, [pct("brave", "physicalDamage", .10, { type: "hpRatioAtMost", value: .50 })]),
  greedy: define("greedy", "Greedy", "Finds more gold, but demands more pay.", "economy", "mixed", 8, [pct("greedy", "questGold", .10), pct("greedy", "salary", .15)]),
  lazy: define("lazy", "Lazy", "Learns slowly and takes longer to recover.", "progression", "negative", 7, [pct("lazy", "trainingXp", -.15), pct("lazy", "recoveryDuration", .10)]),
  genius: define("genius", "Genius", "Absorbs instruction unusually quickly.", "progression", "positive", 6, [pct("genius", "trainingXp", .20)]),
  lucky: define("lucky", "Lucky", "Has a knack for treasure and critical hits.", "fortune", "positive", 4, [pct("lucky", "rareLoot", .10), flat("lucky", "criticalChance", .03)]),
  reckless: define("reckless", "Reckless", "Deals more physical damage at greater risk of injury.", "combat", "mixed", 8, [pct("reckless", "physicalDamage", .15), pct("reckless", "injuryChance", .10)]),

  tough: define("tough", "Tough", "Can absorb punishment that would fell another adventurer.", "combat", "positive", 9, [pct("tough", "maxHP", .10)]),
  nimble: define("nimble", "Nimble", "Fast reactions improve initiative, but a lighter stance offers less protection.", "combat", "mixed", 8, [flat("nimble", "initiative", 1), flat("nimble", "armorClass", -1)]),
  iron_willed: define("iron_willed", "Iron-Willed", "Possesses exceptional resolve against magic and fear.", "combat", "positive", 7, [flat("iron_willed", "magicDefenseScore", 1)]),
  arcane_touched: define("arcane_touched", "Arcane-Touched", "Channels unusually potent magic through a fragile body.", "combat", "mixed", 5, [pct("arcane_touched", "magicPower", .15), pct("arcane_touched", "maxHP", -.08)]),
  cautious: define("cautious", "Cautious", "Prioritizes defense over finishing an enemy quickly.", "combat", "mixed", 8, [pct("cautious", "physicalDefense", .15), pct("cautious", "physicalAttack", -.08)]),
  fleet_footed: define("fleet_footed", "Fleet-Footed", "Moves rapidly but sacrifices some protection.", "combat", "mixed", 7, [pct("fleet_footed", "speed", .15), pct("fleet_footed", "physicalDefense", -.05)]),
  hardy: define("hardy", "Hardy", "Recovers from wounds and exhaustion more quickly.", "recovery", "positive", 7, [pct("hardy", "recoveryDuration", -.15)]),
  quick_learner: define("quick_learner", "Quick Learner", "Improves rapidly in training but knows their value.", "progression", "mixed", 7, [pct("quick_learner", "trainingXp", .12), pct("quick_learner", "salary", .05)]),
  frugal: define("frugal", "Frugal", "Accepts modest pay, but rarely pushes for extra profit.", "economy", "mixed", 6, [pct("frugal", "salary", -.10), pct("frugal", "questGold", -.05)]),
  silver_tongued: define("silver_tongued", "Silver-Tongued", "Negotiates better rewards and expects premium treatment.", "economy", "mixed", 6, [pct("silver_tongued", "questGold", .05), pct("silver_tongued", "salary", .10)]),
  sickly: define("sickly", "Sickly", "Poor health limits endurance and lengthens recovery.", "recovery", "negative", 6, [pct("sickly", "maxHP", -.05), pct("sickly", "recoveryDuration", .10)]),
  clumsy: define("clumsy", "Clumsy", "Poor coordination makes precise action difficult.", "combat", "negative", 7, [flat("clumsy", "initiative", -2)]),

  alert: { ...define("alert", "Alert", "Constant vigilance grants a decisive edge when combat begins.", "combat", "positive", 5, [flat("alert", "initiative", 2)]), incompatibleTraitIds: ["absent_minded"] },
  perceptive: define("perceptive", "Perceptive", "Reads subtle tracks and dangers, improving the chance of finding valuable discoveries.", "exploration", "positive", 7, [pct("perceptive", "rareLoot", .04)]),
  powerful_build: define("powerful_build", "Powerful Build", "A broad frame delivers heavier blows but reacts more slowly.", "combat", "mixed", 7, [pct("powerful_build", "physicalDamage", .08), flat("powerful_build", "initiative", -1)]),
  keen_minded: { ...define("keen_minded", "Keen-Minded", "Retains obscure lore and learns unfamiliar techniques quickly.", "progression", "positive", 6, [pct("keen_minded", "trainingXp", .10)]), incompatibleTraitIds: ["absent_minded"] },
  steadfast: define("steadfast", "Steadfast", "Discipline makes this hero difficult to wear down or drive from the fight.", "recovery", "positive", 6, [pct("steadfast", "recoveryDuration", -.10), flat("steadfast", "magicDefenseScore", 1)]),
  inspiring: define("inspiring", "Inspiring", "A reassuring presence strengthens the guild's public standing.", "social", "positive", 5, [pct("inspiring", "questGold", .03)]),
  battle_hardened: define("battle_hardened", "Battle-Hardened", "Old scars and practiced instincts reduce both harm and recovery time.", "combat", "positive", 5, [pct("battle_hardened", "physicalDefense", .10), pct("battle_hardened", "recoveryDuration", -.05)]),
  duelist: { ...define("duelist", "Duelist", "Presses every opening aggressively, accepting less protection in return.", "combat", "mixed", 6, [pct("duelist", "physicalDamage", .08), pct("duelist", "physicalDefense", -.05)]), incompatibleTraitIds: ["cautious"] },
  spell_savant: define("spell_savant", "Spell Savant", "Channels exceptional arcane force through a body strained by the effort.", "combat", "mixed", 4, [pct("spell_savant", "magicDamage", .10), pct("spell_savant", "maxHP", -.05)]),
  gifted_healer: define("gifted_healer", "Gifted Healer", "Possesses a rare instinct for restoring life and stabilizing the wounded.", "recovery", "positive", 4, [pct("gifted_healer", "healingPower", .15)]),
  ambusher: define("ambusher", "Ambusher", "Excels at turning the first unnoticed opening into a telling strike.", "combat", "positive", 5, [flat("ambusher", "criticalChance", .02), pct("ambusher", "speed", .05)]),
  observant: define("observant", "Observant", "Notices discarded clues and valuable details while others hurry onward.", "exploration", "positive", 6, [pct("observant", "rareLoot", .05), flat("observant", "initiative", 1)]),
  resilient: { ...define("resilient", "Resilient", "Shrugs off hardship and returns from injury sooner than expected.", "recovery", "positive", 6, [pct("resilient", "maxHP", .06), pct("resilient", "recoveryDuration", -.10)]), incompatibleTraitIds: ["sickly"] },
  hotheaded: { ...define("hotheaded", "Hotheaded", "Hits harder when emotions flare, but leaves openings against magic.", "combat", "mixed", 7, [pct("hotheaded", "physicalDamage", .10), pct("hotheaded", "magicDefense", -.08)]), incompatibleTraitIds: ["cautious"] },
  timid: { ...define("timid", "Timid", "Hesitation weakens attacks and slows reactions under pressure.", "social", "negative", 5, [pct("timid", "physicalDamage", -.08), flat("timid", "initiative", -1)]), incompatibleTraitIds: ["brave", "inspiring"] },
  absent_minded: { ...define("absent_minded", "Absent-Minded", "Useful ideas arrive, but practical details and danger signs are often missed.", "progression", "negative", 5, [flat("absent_minded", "initiative", -2)]), incompatibleTraitIds: ["alert", "keen_minded"] },
  oathbound: define("oathbound", "Oathbound", "A deeply held promise lends spiritual resolve against hostile magic.", "social", "positive", 4, [flat("oathbound", "magicDefenseScore", 1)]),
  wanderer: define("wanderer", "Wanderer", "Long roads have taught efficient movement, useful scavenging, and quick recovery.", "exploration", "positive", 6, [pct("wanderer", "speed", .08), pct("wanderer", "rareLoot", .03), pct("wanderer", "recoveryDuration", -.05)]),
};
