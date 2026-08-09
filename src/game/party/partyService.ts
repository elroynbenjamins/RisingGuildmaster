import type { Hero } from "../heroes/types";
import { MAX_PARTY_SIZE, type Party } from "./partyTypes";
export function createParty(id = "active-party"): Party { return { id, heroIds: [] }; }
export function addHeroToParty(party: Party, hero: Hero): Party {
  if (party.heroIds.includes(hero.id)) throw new Error("Hero is already in the party");
  if (party.heroIds.length >= MAX_PARTY_SIZE) throw new Error("Party is full");
  if (!hero.isAvailable || hero.currentHP <= 0) throw new Error("Hero is unavailable");
  return { ...party, heroIds: [...party.heroIds, hero.id] };
}
export function removeHeroFromParty(party: Party, heroId: string): Party { return { ...party, heroIds: party.heroIds.filter((id) => id !== heroId) }; }
