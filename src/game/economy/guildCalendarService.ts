import type { GuildPlannerDay, GuildNextPlannerEvent } from "./economyTypes";
import { ARTISANS } from "../../data/crafting/artisans";
import { REGIONS } from "../../data/world/regions";
import { GATHERING_MISSIONS } from "../../data/gathering/gatheringMissions";
import { completeArtisanConstructions } from "../crafting/artisanBuildingService";
import type { ArtisanType } from "../crafting/craftingTypes";
import { advanceConditions } from "../conditions/conditionService";
import type { GuildState } from "../guild/types";
import { contractDepartureDay, getContractStatus } from "../recruitment/contractService";
import { completeTavernUpgrade, getTavernIncomeModifier } from "./tavernService";
import { FORMER_MEMBER_RETURN_COOLDOWN_DAYS, purgeExpiredCandidates } from "../recruitment/recruitmentService";
import { advanceRegionalThreats, areRegionalThreatsUnlocked, canUnlockRegionalThreats, unlockRegionalThreats } from "../world/regionalThreatService";
import type { GuildDayEvent, GuildDayPreview, GuildDayResolution, GuildTimeAdvanceResult } from "./economyTypes";
import { resolveTrainingGroundDay } from "../training/trainingService";
import { recoverAdventureStamina } from "../heroes/adventureStaminaService";
import { GAME_CONFIG } from "../../config/gameConfig";
import { getDifficulty } from "../../data/difficulty/difficulties";
import { hasGuildmasterSkill } from "../guildmaster/guildmasterProgression";
import { createGuildLegacyState, displayedTrophyBonus, getGuildRank } from "../renown/guildLegacyService";
import { calculateHero } from "../heroes/heroCalculator";
import { applyArrearsSettlementLoyalty, applyPayrollLoyalty } from "../heroes/heroLoyaltyService";

const dueOnDay = (startDay: number, endDay: number, day: number): boolean => day > startDay && day <= endDay && (day - startDay) % 7 === 0;
export const totalSalaryArrears = (guild: GuildState): number => Object.values(guild.finance.salaryArrearsByHeroId).reduce((sum, value) => sum + value, 0);
export const payrollDueOnDay = (guild: GuildState, day: number): number => guild.heroContracts.filter((contract) => guild.heroes.some((hero) => hero.id === contract.heroId && hero.currentHP > 0) && dueOnDay(contract.startDay, contract.endDay, day)).reduce((sum, contract) => sum + contract.weeklySalary, 0);
export const dailyTavernIncome = (guild: GuildState): number => Math.round(GAME_CONFIG.dailyTavernIncome * (1 + getTavernIncomeModifier(guild)) * getDifficulty(guild.difficultyId).tavernIncomeMultiplier * (hasGuildmasterSkill(guild.guildmaster, "tavern_stewardship") ? 1.2 : 1) * (1 + getGuildRank(guild.reputation).benefits.tavernIncomeModifier + displayedTrophyBonus(guild.legacy ?? createGuildLegacyState(), "tavern_income")));

function advanceRegionalThreatWorld(guild: GuildState, days = 1) {
  let world = guild.world;
  if (!areRegionalThreatsUnlocked(world) && canUnlockRegionalThreats(guild.heroes)) world = unlockRegionalThreats(world);
  return advanceRegionalThreats(world, days);
}

function processContractDepartures(guild: GuildState, day: number): { guild: GuildState; events: GuildDayEvent[] } {
  const departingIds = guild.heroContracts
    .filter((contract) => day >= contractDepartureDay(contract))
    .filter((contract) => {
      const hero = guild.heroes.find((entry) => entry.id === contract.heroId);
      return hero?.isAvailable === true;
    })
    .map((contract) => contract.heroId);
  if (!departingIds.length) return { guild, events: [] };
  const departing = new Set(departingIds);
  const events: GuildDayEvent[] = [];
  const returnedEquipment: string[] = [];
  const newFormerMembers = guild.heroes.filter((entry) => departing.has(entry.id)).map((hero) => {
    const contract = guild.heroContracts.find((entry) => entry.heroId === hero.id)!;
    returnedEquipment.push(...Object.values(hero.equipment).filter((key): key is string => Boolean(key)));
    events.push({ type: "contract_departure", text: hero.name + " left the guild after their contract ended. Equipped items were returned to inventory; they may be invited back later." });
    return {
      hero: { ...hero, equipment: { weapon:null, armor:null, helmet:null, boots:null, accessory1:null, accessory2:null } },
      departedDay: day,
      eligibleReturnDay: day + FORMER_MEMBER_RETURN_COOLDOWN_DAYS,
      lastWeeklySalary: contract.weeklySalary,
      rehireCount: hero.history.events.filter((event) => event.tags?.includes("returning_hero")).length,
      relationships: guild.relationships.filter((relationship) => relationship.heroIdA === hero.id || relationship.heroIdB === hero.id),
      departureKind: "contract_end" as const,
    };
  });
  const existingFormer = guild.recruitment.formerMembers.filter((member) => !departing.has(member.hero.id));
  const formerMembers = [...existingFormer, ...newFormerMembers].sort((a,b)=>b.departedDay-a.departedDay);
  return {
    events,
    guild: {
      ...guild,
      inventory: [...guild.inventory, ...returnedEquipment],
      heroes: guild.heroes.filter((hero) => !departing.has(hero.id)),
      heroContracts: guild.heroContracts.filter((contract) => !departing.has(contract.heroId)),
      relationships: guild.relationships.filter((relationship) => !departing.has(relationship.heroIdA) && !departing.has(relationship.heroIdB)),
      recentPartyHeroIds: guild.recentPartyHeroIds.filter((id) => !departing.has(id)),
      partyPresets: guild.partyPresets.map((preset) => ({ ...preset, heroIds: preset.heroIds.filter((id) => !departing.has(id)) })),
      recruitment: { ...guild.recruitment, formerMembers },
      finance: { ...guild.finance, salaryArrearsByHeroId: Object.fromEntries(Object.entries(guild.finance.salaryArrearsByHeroId).filter(([id]) => !departing.has(id))) },
    },
  };
}

function processPayroll(guild: GuildState, day: number): { guild: GuildState; due: number; paid: number; arrearsAdded: number; events: GuildDayEvent[] } {
  const dueContracts = guild.heroContracts.filter((contract) => guild.heroes.some((hero) => hero.id === contract.heroId && hero.currentHP > 0) && dueOnDay(contract.startDay, contract.endDay, day));
  let gold = guild.gold; let paidTotal = 0; let arrearsAdded = 0; let loyaltyGuild = guild;
  const arrears = { ...guild.finance.salaryArrearsByHeroId }; const transactions = [...guild.finance.transactions]; const events: GuildDayEvent[] = [];
  for (const contract of dueContracts) {
    const heroName = guild.heroes.find((hero) => hero.id === contract.heroId)?.name ?? "Unknown hero";
    const paid = Math.min(gold, contract.weeklySalary); const unpaid = contract.weeklySalary - paid;
    gold -= paid; paidTotal += paid; arrearsAdded += unpaid;
    loyaltyGuild = applyPayrollLoyalty(loyaltyGuild, contract.heroId, paid, contract.weeklySalary, day);
    if (paid > 0) {
      transactions.push({ id: `salary-${day}-${contract.heroId}-${transactions.length}`, type: "salary", day, amount: -paid, heroId: contract.heroId, note: `Weekly salary paid to ${heroName}` });
      events.push({ type: "salary_paid", text: `${heroName} received ${paid} gold salary.`, amount: paid });
    }
    if (unpaid > 0) {
      arrears[contract.heroId] = (arrears[contract.heroId] ?? 0) + unpaid;
      events.push({ type: "salary_arrears", text: `${heroName} is owed ${unpaid} gold.`, amount: unpaid });
    }
  }
  return { guild: { ...loyaltyGuild, gold, finance: { ...guild.finance, salaryArrearsByHeroId: arrears, totalSalaryPaid: guild.finance.totalSalaryPaid + paidTotal, transactions } }, due: dueContracts.reduce((sum, contract) => sum + contract.weeklySalary, 0), paid: paidTotal, arrearsAdded, events };
}

function resolveSingleDay(guild: GuildState): { guild: GuildState; resolution: GuildDayResolution } {
  const day = guild.currentDay + 1; const events: GuildDayEvent[] = [];
  const priorConditions = new Map(guild.heroes.map((hero) => [hero.id, hero.conditions]));
  const priorArtisans = guild.artisans; const priorCandidates = guild.recruitment.candidates; const priorThreat = guild.world.regionThreat ?? {};
  const priorContracts = new Map(guild.heroContracts.map((contract) => [contract.heroId, contract.status]));
  let updated: GuildState = {
    ...guild,
    currentDay: day,
    world: advanceRegionalThreatWorld(guild, 1),
    heroes: guild.heroes.map((hero) => { const maxHP = calculateHero(hero).stats.maxHP; return { ...hero, currentHP: hero.currentHP > 0 ? Math.min(maxHP, hero.currentHP + Math.max(1, Math.round(maxHP * GAME_CONFIG.dailyHeroHealthRecoveryRatio))) : 0, conditions: advanceConditions(hero.conditions, 1) }; }),
    heroContracts: guild.heroContracts.map((contract) => ({ ...contract, status: getContractStatus(contract, day) })),
  };
  const tavernUpgrade = completeTavernUpgrade(updated); updated = tavernUpgrade.guild;
  if (tavernUpgrade.completed) events.push({ type: "tavern_upgrade_complete", text: "Guild Hall & Tavern Level " + updated.finance.tavernLevel + " is now operational." });
  const tavernIncome = dailyTavernIncome(updated);
  updated = { ...recoverAdventureStamina(updated), gold: updated.gold + tavernIncome, finance: { ...updated.finance, totalTavernIncome: updated.finance.totalTavernIncome + tavernIncome, transactions: [...updated.finance.transactions, { id: `tavern-${day}`, type: "tavern_income", day, amount: tavernIncome, note: "Guildhaven tavern daily proceeds" }] } };
  events.push({ type: "tavern_income", text: `The guild tavern earned ${tavernIncome} gold.`, amount: tavernIncome });
  if (guild.heroes.some((hero) => hero.adventureStamina < GAME_CONFIG.maxAdventureStamina)) events.push({ type: "stamina_recovered", text: `Resting heroes recovered ${GAME_CONFIG.adventureStaminaRecoveryPerDay} readiness stamina.` });
  const healthRecovered = updated.heroes.reduce((total, hero) => total + Math.max(0, hero.currentHP - (guild.heroes.find((prior) => prior.id === hero.id)?.currentHP ?? hero.currentHP)), 0);
  if (healthRecovered > 0) events.push({ type: "health_recovered", text: `Living heroes recovered ${Math.round(GAME_CONFIG.dailyHeroHealthRecoveryRatio * 100)}% maximum health (${Math.round(healthRecovered)} HP total).`, amount: Math.round(healthRecovered) });
  updated = completeArtisanConstructions(updated);
  const training = resolveTrainingGroundDay(updated); updated = training.guild;
  training.completedHeroNames.forEach((name) => events.push({ type: "training_complete", text: `${name} completed training and is available again.` }));
  if (training.upgraded) events.push({ type: "training_upgrade_complete", text: `Training Hall Level ${updated.trainingGround.level} construction completed.` });
  updated = purgeExpiredCandidates(updated);
  const payroll = processPayroll(updated, day); updated = payroll.guild; events.push(...payroll.events);
  const departures = processContractDepartures(updated, day); updated = departures.guild; events.push(...departures.events);
  for (const member of updated.recruitment.formerMembers) {
    if (member.departureKind !== "retired" && member.eligibleReturnDay === day) {
      events.push({ type: "former_member_return", text: `${member.hero.name} sent word that they would consider returning to the guild.` });
    }
  }

  for (const hero of updated.heroes) {
    const before = priorConditions.get(hero.id) ?? [];
    for (const condition of before) if (!hero.conditions.some((item) => item.conditionId === condition.conditionId)) events.push({ type: "condition_recovered", text: `${hero.name} recovered from ${condition.conditionId.replace(/_/g, " ")}.` });
  }
  for (const type of Object.keys(updated.artisans) as ArtisanType[]) if (priorArtisans[type].construction && !updated.artisans[type].construction) events.push({ type: "workshop_complete", text: `${ARTISANS[type].name} workshop construction completed.` });
  for (const mission of updated.gatheringMissions) if (mission.status === "active" && mission.completionDay === day) events.push({ type: "gathering_ready", text: `${GATHERING_MISSIONS[mission.definitionId]?.name ?? mission.definitionId.replace(/_/g, " ")} is ready to claim.` });
  if (updated.recruitment.regionalScoutMission?.completionDay === day) events.push({ type: "scout_ready", text: `The scout has returned from ${updated.recruitment.regionalScoutMission.locationName}.` });
  const expiredCount = priorCandidates.length - updated.recruitment.candidates.length; if (expiredCount > 0) events.push({ type: "candidate_expired", text: `${expiredCount} recruitment candidate${expiredCount === 1 ? "" : "s"} left the guild board.` });
  for (const contract of updated.heroContracts) if (priorContracts.get(contract.heroId) !== contract.status) events.push({ type: "contract_status", text: `${updated.heroes.find((hero) => hero.id === contract.heroId)?.name ?? "Hero"}'s contract is now ${contract.status}.` });
  for (const [regionId, threat] of Object.entries(updated.world.regionThreat ?? {})) if (threat > (priorThreat[regionId] ?? 0)) events.push({ type: "regional_threat", text: `${REGIONS[regionId]?.name ?? regionId} threat increased to ${threat}.` });
  return { guild: updated, resolution: { day, payrollDue: payroll.due, payrollPaid: payroll.paid, arrearsAdded: payroll.arrearsAdded, events } };
}

export function advanceGuildTime(guild: GuildState, days = 1): GuildTimeAdvanceResult {
  if (!Number.isInteger(days) || days < 1) throw new Error("Days must be a positive integer");
  let updated = guild; const resolutions: GuildDayResolution[] = [];
  for (let index = 0; index < days; index++) { const resolved = resolveSingleDay(updated); updated = resolved.guild; resolutions.push(resolved.resolution); }
  return { guild: updated, days: resolutions };
}


const PLANNER_EVENT_TYPES = new Set<GuildDayEvent["type"]>([
  "salary_paid", "salary_arrears", "workshop_complete", "training_complete", "training_upgrade_complete",
  "gathering_ready", "scout_ready", "condition_recovered", "candidate_expired", "contract_status", "regional_threat",
]);

export const isGuildPlannerEvent = (event: GuildDayEvent): boolean => PLANNER_EVENT_TYPES.has(event.type);

/**
 * Projects the guild calendar without mutating the live state. Routine daily tavern income, HP recovery,
 * and stamina recovery are intentionally omitted from each card so the planner highlights decisions and deadlines.
 */
export function forecastGuildPlanner(guild: GuildState, days = 7): GuildPlannerDay[] {
  if (!Number.isInteger(days) || days < 1) throw new Error("Days must be a positive integer");
  let simulated = guild;
  const forecast: GuildPlannerDay[] = [];
  for (let offset = 1; offset <= days; offset++) {
    const resolved = resolveSingleDay(simulated);
    simulated = resolved.guild;
    forecast.push({
      day: resolved.resolution.day,
      daysAway: offset,
      events: resolved.resolution.events.filter(isGuildPlannerEvent),
      payrollDue: resolved.resolution.payrollDue,
      payrollPaid: resolved.resolution.payrollPaid,
      arrearsAdded: resolved.resolution.arrearsAdded,
      projectedGold: simulated.gold,
    });
  }
  return forecast;
}

/** Returns the first non-routine scheduled milestone, capped to avoid accidental long fast-forwards. */
export function findNextGuildPlannerEvent(guild: GuildState, maxDays = 30): GuildNextPlannerEvent | null {
  if (!Number.isInteger(maxDays) || maxDays < 1) throw new Error("Days must be a positive integer");
  return forecastGuildPlanner(guild, maxDays).find((day) => day.events.length > 0) ?? null;
}

export function previewNextGuildDay(guild: GuildState): GuildDayPreview {
  const targetDay = guild.currentDay + 1; const nextWorld = advanceRegionalThreatWorld(guild, 1); const currentThreat = guild.world.regionThreat ?? {};
  return {
    targetDay,
    payrollDue: payrollDueOnDay(guild, targetDay),
    currentArrears: totalSalaryArrears(guild),
    workshopNames: (Object.keys(guild.artisans) as ArtisanType[]).filter((type) => guild.artisans[type].construction?.completionDay === targetDay).map((type) => ARTISANS[type].name),
    gatheringMissionIds: guild.gatheringMissions.filter((mission) => mission.status === "active" && mission.completionDay === targetDay).map((mission) => mission.id),
    trainingHeroNames: guild.trainingGround.sessions.filter((session) => session.completionDay === targetDay).map((session) => guild.heroes.find((hero) => hero.id === session.heroId)?.name ?? "Unknown hero"),
    trainingUpgradeCompletes: guild.trainingGround.upgrade?.completionDay === targetDay,
    scoutReturns: guild.recruitment.regionalScoutMission?.completionDay === targetDay,
    recoveringHeroNames: guild.heroes.filter((hero) => hero.conditions.some((condition) => condition.remainingDuration <= 1)).map((hero) => hero.name),
    expiringCandidateCount: guild.recruitment.candidates.filter((candidate) => candidate.expiresAtDay === targetDay).length,
    contractChanges: guild.heroContracts.filter((contract) => getContractStatus(contract, targetDay) !== contract.status).length,
    threatIncreaseRegionIds: Object.entries(nextWorld.regionThreat ?? {}).filter(([regionId, threat]) => threat > (currentThreat[regionId] ?? 0)).map(([regionId]) => regionId),
  };
}

export function paySalaryArrears(guild: GuildState, heroId?: string): GuildState {
  const arrears = { ...guild.finance.salaryArrearsByHeroId }; let gold = guild.gold; let totalPaid = 0; const transactions = [...guild.finance.transactions];
  const heroIds = heroId ? [heroId] : Object.keys(arrears); const settledHeroIds: string[] = [];
  for (const id of heroIds) {
    const owed = arrears[id] ?? 0; if (owed <= 0 || gold <= 0) continue;
    const paid = Math.min(gold, owed); gold -= paid; totalPaid += paid; const remaining = owed - paid;
    if (remaining > 0) arrears[id] = remaining; else { delete arrears[id]; settledHeroIds.push(id); }
    const name = guild.heroes.find((hero) => hero.id === id)?.name ?? "Unknown hero";
    transactions.push({ id: `arrears-${guild.currentDay}-${id}-${transactions.length}`, type: "salary_arrears", day: guild.currentDay, amount: -paid, heroId: id, note: `Salary arrears paid to ${name}` });
  }
  if (totalPaid === 0 && totalSalaryArrears(guild) > 0) throw new Error("Not enough gold to pay salary arrears");
  let updated = { ...guild, gold, finance: { ...guild.finance, salaryArrearsByHeroId: arrears, totalSalaryPaid: guild.finance.totalSalaryPaid + totalPaid, transactions } };
  for (const id of settledHeroIds) updated = applyArrearsSettlementLoyalty(updated, id);
  return updated;
}
