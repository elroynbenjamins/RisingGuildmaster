import type { GuildState } from "../game/guild/types";
import type { Hero } from "../game/heroes/types";
import { compareEquipment } from "./equipmentComparison";
import { heroHasSkillChoice } from "./actionNotifications";
import { resolveEquipmentDefinition } from "../game/equipment/equipmentResolver";

export type HeroAttentionKind = "fallen" | "condition" | "skill" | "gear_empty" | "gear_upgrade" | "readiness" | "contract";
export interface HeroAttentionIssue { kind: HeroAttentionKind; label: string; weight: number }
export interface HeroAttentionSummary { issues: HeroAttentionIssue[]; score: number; label: string }

function hasEquipmentUpgrade(guild: GuildState, hero: Hero): boolean {
  return guild.inventory.some((inventoryKey) => {
    const item = resolveEquipmentDefinition(inventoryKey);
    if (!item || hero.level < item.levelRequirement || (item.classRestrictions.length && !item.classRestrictions.includes(hero.classId))) return false;
    try { return compareEquipment(hero, inventoryKey).some((row) => row.difference > 0); } catch { return false; }
  });
}

export function getHeroAttention(guild: GuildState, hero: Hero): HeroAttentionSummary {
  const issues: HeroAttentionIssue[] = [];
  if (hero.currentHP <= 0) issues.push({ kind: "fallen", label: "Fallen", weight: 100 });
  else {
    if (hero.conditions.length) issues.push({ kind: "condition", label: hero.conditions.length === 1 ? "Condition" : `${hero.conditions.length} conditions`, weight: 60 });
    if (heroHasSkillChoice(hero)) issues.push({ kind: "skill", label: "Skill choice", weight: 50 });
    const emptySlots = Object.values(hero.equipment).filter((id) => !id).length;
    if (emptySlots) issues.push({ kind: "gear_empty", label: `${emptySlots} empty gear slot${emptySlots === 1 ? "" : "s"}`, weight: 22 });
    if (hasEquipmentUpgrade(guild, hero)) issues.push({ kind: "gear_upgrade", label: "Gear upgrade", weight: 34 });
    if (hero.adventureStamina < 35) issues.push({ kind: "readiness", label: `Readiness ${hero.adventureStamina}`, weight: 18 });
  }
  const contract = guild.heroContracts.find((entry) => entry.heroId === hero.id);
  if (contract?.status === "expiring") issues.push({ kind: "contract", label: `Contract ends Day ${contract.endDay}`, weight: 28 });
  const score = issues.reduce((sum, issue) => sum + issue.weight, 0);
  return { issues, score, label: issues.map((issue) => issue.label).join(" · ") };
}

export function countHeroesNeedingAttention(guild: GuildState): number {
  return guild.heroes.filter((hero) => getHeroAttention(guild, hero).issues.length > 0).length;
}
