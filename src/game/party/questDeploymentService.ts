import { GAME_CONFIG } from "../../config/gameConfig";
import { calculateHero } from "../heroes/heroCalculator";
import type { ClassId, Hero } from "../heroes/types";
import { parseEquipmentKey } from "../equipment/equipmentResolver";
import type { PotionInventory } from "../alchemy/potionTypes";
import { getQuestAdventureStaminaCost } from "../heroes/adventureStaminaService";
import { getQuestMissionIntel, type QuestMissionIntel } from "../quests/questMissionIntelService";
import type { QuestDefinition } from "../quests/questTypes";

export type DeploymentRole = "frontline" | "support" | "ranged";
export type DeploymentStatus = "empty" | "blocked" | "high_risk" | "watch" | "ready";
export type DeploymentTone = "neutral" | "danger" | "gold" | "good";

const ROLE_BY_CLASS: Record<ClassId, DeploymentRole> = {
  warrior: "frontline",
  paladin: "frontline",
  berserker: "frontline",
  monk: "frontline",
  bulwark: "frontline",
  cleric: "support",
  bard: "support",
  summoner: "support",
  ranger: "ranged",
  mage: "ranged",
  spellbow: "ranged",
};

const ROLE_LABELS: Record<DeploymentRole, string> = {
  frontline: "FRONTLINE",
  support: "SUPPORT",
  ranged: "RANGED",
};

export interface DeploymentWarning {
  id: string;
  tone: "danger" | "warning" | "info";
  text: string;
}

export interface QuestDeploymentSummary {
  status: DeploymentStatus;
  statusLabel: string;
  tone: DeploymentTone;
  averageLevel: number;
  recommendedLevel: number;
  staminaCost: number;
  lowestReadinessAfter: number;
  lowestHpRatio: number;
  woundedHeroes: number;
  roleCounts: Record<DeploymentRole, number>;
  roleLabels: string[];
  equipment: {
    equippedSlots: number;
    totalSlots: number;
    missingSlots: number;
    wornItems: number;
    damagedItems: number;
    brokenItems: number;
  };
  supplies: {
    healing: number;
    mana: number;
    stamina: number;
    total: number;
  };
  intel: QuestMissionIntel;
  warnings: DeploymentWarning[];
}

export function getDeploymentRole(hero: Hero): DeploymentRole {
  return ROLE_BY_CLASS[hero.classId];
}

function deploymentStatus(status: DeploymentStatus): { label: string; tone: DeploymentTone } {
  if (status === "blocked") return { label: "NOT READY", tone: "danger" };
  if (status === "high_risk") return { label: "HIGH RISK", tone: "danger" };
  if (status === "watch") return { label: "WATCH", tone: "gold" };
  if (status === "ready") return { label: "READY TO DEPLOY", tone: "good" };
  return { label: "SELECT PARTY", tone: "neutral" };
}

export function getQuestDeploymentSummary(
  quest: QuestDefinition,
  heroes: readonly Hero[],
  discoveredEnemyIds: readonly string[],
  potions: PotionInventory,
): QuestDeploymentSummary {
  const staminaCost = getQuestAdventureStaminaCost(quest);
  const recommendedLevel = quest.recommendedLevelMin ?? 1;
  const averageLevel = heroes.length ? heroes.reduce((sum, hero) => sum + hero.level, 0) / heroes.length : 0;
  const levelGate = quest.minimumPartyAverageLevel ?? 0;
  const lowestReadinessAfter = heroes.length ? Math.min(...heroes.map((hero) => Math.max(0, hero.adventureStamina - staminaCost))) : 0;
  let lowestHpRatio = 1;
  let woundedHeroes = 0;
  for (const hero of heroes) {
    const maximum = Math.max(1, calculateHero(hero).stats.maxHP);
    const ratio = Math.max(0, Math.min(1, hero.currentHP / maximum));
    lowestHpRatio = Math.min(lowestHpRatio, ratio);
    if (ratio < .6) woundedHeroes += 1;
  }
  if (!heroes.length) lowestHpRatio = 0;

  const roleCounts: Record<DeploymentRole, number> = { frontline: 0, support: 0, ranged: 0 };
  heroes.forEach((hero) => { roleCounts[getDeploymentRole(hero)] += 1; });
  const roleLabels = (Object.keys(roleCounts) as DeploymentRole[]).map((role) => `${ROLE_LABELS[role]} ${roleCounts[role]}`);

  let equippedSlots = 0; let wornItems = 0; let damagedItems = 0; let brokenItems = 0;
  for (const hero of heroes) {
    for (const key of Object.values(hero.equipment)) {
      if (!key) continue;
      equippedSlots += 1;
      const durability = parseEquipmentKey(key).durability;
      if (durability <= 0) brokenItems += 1;
      else if (durability < 40) damagedItems += 1;
      else if (durability < 75) wornItems += 1;
    }
  }
  const totalSlots = heroes.length * 6;
  const equipment = { equippedSlots, totalSlots, missingSlots: Math.max(0, totalSlots - equippedSlots), wornItems, damagedItems, brokenItems };
  const supplies = {
    healing: potions.minor_healing_potion,
    mana: potions.mana_tonic,
    stamina: potions.stamina_draught,
    total: potions.minor_healing_potion + potions.mana_tonic + potions.stamina_draught,
  };
  const intel = getQuestMissionIntel(quest, discoveredEnemyIds);
  const warnings: DeploymentWarning[] = [];

  const sizeBlocked = heroes.length < quest.minPartySize || heroes.length > quest.maxPartySize;
  if (heroes.length && averageLevel < recommendedLevel) warnings.push({ id: "level", tone: "danger", text: `Party average Lv ${averageLevel.toFixed(1)} is below the recommended Lv ${recommendedLevel}.` });
  if (levelGate && heroes.length && averageLevel < levelGate) warnings.push({ id: "level_gate", tone: "danger", text: `This operation requires an average party level of ${levelGate}.` });
  if (heroes.some((hero) => hero.adventureStamina < staminaCost)) warnings.push({ id: "readiness", tone: "danger", text: `At least one hero lacks the ${staminaCost} readiness needed to deploy.` });
  if (heroes.some((hero) => hero.currentHP <= 0 || !hero.isAvailable)) warnings.push({ id: "availability", tone: "danger", text: "At least one selected hero is unavailable for field duty." });
  if (woundedHeroes) warnings.push({ id: "health", tone: lowestHpRatio <= .3 ? "danger" : "warning", text: `${woundedHeroes} selected hero${woundedHeroes === 1 ? " is" : "es are"} below 60% HP.` });
  if (heroes.length >= 3 && roleCounts.frontline === 0) warnings.push({ id: "frontline", tone: "warning", text: "No frontline hero selected. Enemies may reach fragile allies quickly." });
  if (heroes.length >= 3 && roleCounts.support === 0) warnings.push({ id: "support", tone: "warning", text: "No support hero selected. Sustained encounters may be harder to recover from." });
  if (brokenItems) warnings.push({ id: "broken_gear", tone: "danger", text: `${brokenItems} equipped item${brokenItems === 1 ? " is" : "s are"} broken and provide no normal durability value.` });
  else if (damagedItems) warnings.push({ id: "damaged_gear", tone: "warning", text: `${damagedItems} equipped item${damagedItems === 1 ? " is" : "s are"} below 40% durability.` });
  if (heroes.length && supplies.healing <= 0) warnings.push({ id: "healing", tone: "warning", text: "No healing potions are stocked for emergency combat recovery." });
  if (heroes.length && intel.coverage === "none") warnings.push({ id: "intel", tone: "info", text: "No exact enemy types are documented in the Monster Manual for this mission." });

  let status: DeploymentStatus = "empty";
  if (heroes.length) {
    const hasBlocker = sizeBlocked || warnings.some((entry) => entry.id === "level_gate" || entry.id === "readiness" || entry.id === "availability");
    const danger = warnings.some((entry) => entry.tone === "danger");
    const warning = warnings.some((entry) => entry.tone === "warning");
    status = hasBlocker ? "blocked" : danger ? "high_risk" : warning ? "watch" : "ready";
  }
  const presentation = deploymentStatus(status);
  return { status, statusLabel: presentation.label, tone: presentation.tone, averageLevel, recommendedLevel, staminaCost, lowestReadinessAfter, lowestHpRatio, woundedHeroes, roleCounts, roleLabels, equipment, supplies, intel, warnings };
}

function heroScore(hero: Hero): number {
  const maximum = Math.max(1, calculateHero(hero).stats.maxHP);
  return hero.level * 100 + hero.currentHP / maximum * 25 + hero.adventureStamina / GAME_CONFIG.maxAdventureStamina * 15;
}

/**
 * Convenience selection for ordinary quests. It prefers a frontline/support/ranged
 * core when those roles are available, then fills remaining slots with the strongest
 * field-ready heroes. Personal-quest heroes can be forced in through requiredHeroIds.
 */
export function buildRecommendedQuestParty(
  quest: QuestDefinition,
  roster: readonly Hero[],
  requiredHeroIds: readonly string[] = [],
): string[] {
  const staminaCost = getQuestAdventureStaminaCost(quest);
  const eligible = roster
    .filter((hero) => hero.isAvailable && hero.currentHP > 0 && hero.adventureStamina >= staminaCost)
    .sort((a, b) => heroScore(b) - heroScore(a) || a.name.localeCompare(b.name));
  const byId = new Map(eligible.map((hero) => [hero.id, hero]));
  const chosen: Hero[] = [];
  for (const id of requiredHeroIds) {
    const hero = byId.get(id);
    if (hero && !chosen.some((entry) => entry.id === hero.id) && chosen.length < quest.maxPartySize) chosen.push(hero);
  }
  const addBestRole = (role: DeploymentRole) => {
    if (chosen.length >= quest.maxPartySize || chosen.some((hero) => getDeploymentRole(hero) === role)) return;
    const hero = eligible.find((entry) => getDeploymentRole(entry) === role && !chosen.some((picked) => picked.id === entry.id));
    if (hero) chosen.push(hero);
  };
  if (quest.maxPartySize >= 3) {
    addBestRole("frontline");
    addBestRole("support");
    addBestRole("ranged");
  }
  for (const hero of eligible) {
    if (chosen.length >= quest.maxPartySize) break;
    if (!chosen.some((entry) => entry.id === hero.id)) chosen.push(hero);
  }
  return chosen.map((hero) => hero.id);
}
