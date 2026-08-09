import { CLASSES } from "../../data/classes/classes";
import { ATTRIBUTE_KEYS, type Attributes } from "../attributes/types";
import type { Hero } from "../heroes/types";
import { potentialMultiplier } from "./potential";

export function applyLevelAttributeGrowth(hero: Hero): Hero {
  const weights = CLASSES[hero.classId].attributeGrowthWeights;
  const totalWeight = ATTRIBUTE_KEYS.reduce((sum, key) => sum + weights[key], 0);
  const growthPoints = 3 * potentialMultiplier(hero.potential);
  const progress = { ...hero.attributeGrowthProgress };
  const baseAttributes = { ...hero.baseAttributes };
  for (const key of ATTRIBUTE_KEYS) {
    progress[key] += growthPoints * weights[key] / totalWeight;
    const gains = Math.floor(progress[key]);
    if (gains > 0) { baseAttributes[key] += gains; progress[key] -= gains; }
  }
  return { ...hero, baseAttributes, attributeGrowthProgress: progress as Attributes };
}
