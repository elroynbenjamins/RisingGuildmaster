import { POTIONS } from "../../data/alchemy/potions";
import type { CombatState } from "../combat/combatEngine";
import type { GuildState } from "../guild/types";
import type { PotionId } from "./potionTypes";

export function isPotionRecipeUnlocked(guild:GuildState,potionId:PotionId):boolean{
  const potion=POTIONS[potionId];
  if(potion.requiredRegionId&&!guild.world.unlockedRegionIds.includes(potion.requiredRegionId))return false;
  if(potion.requiredCampaignChapter&&guild.world.campaignChapter<potion.requiredCampaignChapter)return false;
  return true;
}
export function craftPotion(guild: GuildState, potionId: PotionId): GuildState {
  const potion = POTIONS[potionId];
  if(!isPotionRecipeUnlocked(guild,potionId))throw new Error("Potion recipe is not unlocked yet");
  if (guild.gold < potion.goldCost) throw new Error("Not enough gold");
  for (const [materialId, amount] of Object.entries(potion.materials)) if ((guild.materials[materialId as keyof typeof guild.materials] ?? 0) < amount) throw new Error("Missing "+materialId.replace(/_/g, " "));
  const materials = { ...guild.materials };
  for (const [materialId, amount] of Object.entries(potion.materials)) materials[materialId as keyof typeof materials] -= amount;
  return { ...guild, gold: guild.gold - potion.goldCost, materials, potions: { ...guild.potions, [potionId]: guild.potions[potionId] + 1 } };
}
export function usePersistentRemedy(guild:GuildState,heroId:string,potionId:PotionId):GuildState{
  const potion=POTIONS[potionId];
  const cures=new Set(potion.curePersistentConditionIds??[]);
  if(!cures.size)throw new Error("This potion is not an out-of-combat remedy");
  if((guild.potions[potionId]??0)<1)throw new Error("No potion available");
  const hero=guild.heroes.find((entry)=>entry.id===heroId);if(!hero)throw new Error("Hero unavailable");
  const nextConditions=hero.conditions.filter((condition)=>!cures.has(condition.conditionId));
  if(nextConditions.length===hero.conditions.length)throw new Error("This hero has no condition this remedy can cure");
  return{...guild,potions:{...guild.potions,[potionId]:guild.potions[potionId]-1},heroes:guild.heroes.map((entry)=>entry.id===heroId?{...entry,conditions:nextConditions}:entry)};
}
export function consumePotion(guild: GuildState, state: CombatState, potionId: PotionId): { guild: GuildState; state: CombatState } {
  if ((guild.potions[potionId] ?? 0) < 1) throw new Error("No potion available");
  if (!state.awaitingHeroId || state.actions.combatActionUsed) throw new Error("A potion requires the current hero's combat action");
  const index = state.heroes.findIndex((entry) => entry.hero.id === state.awaitingHeroId); const combatant = state.heroes[index];
  if (!combatant) throw new Error("No active hero");
  const potion = POTIONS[potionId]; const cures=new Set(potion.cureCombatConditionIds??[]);
  const instance = { ...combatant.instance, currentHP: Math.min(combatant.instance.maxHP, combatant.instance.currentHP + Math.round(combatant.instance.maxHP * (potion.restoreHpRatio ?? 0))), currentMana: Math.min(combatant.instance.maxMana, combatant.instance.currentMana + Math.round(combatant.instance.maxMana * (potion.restoreManaRatio ?? 0))), currentStamina: Math.min(combatant.instance.maxStamina, combatant.instance.currentStamina + Math.round(combatant.instance.maxStamina * (potion.restoreStaminaRatio ?? 0))), activeConditions: combatant.instance.activeConditions.filter((condition)=>!cures.has(condition.conditionId)) };
  const unit = { ...combatant.unit, currentHP: instance.currentHP, activeConditions: combatant.unit.activeConditions.filter((condition)=>!cures.has(condition.conditionId)) };
  const heroes = [...state.heroes]; heroes[index] = { ...combatant, instance, unit };
  const log = [...state.log, { turn: state.turn, actorId: combatant.hero.id, actionId: potionId, targetIds: [combatant.hero.id], message: combatant.hero.name+" used "+potion.name+"." }];
  return { guild: { ...guild, potions: { ...guild.potions, [potionId]: guild.potions[potionId] - 1 } }, state: { ...state, heroes, log, actions: { ...state.actions, combatActionUsed: true, usedSkillId: potionId } } };
}
