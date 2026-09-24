import type { ConditionId } from "../heroes/types";
import type { GuildState } from "../guild/types";
import type { Party } from "../party/partyTypes";
import type { QuestDefinition } from "./questTypes";
import { addCondition } from "../conditions/conditionService";
import { spendPartyAdventureStamina } from "../heroes/adventureStaminaService";

export interface QuestPreCombatCondition {
  heroId: string;
  conditionId: ConditionId;
}

export function commitQuestPartyToCombat(
  guild: GuildState,
  quest: QuestDefinition,
  party: Party,
  preCombatConditions: readonly QuestPreCombatCondition[] = [],
): GuildState {
  let updated = spendPartyAdventureStamina(guild, party.heroIds, quest);
  if (!preCombatConditions.length) return { ...updated, recentPartyHeroIds: [...party.heroIds] };

  const partyIds = new Set(party.heroIds);
  for (const pending of preCombatConditions) {
    if (!partyIds.has(pending.heroId)) throw new Error("Pre-combat condition targets a hero outside the selected party");
    if (!updated.heroes.some((hero) => hero.id === pending.heroId)) throw new Error("Pre-combat condition targets an unknown hero");
  }

  updated = {
    ...updated,
    heroes: updated.heroes.map((hero) => {
      const conditions = preCombatConditions.filter((pending) => pending.heroId === hero.id);
      if (!conditions.length) return hero;
      return {
        ...hero,
        conditions: conditions.reduce((current, pending) => addCondition(current, pending.conditionId), hero.conditions),
      };
    }),
  };
  return { ...updated, recentPartyHeroIds: [...party.heroIds] };
}
