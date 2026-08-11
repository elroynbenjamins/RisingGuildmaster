import type { BackgroundId } from "../../game/heroes/types";
import type { Modifier } from "../../game/modifiers/types";

export interface HeroBackgroundDefinition { id: BackgroundId; name: string; description: string; generationWeight: number; modifiers: Modifier[] }
const flat = (id: BackgroundId, target: Modifier["target"], value: number): Modifier => ({ source: "background", sourceId: id, target, operation: "flat", value });
const pct = (id: BackgroundId, target: Modifier["target"], value: number): Modifier => ({ source: "background", sourceId: id, target, operation: "percentage", value });

export const BACKGROUNDS: Record<BackgroundId, HeroBackgroundDefinition> = {
  farmhand: { id: "farmhand", name: "Farmhand", description: "Years of fieldwork built a powerful frame and stubborn endurance.", generationWeight: 26, modifiers: [flat("farmhand", "strength", 1), flat("farmhand", "constitution", 1)] },
  scholar: { id: "scholar", name: "Scholar", description: "Formal study provides a keen mind and a disciplined approach to training.", generationWeight: 18, modifiers: [flat("scholar", "intelligence", 2), pct("scholar", "trainingXp", .05)] },
  street_urchin: { id: "street_urchin", name: "Street Urchin", description: "Quick hands, quicker feet, and few expectations about an upfront signing fee.", generationWeight: 22, modifiers: [flat("street_urchin", "dexterity", 2), pct("street_urchin", "recruitmentFee", -.05)] },
  noble: { id: "noble", name: "Noble", description: "Courtly education brings presence and expensive expectations.", generationWeight: 14, modifiers: [flat("noble", "charisma", 2), pct("noble", "salary", .10)] },
  mercenary: { id: "mercenary", name: "Mercenary", description: "Professional battlefield experience improves damage, but veterans demand professional pay.", generationWeight: 20, modifiers: [pct("mercenary", "physicalDamage", .05), pct("mercenary", "salary", .15)] },
};

export function getBackgroundModifier(backgroundId: BackgroundId | undefined, target: Modifier["target"]): number {
  if (!backgroundId) return 0;
  return BACKGROUNDS[backgroundId].modifiers.filter((modifier) => modifier.target === target && modifier.operation === "percentage").reduce((sum, modifier) => sum + modifier.value, 0);
}
