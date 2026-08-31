import { TRAITS, type TraitPolarity } from "../../data/traits/traits";
import type { TraitId } from "../heroes/types";
import type { RandomSource } from "../../utils/random";

const POLARITY_WEIGHTS: Record<TraitPolarity, number> = { positive: .55, mixed: .30, negative: .15 };

function weightedPick(random: RandomSource, ids: readonly TraitId[]): TraitId {
  const total = ids.reduce((sum, id) => sum + TRAITS[id].generationWeight, 0);
  let roll = random.next() * total;
  for (const id of ids) {
    roll -= TRAITS[id].generationWeight;
    if (roll < 0) return id;
  }
  return ids[ids.length - 1]!;
}

function conflicts(candidateId: TraitId, selected: ReadonlySet<TraitId>): boolean {
  const candidate = TRAITS[candidateId];
  return [...selected].some((selectedId) =>
    candidate.incompatibleTraitIds?.includes(selectedId)
    || TRAITS[selectedId].incompatibleTraitIds?.includes(candidateId),
  );
}

/** Generates distinct, weighted traits while avoiding contradictory personalities. */
export function generateWeightedTraits(random: RandomSource, count: number): TraitId[] {
  const definitions = Object.values(TRAITS);
  const selected = new Set<TraitId>();
  let attempts = 0;
  while (selected.size < Math.min(count, definitions.length) && attempts++ < 100) {
    const polarityRoll = random.next();
    const polarity: TraitPolarity = polarityRoll < POLARITY_WEIGHTS.positive
      ? "positive"
      : polarityRoll < POLARITY_WEIGHTS.positive + POLARITY_WEIGHTS.mixed ? "mixed" : "negative";
    const pool = definitions.filter((trait) => trait.polarity === polarity && !selected.has(trait.id) && !conflicts(trait.id, selected)).map((trait) => trait.id);
    if (pool.length) selected.add(weightedPick(random, pool));
  }
  return [...selected];
}
