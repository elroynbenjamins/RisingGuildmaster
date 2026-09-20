import type { ResolvedEquipmentDefinition } from "./equipmentResolver";
import { compareEquipment } from "../../ui/equipmentComparison";
import { getDurabilityLabel } from "./equipmentDurabilityService";
import type { Hero } from "../heroes/types";

export type GearFit = "upgrade" | "tradeoff" | "sidegrade" | "downgrade" | "unusable";
export type PresentationTone = "good" | "gold" | "blue" | "danger" | "neutral";

export interface HeroGearFit {
  heroId: string;
  heroName: string;
  fit: GearFit;
  label: string;
  equippedKey: string | null;
}

export interface InventoryItemPresentation {
  durabilityLabel: ReturnType<typeof getDurabilityLabel>;
  durabilityTone: PresentationTone;
  heroFits: HeroGearFit[];
  compatibleCount: number;
  upgradeCount: number;
  tradeoffCount: number;
  bestFit: GearFit;
  bestFitLabel: string;
  bestFitTone: PresentationTone;
}

function fitForHero(hero: Hero, item: ResolvedEquipmentDefinition): GearFit {
  if (hero.level < item.levelRequirement || (item.classRestrictions.length > 0 && !item.classRestrictions.includes(hero.classId))) return "unusable";
  const equippedKey = hero.equipment[item.slot];
  if (!equippedKey) return "upgrade";
  const rows = compareEquipment(hero, item.inventoryKey);
  if (!rows.length) return "sidegrade";
  const hasPositive = rows.some((row) => row.difference > 0);
  const hasNegative = rows.some((row) => row.difference < 0);
  if (hasPositive && !hasNegative) return "upgrade";
  if (hasPositive && hasNegative) return "tradeoff";
  if (!hasPositive && hasNegative) return "downgrade";
  return "sidegrade";
}

function fitLabel(fit: GearFit): string {
  if (fit === "upgrade") return "LIKELY UPGRADE";
  if (fit === "tradeoff") return "BUILD TRADEOFF";
  if (fit === "sidegrade") return "SIDEGRADE";
  if (fit === "downgrade") return "LIKELY DOWNGRADE";
  return "CANNOT EQUIP";
}

function fitTone(fit: GearFit): PresentationTone {
  if (fit === "upgrade") return "good";
  if (fit === "tradeoff") return "gold";
  if (fit === "sidegrade") return "blue";
  if (fit === "downgrade" || fit === "unusable") return "danger";
  return "neutral";
}

export function getInventoryItemPresentation(item: ResolvedEquipmentDefinition, heroes: readonly Hero[]): InventoryItemPresentation {
  const heroFits = heroes.map((hero) => ({
    heroId: hero.id,
    heroName: hero.name,
    fit: fitForHero(hero, item),
    label: "",
    equippedKey: hero.equipment[item.slot] ?? null,
  })).map((entry) => ({ ...entry, label: fitLabel(entry.fit) }));
  const compatible = heroFits.filter((entry) => entry.fit !== "unusable");
  const rank: Record<GearFit, number> = { upgrade: 4, tradeoff: 3, sidegrade: 2, downgrade: 1, unusable: 0 };
  const bestFit = compatible.reduce<GearFit>((best, entry) => rank[entry.fit] > rank[best] ? entry.fit : best, "unusable");
  const durabilityLabel = getDurabilityLabel(item.durability);
  const durabilityTone: PresentationTone = durabilityLabel === "BROKEN" ? "danger" : durabilityLabel === "DAMAGED" ? "danger" : durabilityLabel === "WORN" ? "gold" : "good";
  return {
    durabilityLabel,
    durabilityTone,
    heroFits,
    compatibleCount: compatible.length,
    upgradeCount: compatible.filter((entry) => entry.fit === "upgrade").length,
    tradeoffCount: compatible.filter((entry) => entry.fit === "tradeoff").length,
    bestFit,
    bestFitLabel: compatible.length ? fitLabel(bestFit) : "NO ELIGIBLE HERO",
    bestFitTone: compatible.length ? fitTone(bestFit) : "danger",
  };
}
