import type { PotionDefinition, PotionId } from "../../game/alchemy/potionTypes";

export const POTIONS: Record<PotionId, PotionDefinition> = {
  minor_healing_potion: { id: "minor_healing_potion", name: "Minor Healing Potion", description: "Restores 30% maximum HP in combat.", goldCost: 35, materials: { spider_silk: 1, oak_timber: 1 }, restoreHpRatio: .30 },
  mana_tonic: { id: "mana_tonic", name: "Mana Tonic", description: "Restores 35% maximum mana in combat.", goldCost: 45, materials: { arcane_dust: 1, rough_sapphire: 1 }, restoreManaRatio: .35 },
  stamina_draught: { id: "stamina_draught", name: "Stamina Draught", description: "Restores 40% combat stamina.", goldCost: 30, materials: { wolf_pelt: 1, coal: 1 }, restoreStaminaRatio: .40 },
};
