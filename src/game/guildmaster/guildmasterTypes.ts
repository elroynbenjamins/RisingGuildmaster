export type GuildmasterSkillId =
  | "regional_network"
  | "specialist_headhunting"
  | "express_dispatches"
  | "workshop_planning"
  | "forge_charter"
  | "loom_charter"
  | "lapidary_charter"
  | "advanced_workshops"
  | "masterwork_district";

export interface GuildmasterProfile {
  level: number;
  xp: number;
  skillPoints: number;
  unlockedSkillIds: GuildmasterSkillId[];
}

export interface GuildmasterSkillDefinition {
  id: GuildmasterSkillId;
  name: string;
  description: string;
  levelRequirement: number;
  pointCost: number;
  prerequisiteSkillIds: GuildmasterSkillId[];
  branch: "scouting" | "artisans";
  icon: string;
}
