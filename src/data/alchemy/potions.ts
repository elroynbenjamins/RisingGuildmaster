import type { PotionDefinition, PotionId } from "../../game/alchemy/potionTypes";

export const POTIONS: Record<PotionId, PotionDefinition> = {
  minor_healing_potion: { id:"minor_healing_potion", name:"Minor Healing Potion", description:"Restores 30% maximum HP in combat.", tier:1, goldCost:35, materials:{ spider_silk:1, oak_timber:1 }, restoreHpRatio:.30 },
  mana_tonic: { id:"mana_tonic", name:"Mana Tonic", description:"Restores 35% maximum mana in combat.", tier:1, goldCost:45, materials:{ arcane_dust:1, rough_sapphire:1 }, restoreManaRatio:.35 },
  stamina_draught: { id:"stamina_draught", name:"Stamina Draught", description:"Restores 40% combat stamina.", tier:1, goldCost:30, materials:{ wolf_pelt:1, coal:1 }, restoreStaminaRatio:.40 },

  greater_healing_potion: { id:"greater_healing_potion", name:"Greater Healing Potion", description:"Restores 55% maximum HP in combat.", tier:2, requiredRegionId:"iron_hills", goldCost:90, materials:{ silver_ore:1, spider_silk:2, rough_ruby:1 }, restoreHpRatio:.55 },
  greater_mana_tonic: { id:"greater_mana_tonic", name:"Greater Mana Tonic", description:"Restores 60% maximum mana in combat.", tier:2, requiredRegionId:"shadowfen", goldCost:105, materials:{ arcane_dust:3, rough_sapphire:1, silver_ore:1 }, restoreManaRatio:.60 },
  greater_stamina_draught: { id:"greater_stamina_draught", name:"Greater Stamina Draught", description:"Restores 65% combat stamina.", tier:2, requiredRegionId:"frostmarch", goldCost:85, materials:{ frost_crystal:1, wolf_pelt:2, coal:1 }, restoreStaminaRatio:.65 },
  antitoxin: { id:"antitoxin", name:"Antitoxin", description:"Cures poison or infection outside combat and clears poison during combat.", tier:2, requiredRegionId:"shadowfen", goldCost:70, materials:{ venom_gland:1, spider_silk:1, arcane_dust:1 }, curePersistentConditionIds:["poisoned","infected"], cureCombatConditionIds:["poisoned"] },
  cleansing_draught: { id:"cleansing_draught", name:"Cleansing Draught", description:"A late-game remedy for disease, infection and curses. Also clears common magical afflictions in combat.", tier:3, requiredRegionId:"ashlands", requiredCampaignChapter:5, goldCost:150, materials:{ arcane_dust:4, rough_sapphire:1, rough_topaz:1, frost_crystal:1 }, curePersistentConditionIds:["diseased","infected","cursed"], cureCombatConditionIds:["poisoned","burning","frozen","rooted"] },
};
