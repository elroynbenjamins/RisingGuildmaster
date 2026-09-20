import type { ArtisanBuildingTierDefinition, ArtisanDefinition, ArtisanType } from "../../game/crafting/craftingTypes";

export const ARTISANS: Record<ArtisanDefinition["id"], ArtisanDefinition> = {
  blacksmith: { id: "blacksmith", name: "Blacksmith", fantasyRole: "Weaponsmith and armorsmith", description: "Like a D&D smithy or MMORPG forge, the Blacksmith turns ore, coal, and steelwork into frontline weapons, plate, helmets, and reinforced boots.", supportedSlots: ["weapon", "armor", "helmet", "boots"] },
  tailor: { id: "tailor", name: "Tailor", fantasyRole: "Leatherworker, bowyer, and arcane clothier", description: "The Tailor's workshop crafts bows and staves alongside ranger leathers, caster robes, silk hoods, and mobile gear where flexibility matters more than heavy metal.", supportedSlots: ["weapon", "armor", "helmet", "boots"] },
  jeweler: { id: "jeweler", name: "Jeweler", fantasyRole: "Accessory crafter and enchanter", description: "The Jeweler cuts gems into rings and talismans, then binds gemstone effects onto weapons, armor, and accessories.", supportedSlots: ["accessory1", "accessory2"] },
};

export const ARTISAN_BUILDINGS: Record<ArtisanType, ArtisanBuildingTierDefinition[]> = {
  blacksmith: [
    { level: 1, name: "Guild Forge", goldCost: 800, durationDays: 2, requiredSkillId: "forge_charter" },
    { level: 2, name: "Steelworks", goldCost: 1100, durationDays: 3, requiredSkillId: "advanced_workshops" },
    { level: 3, name: "Master Forge", goldCost: 1900, durationDays: 4, requiredSkillId: "masterwork_district" },
  ],
  tailor: [
    { level: 1, name: "Loomhouse", goldCost: 700, durationDays: 2, requiredSkillId: "loom_charter" },
    { level: 2, name: "Runewoven Atelier", goldCost: 900, durationDays: 3, requiredSkillId: "advanced_workshops" },
    { level: 3, name: "Master Clothier Hall", goldCost: 1600, durationDays: 4, requiredSkillId: "masterwork_district" },
  ],
  jeweler: [
    { level: 1, name: "Lapidary Atelier", goldCost: 1000, durationDays: 3, requiredSkillId: "lapidary_charter" },
    { level: 2, name: "Enchanter's Gallery", goldCost: 1300, durationDays: 4, requiredSkillId: "advanced_workshops" },
    { level: 3, name: "Master Gemworks", goldCost: 2200, durationDays: 5, requiredSkillId: "masterwork_district" },
  ],
};
