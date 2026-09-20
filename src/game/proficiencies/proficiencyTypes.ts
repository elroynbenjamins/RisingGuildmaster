import type { AttributeKey } from "../attributes/types";

export type SkillId = "acrobatics" | "animal_handling" | "arcana" | "athletics" | "deception" | "history" | "insight" | "intimidation" | "investigation" | "medicine" | "nature" | "perception" | "performance" | "persuasion" | "religion" | "sleight_of_hand" | "stealth" | "survival";
export type SkillProficiencyRank = "proficient" | "expertise";
export interface SkillDefinition { id: SkillId; name: string; attribute: AttributeKey; description: string }
