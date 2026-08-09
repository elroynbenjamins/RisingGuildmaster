import type { WorldEventDefinition } from "../../game/world/worldTypes";
export const WORLD_EVENTS: Record<string, WorldEventDefinition> = {
  broken_caravan: { id: "broken_caravan", title: "Broken Caravan", description: "A merchant caravan has broken a wheel on the road.", weight: 1, regionIds: ["greenveil", "iron_hills"], choices: [
    { id: "repair", text: "Help repair it", requirements: [{ type: "party_attribute_at_least", attribute: "strength", value: 12 }], abilityCheck: { attribute: "strength", difficultyClass: 12 }, successOutcomes: [{ type: "gold", value: 40 }, { type: "faction_reputation", factionId: "merchants", value: 2 }], failureOutcomes: [{ type: "none" }] },
    { id: "payment", text: "Demand payment first", abilityCheck: { attribute: "charisma", difficultyClass: 13 }, successOutcomes: [{ type: "gold", value: 70 }, { type: "faction_reputation", factionId: "merchants", value: -1 }], failureOutcomes: [{ type: "faction_reputation", factionId: "merchants", value: -2 }] },
    { id: "ignore", text: "Ignore the caravan", successOutcomes: [{ type: "none" }] },
  ] },
};
