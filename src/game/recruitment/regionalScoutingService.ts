import { RACE_HOMELANDS } from "../../data/recruitment/raceHomelands";
import { RECRUITMENT_CONFIG } from "../../data/recruitment/recruitmentBalance";
import { createSeededRandom, type RandomSource } from "../../utils/random";
import type { GuildState } from "../guild/types";
import type { ClassId, RaceId } from "../heroes/types";
import { hasGuildmasterSkill } from "../guildmaster/guildmasterProgression";
import { generateRecruitmentCandidate } from "./candidateGenerator";
import { scoutCandidate } from "./scoutingService";
import { getRecruitmentLevelRange } from "./recruitmentLevelService";
import type { RecruitmentArchetype } from "./recruitmentTypes";

export function regionalScoutDaysRemaining(guild: GuildState): number {
  const mission = guild.recruitment.regionalScoutMission;
  return mission ? Math.max(0, mission.completionDay - guild.currentDay) : 0;
}

export function dispatchRegionalScout(guild: GuildState, raceId: RaceId, random: RandomSource, classId: ClassId | null = null): GuildState {
  const homeland = RACE_HOMELANDS[raceId];
  if (!homeland) throw new Error("Unknown scouting destination");
  if (!guild.entitlements.unlockedRaceIds.includes(raceId)) throw new Error("Unlock this race before regional scouting");
  if (classId && !guild.entitlements.unlockedClassIds.includes(classId)) throw new Error("Unlock this class before adding a scouting focus");
  if (!hasGuildmasterSkill(guild.guildmaster, "regional_network")) throw new Error("Unlock Regional Network in the Guildmaster skill tree");
  if (guild.recruitment.regionalScoutMission) throw new Error("A regional scout is already away");
  const classCost = classId ? RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost : 0;
  if (classId && !hasGuildmasterSkill(guild.guildmaster, "specialist_headhunting")) throw new Error("Unlock Specialist Headhunting in the Guildmaster skill tree");
  const totalCost = RECRUITMENT_CONFIG.regionalScoutGemCost + classCost;
  if (guild.gems < totalCost) throw new Error("Not enough gems");

  const mission = {
    id: `regional-scout-${guild.currentDay}-${raceId}-${random.int(100000, 999999)}`,
    raceId,
    classId,
    regionId: homeland.regionId,
    locationName: homeland.locationName,
    startDay: guild.currentDay,
    completionDay: guild.currentDay + RECRUITMENT_CONFIG.regionalScoutDurationDays,
    resolutionSeed: random.int(1, 0x7fffffff),
  };
  const transactions = [{
    id: `${mission.id}-dispatch`,
    type: "scouting" as const,
    amount: -RECRUITMENT_CONFIG.regionalScoutGemCost,
    day: guild.currentDay,
    note: `Dispatched regional scout to ${homeland.locationName}`,
  }];
  if (classId) transactions.push({
    id: `${mission.id}-class-focus`,
    type: "scouting" as const,
    amount: -RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost,
    day: guild.currentDay,
    note: `Requested ${classId} candidates from ${homeland.locationName}`,
  });

  return {
    ...guild,
    gems: guild.gems - totalCost,
    gemTransactions: [...guild.gemTransactions, ...transactions],
    world: { ...guild.world, worldFlags: { ...guild.world.worldFlags, [homeland.loreUnlockFlag]: true } },
    recruitment: { ...guild.recruitment, regionalScoutMission: mission },
  };
}

export function speedUpRegionalScout(guild: GuildState): GuildState {
  const mission = guild.recruitment.regionalScoutMission;
  if (!mission) throw new Error("No regional scout is currently away");
  if (!hasGuildmasterSkill(guild.guildmaster, "express_dispatches")) throw new Error("Unlock Express Dispatches in the Guildmaster skill tree");
  if (regionalScoutDaysRemaining(guild) === 0) throw new Error("The scouting report is already ready");
  const cost = RECRUITMENT_CONFIG.regionalScoutSpeedUpGemCost;
  if (guild.gems < cost) throw new Error("Not enough gems");
  return {
    ...guild,
    gems: guild.gems - cost,
    gemTransactions: [...guild.gemTransactions, {
      id: `${mission.id}-speed-${guild.currentDay}-${guild.gemTransactions.length}`,
      type: "scouting",
      amount: -cost,
      day: guild.currentDay,
      note: `Expedited scout return from ${mission.locationName}`,
    }],
    recruitment: { ...guild.recruitment, regionalScoutMission: { ...mission, completionDay: guild.currentDay } },
  };
}

export function focusRegionalScoutClass(guild: GuildState, classId: ClassId): GuildState {
  const mission = guild.recruitment.regionalScoutMission;
  if (!mission) throw new Error("No regional scout is currently away");
  if (!guild.entitlements.unlockedClassIds.includes(classId)) throw new Error("Unlock this class before adding a scouting focus");
  if (!hasGuildmasterSkill(guild.guildmaster, "specialist_headhunting")) throw new Error("Unlock Specialist Headhunting in the Guildmaster skill tree");
  if (mission.classId) throw new Error("This scout already has a class focus");
  if (regionalScoutDaysRemaining(guild) === 0) throw new Error("The scouting report is already ready");
  const cost = RECRUITMENT_CONFIG.regionalScoutClassFocusGemCost;
  if (guild.gems < cost) throw new Error("Not enough gems");
  return {
    ...guild,
    gems: guild.gems - cost,
    gemTransactions: [...guild.gemTransactions, {
      id: `${mission.id}-class-focus-${guild.currentDay}`,
      type: "scouting",
      amount: -cost,
      day: guild.currentDay,
      note: `Requested ${classId} candidates from ${mission.locationName}`,
    }],
    recruitment: { ...guild.recruitment, regionalScoutMission: { ...mission, classId } },
  };
}

export function collectRegionalScoutReport(guild: GuildState): GuildState {
  const mission = guild.recruitment.regionalScoutMission;
  if (!mission) throw new Error("No regional scouting report is pending");
  const remaining = regionalScoutDaysRemaining(guild);
  if (remaining > 0) throw new Error(`Scout returns in ${remaining} day(s)`);
  const random = createSeededRandom(mission.resolutionSeed);
  const archetypes:RecruitmentArchetype[]=["prospect","standard","veteran","elite"];
  const levelRanges=Object.fromEntries(archetypes.map((archetype)=>[archetype,getRecruitmentLevelRange(guild,archetype)]));
  const report = Array.from({ length: RECRUITMENT_CONFIG.regionalScoutCandidateCount }, () => {
    const generated = generateRecruitmentCandidate(random, guild.currentDay, guild.reputation, undefined, mission.raceId, mission.classId ?? undefined, undefined, undefined, levelRanges);
    return scoutCandidate({
      ...generated,
      source: "regional_scout",
      sourceRaceId: mission.raceId,
      sourceRegionId: mission.regionId,
      sourceLocationName: mission.locationName,
    });
  });

  const reservationActive = guild.recruitment.reservedCandidateId !== null && (guild.recruitment.reservationExpiresAtDay ?? 0) > guild.currentDay;
  const reserved = reservationActive ? guild.recruitment.candidates.filter((candidate) => candidate.candidateId === guild.recruitment.reservedCandidateId) : [];
  const candidates = [...reserved, ...report];
  return {
    ...guild,
    recruitment: {
      ...guild.recruitment,
      candidates,
      candidateIds: candidates.map((candidate) => candidate.candidateId),
      reservedCandidateId: reserved.length ? guild.recruitment.reservedCandidateId : null,
      reservationExpiresAtDay: reserved.length ? guild.recruitment.reservationExpiresAtDay : null,
      regionalScoutMission: null,
    },
  };
}
