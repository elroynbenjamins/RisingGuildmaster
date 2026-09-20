import type { RogueliteRewardNodeType } from "../../game/roguelite/rogueliteTypes";

export interface LateRogueliteRecipeDropDefinition {
  encounterId: string;
  nodeType: RogueliteRewardNodeType;
  minimumPartyLevel: number;
  recipeId: string;
}

/** Existing trophy recipes gain alternate, thematically matched late-game roguelite sources. */
export const LATE_ROGUELITE_RECIPE_DROPS: Record<string, LateRogueliteRecipeDropDefinition> = {
  rl_arctic_pale_echo_boss: { encounterId: "rl_arctic_pale_echo_boss", nodeType: "boss", minimumPartyLevel: 9, recipeId: "forge_pale_echo_lance" },
  rl_undead_archivist_echo_boss: { encounterId: "rl_undead_archivist_echo_boss", nodeType: "boss", minimumPartyLevel: 8, recipeId: "tailor_archivists_mantle" },
  rl_desert_ash_herald_boss: { encounterId: "rl_desert_ash_herald_boss", nodeType: "boss", minimumPartyLevel: 8, recipeId: "forge_heralds_cinderblade" },
  rl_waste_laurel_elite: { encounterId: "rl_waste_laurel_elite", nodeType: "elite", minimumPartyLevel: 10, recipeId: "tailor_free_oath_coat" },
  rl_waste_varkesh_boss: { encounterId: "rl_waste_varkesh_boss", nodeType: "boss", minimumPartyLevel: 12, recipeId: "forge_concordance_glaive" },
};
