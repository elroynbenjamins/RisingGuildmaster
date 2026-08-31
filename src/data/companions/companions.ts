import type { CompanionPortraitId } from "./companionArt";

export interface CompanionDefinition {
  id: CompanionPortraitId;
  name: string;
  role: string;
  description: string;
  accent: "nature" | "spirit" | "arcane";
}

export const COMPANIONS: Record<CompanionPortraitId, CompanionDefinition> = {
  wolf_companion: {
    id: "wolf_companion",
    name: "Wolf Companion",
    role: "Physical pressure",
    description: "A bonded hunting wolf that attacks alongside its Beastmaster on the hero's initiative.",
    accent: "nature",
  },
  bound_wisp: {
    id: "bound_wisp",
    name: "Bound Wisp",
    role: "Arcane support",
    description: "A brief spirit binding that reinforces its summoner's magical attacks.",
    accent: "spirit",
  },
  greater_eidolon: {
    id: "greater_eidolon",
    name: "Greater Eidolon",
    role: "Arcane guardian",
    description: "A durable greater spirit that protects its summoner while adding magical pressure.",
    accent: "arcane",
  },
};

export function getCompanionDefinition(companionId: string): CompanionDefinition | undefined {
  return COMPANIONS[companionId as CompanionPortraitId];
}
