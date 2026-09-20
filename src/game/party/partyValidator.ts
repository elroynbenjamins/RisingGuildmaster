import type { Hero } from "../heroes/types";
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE, type Party, type PartyValidationResult } from "./partyTypes";

export function validateParty(party: Party, heroes: readonly Hero[], maximumSize = MAX_PARTY_SIZE): PartyValidationResult {
  const errors: string[] = [];
  if (party.heroIds.length < MIN_PARTY_SIZE) errors.push("Party must contain at least one hero");
  if (party.heroIds.length > maximumSize) errors.push(`Party cannot contain more than ${maximumSize} heroes`);
  if (new Set(party.heroIds).size !== party.heroIds.length) errors.push("A hero cannot appear twice in a party");
  const heroesById = new Map(heroes.map((hero) => [hero.id, hero]));
  for (const id of new Set(party.heroIds)) {
    const hero = heroesById.get(id);
    if (!hero) errors.push(`Unknown hero: ${id}`);
    else {
      if (hero.currentHP <= 0) errors.push(`${hero.name} is not alive`);
      if (!hero.isAvailable) errors.push(`${hero.name} is unavailable`);
    }
  }
  return { valid: errors.length === 0, errors };
}
