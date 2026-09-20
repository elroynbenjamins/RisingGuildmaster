import { CRAFTING_RECIPES } from "../data/crafting/recipes";
import { GATHERING_MISSIONS } from "../data/gathering/gatheringMissions";
import type { MaterialId } from "../game/crafting/craftingTypes";

export function getMaterialRecipeIds(materialId:MaterialId):string[]{
  return Object.values(CRAFTING_RECIPES).filter((recipe)=>(recipe.materials[materialId]??0)>0).map((recipe)=>recipe.id);
}
export function getMaterialMissionIds(materialId:MaterialId):string[]{
  return Object.values(GATHERING_MISSIONS).filter((mission)=>mission.materialDrops.some((drop)=>drop.materialId===materialId)).map((mission)=>mission.id);
}
