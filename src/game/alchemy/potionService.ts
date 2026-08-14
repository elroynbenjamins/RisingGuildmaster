import { POTIONS } from "../../data/alchemy/potions";
import type { CombatState } from "../combat/combatEngine";
import type { GuildState } from "../guild/types";
import type { PotionId } from "./potionTypes";

export function craftPotion(guild: GuildState, potionId: PotionId): GuildState {
  const potion = POTIONS[potionId];
  if (guild.gold < potion.goldCost) throw new Error("Not enough gold");
  for (const [materialId, amount] of Object.entries(potion.materials)) if ((guild.materials[materialId as keyof typeof guild.materials] ?? 0) < amount) throw new Error(`Missing ${materialId.replace(/_/g, " ")}`);
  const materials = { ...guild.materials };
  for (const [materialId, amount] of Object.entries(potion.materials)) materials[materialId as keyof typeof materials] -= amount;
  return { ...guild, gold: guild.gold - potion.goldCost, materials, potions: { ...guild.potions, [potionId]: guild.potions[potionId] + 1 } };
}

export function consumePotion(guild: GuildState, state: CombatState, potionId: PotionId): { guild: GuildState; state: CombatState } {
  if ((guild.potions[potionId] ?? 0) < 1) throw new Error("No potion available");
  if (!state.awaitingHeroId || state.actions.combatActionUsed) throw new Error("A potion requires the current hero's combat action");
  const index = state.heroes.findIndex((entry) => entry.hero.id === state.awaitingHeroId); const combatant = state.heroes[index];
  if (!combatant) throw new Error("No active hero");
  const potion = POTIONS[potionId];
  const instance = { ...combatant.instance, currentHP: Math.min(combatant.instance.maxHP, combatant.instance.currentHP + Math.round(combatant.instance.maxHP * (potion.restoreHpRatio ?? 0))), currentMana: Math.min(combatant.instance.maxMana, combatant.instance.currentMana + Math.round(combatant.instance.maxMana * (potion.restoreManaRatio ?? 0))), currentStamina: Math.min(combatant.instance.maxStamina, combatant.instance.currentStamina + Math.round(combatant.instance.maxStamina * (potion.restoreStaminaRatio ?? 0))) };
  const unit = { ...combatant.unit, currentHP: instance.currentHP };
  const heroes = [...state.heroes]; heroes[index] = { ...combatant, instance, unit };
  const log = [...state.log, { turn: state.turn, actorId: combatant.hero.id, actionId: potionId, targetIds: [combatant.hero.id], message: `${combatant.hero.name} used ${potion.name}.` }];
  return { guild: { ...guild, potions: { ...guild.potions, [potionId]: guild.potions[potionId] - 1 } }, state: { ...state, heroes, log, actions: { ...state.actions, combatActionUsed: true, usedSkillId: potionId } } };
}
