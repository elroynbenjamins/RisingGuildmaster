import { EQUIPMENT } from "../../data/equipment/equipment";
import { GATHERING_MISSIONS } from "../../data/gathering/gatheringMissions";
import type { RandomSource } from "../../utils/random";
import { createSeededRandom } from "../../utils/random";
import type { MaterialId } from "../crafting/craftingTypes";
import type { GuildState } from "../guild/types";
import { advanceGuildTime } from "../economy/guildCalendarService";
import { calculateHero } from "../heroes/heroCalculator";
import type { Hero } from "../heroes/types";
import type { GatheringMissionInstance, GatheringMissionResult, GatheringQuality } from "./gatheringTypes";
import { getTrainingProgressionLimit, grantTrainingXp } from "../training/trainingService";

function missionHeroes(guild: GuildState, mission: GatheringMissionInstance): [Hero, Hero] { const heroes = mission.heroIds.map((id) => guild.heroes.find((hero) => hero.id === id)); if (!heroes[0] || !heroes[1]) throw new Error("Gathering heroes are missing"); return [heroes[0], heroes[1]]; }

export function calculateGatheringModifier(definitionId: string, heroes: readonly [Hero, Hero]): number {
  const definition = GATHERING_MISSIONS[definitionId]; if (!definition) throw new Error("Unknown gathering mission");
  const calculated = heroes.map(calculateHero); const primary = calculated.reduce((sum, hero) => sum + hero.attributes[definition.primaryAttribute], 0); const secondary = calculated.reduce((sum, hero) => sum + hero.attributes[definition.secondaryAttribute], 0); const averageLevel = (heroes[0].level + heroes[1].level) / 2;
  return Math.floor(primary / 8) + Math.floor(secondary / 12) + Math.floor(averageLevel / 2);
}

export function startGatheringMission(guild: GuildState, definitionId: string, heroIds: readonly string[], random: RandomSource): GuildState {
  const definition = GATHERING_MISSIONS[definitionId]; if (!definition) throw new Error("Unknown gathering mission");
  if (heroIds.length !== 2 || new Set(heroIds).size !== 2) throw new Error("Gathering missions require exactly two different heroes");
  if (!guild.world.unlockedRegionIds.includes(definition.regionId)) throw new Error("Mission region is locked");
  const heroes = heroIds.map((id) => guild.heroes.find((hero) => hero.id === id)); if (heroes.some((hero) => !hero)) throw new Error("Hero is not in this guild");
  if (heroes.some((hero) => !hero!.isAvailable || hero!.currentHP <= 0)) throw new Error("Both heroes must be available and alive");
  const instance: GatheringMissionInstance = { id: `gather-${guild.currentDay}-${random.int(100000, 999999)}`, definitionId, heroIds: [heroIds[0]!, heroIds[1]!], startDay: guild.currentDay, completionDay: guild.currentDay + definition.durationDays, resolutionSeed: random.int(1, 0x7fffffff), status: "active" };
  return { ...guild, heroes: guild.heroes.map((hero) => heroIds.includes(hero.id) ? { ...hero, isAvailable: false } : hero), gatheringMissions: [...guild.gatheringMissions, instance] };
}

export function resolveGatheringMission(guild: GuildState, missionId: string): GatheringMissionResult {
  const mission = guild.gatheringMissions.find((item) => item.id === missionId); if (!mission) throw new Error("Gathering mission not found"); if (guild.currentDay < mission.completionDay) throw new Error("Gathering mission is not complete");
  const definition = GATHERING_MISSIONS[mission.definitionId]!; const heroes = missionHeroes(guild, mission); const random = createSeededRandom(mission.resolutionSeed); const modifier = calculateGatheringModifier(definition.id, heroes); const diceRoll = random.int(1, 20); const total = diceRoll + modifier; const success = total >= definition.difficultyClass; const margin = total - definition.difficultyClass; const averageLevel = (heroes[0].level + heroes[1].level) / 2;
  const quality: GatheringQuality = !success ? "meager" : margin >= 8 && averageLevel >= definition.recommendedLevel ? "rare" : margin >= 3 ? "uncommon" : "common";
  const multiplier = quality === "rare" ? 2 : quality === "uncommon" ? 1.5 : 1; const materials: Partial<Record<MaterialId, number>> = {};
  if (success) for (const drop of definition.materialDrops) { const base = random.int(drop.quantityMin, drop.quantityMax); const amount = Math.floor(base * multiplier); if (amount > 0) materials[drop.materialId] = amount; }
  else if (margin >= -2) { const common = definition.materialDrops.find((drop) => drop.quantityMax > 1); if (common) materials[common.materialId] = 1; }
  const equipmentChance = success ? Math.min(.35, .05 + averageLevel * .02 + Math.max(0, margin) * .015) : 0; const eligible = definition.equipmentPoolIds.filter((id) => (EQUIPMENT[id]?.levelRequirement ?? 99) <= averageLevel + 1); const equipmentIds = eligible.length && random.next() < equipmentChance ? [random.pick(eligible)] : [];
  const xpPerHero = Math.round(definition.baseXpPerHero * (success ? quality === "rare" ? 1.5 : quality === "uncommon" ? 1.25 : 1 : .25));
  return { success, diceRoll, modifier, total, difficultyClass: definition.difficultyClass, quality, materials, equipmentIds, xpPerHero };
}

export function claimGatheringMission(guild: GuildState, missionId: string): { guild: GuildState; result: GatheringMissionResult } {
  const mission = guild.gatheringMissions.find((item) => item.id === missionId); if (!mission || mission.status !== "active") throw new Error("Gathering mission cannot be claimed"); const result = resolveGatheringMission(guild, missionId);
  const materials = { ...guild.materials }; for (const [id, amount] of Object.entries(result.materials) as [MaterialId, number][]) materials[id] += amount;
  return { result, guild: { ...guild, materials, inventory: [...guild.inventory, ...result.equipmentIds], heroes: guild.heroes.map((hero) => { if (!mission.heroIds.includes(hero.id)) return hero; const cap = getTrainingProgressionLimit(guild, hero).levelCap; return { ...grantTrainingXp(hero, result.xpPerHero, cap), isAvailable: hero.currentHP > 0 }; }), gatheringMissions: guild.gatheringMissions.map((item) => item.id === missionId ? { ...item, status: "claimed" } : item) } };
}

/** @deprecated Prefer advanceGuildTime; retained for compatibility with existing gathering callers. */
export function advanceGuildDays(guild: GuildState, days = 1): GuildState { return advanceGuildTime(guild, days).guild; }
