import type { GuildState } from "../guild/types";
import type { RandomSource } from "../../utils/random";

export const DUNGEON_UNLOCK_HERO_COUNT = 6;
export const DUNGEON_DRAFT_ROUNDS = 4;
export const DUNGEON_DRAFT_OFFER_SIZE = 3;
export interface DungeonDraftState { round: number; eligibleHeroIds: string[]; offeredHeroIds: string[]; selectedHeroIds: string[]; complete: boolean }

function drawOffer(eligibleIds: readonly string[], selectedIds: readonly string[], random: RandomSource): string[] {
  const pool = eligibleIds.filter((id) => !selectedIds.includes(id)); const offer: string[] = [];
  while (offer.length < Math.min(DUNGEON_DRAFT_OFFER_SIZE, pool.length)) { const index = Math.floor(random.next() * pool.length); offer.push(pool.splice(index, 1)[0]!); }
  return offer;
}
export function createDungeonDraft(guild: GuildState, random: RandomSource): DungeonDraftState {
  if (guild.heroes.length < DUNGEON_UNLOCK_HERO_COUNT) throw new Error(`Roguelite Expeditions unlock at ${DUNGEON_UNLOCK_HERO_COUNT} owned heroes`);
  const eligibleHeroIds = guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0).map((hero) => hero.id);
  if (eligibleHeroIds.length < DUNGEON_DRAFT_ROUNDS) throw new Error("At least four living, available heroes are required for the draft");
  return { round: 1, eligibleHeroIds, offeredHeroIds: drawOffer(eligibleHeroIds, [], random), selectedHeroIds: [], complete: false };
}
export function selectDungeonDraftHero(draft: DungeonDraftState, heroId: string, random: RandomSource): DungeonDraftState {
  if (draft.complete) throw new Error("Dungeon draft is already complete"); if (!draft.offeredHeroIds.includes(heroId)) throw new Error("Hero is not in the current draft offer"); if (draft.selectedHeroIds.includes(heroId)) throw new Error("Hero has already been drafted");
  const selectedHeroIds = [...draft.selectedHeroIds, heroId]; const complete = selectedHeroIds.length === DUNGEON_DRAFT_ROUNDS;
  return { ...draft, round: complete ? DUNGEON_DRAFT_ROUNDS : draft.round + 1, selectedHeroIds, offeredHeroIds: complete ? [] : drawOffer(draft.eligibleHeroIds, selectedHeroIds, random), complete };
}
