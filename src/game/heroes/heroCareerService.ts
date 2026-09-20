import type { GuildState } from "../guild/types";
import { appendHeroHistoryEvent } from "./heroHistoryService";

export const RETIREMENT_MIN_LEVEL = 6;
export const RETIREMENT_MIN_QUESTS = 10;
export const RETIREMENT_MIN_REMAINING_ROSTER = 2;

export function canRetireHero(guild: GuildState, heroId: string): { eligible: boolean; reason: string } {
  const hero = guild.heroes.find((entry) => entry.id === heroId);
  if (!hero) return { eligible: false, reason: "Hero is not in the active guild roster." };
  if (!hero.isAvailable) return { eligible: false, reason: "Hero must be available at the guild before retiring." };
  if (guild.heroes.length <= RETIREMENT_MIN_REMAINING_ROSTER) return { eligible: false, reason: "Keep at least two active heroes after retirement." };
  if ((guild.finance.salaryArrearsByHeroId[heroId] ?? 0) > 0) return { eligible: false, reason: "Settle this hero's salary arrears first." };
  if (hero.level < RETIREMENT_MIN_LEVEL) return { eligible: false, reason: `Requires Level ${RETIREMENT_MIN_LEVEL}.` };
  if (hero.history.questsCompleted < RETIREMENT_MIN_QUESTS) return { eligible: false, reason: `Requires ${RETIREMENT_MIN_QUESTS} completed quests.` };
  return { eligible: true, reason: "Eligible to retire with full veteran honors." };
}

export function retireHero(guild: GuildState, heroId: string): GuildState {
  const eligibility = canRetireHero(guild, heroId);
  if (!eligibility.eligible) throw new Error(eligibility.reason);
  const hero = guild.heroes.find((entry) => entry.id === heroId)!;
  const contract = guild.heroContracts.find((entry) => entry.heroId === heroId);
  const returnedEquipment = Object.values(hero.equipment).filter((key): key is string => Boolean(key));
  const retiredHero = appendHeroHistoryEvent({
    ...hero,
    equipment: { weapon: null, armor: null, helmet: null, boots: null, accessory1: null, accessory2: null },
    isAvailable: false,
  }, {
    day: guild.currentDay,
    type: "campaign",
    outcome: "positive",
    title: "Retired with guild honors",
    description: `${hero.name} ended active service after ${hero.history.questsCompleted} completed quests and remained in the guild's alumni record.`,
    tags: ["retirement", "alumni", "veteran"],
  });
  const relationships = guild.relationships.filter((relationship) => relationship.heroIdA === heroId || relationship.heroIdB === heroId);
  const existingFormer = guild.recruitment.formerMembers.filter((member) => member.hero.id !== heroId);
  const formerMembers = [{
    hero: retiredHero,
    departedDay: guild.currentDay,
    eligibleReturnDay: Number.MAX_SAFE_INTEGER,
    lastWeeklySalary: contract?.weeklySalary ?? hero.salary,
    rehireCount: hero.history.events.filter((event) => event.tags?.includes("returning_hero")).length,
    relationships,
    departureKind: "retired" as const,
  }, ...existingFormer];

  return {
    ...guild,
    inventory: [...guild.inventory, ...returnedEquipment],
    heroes: guild.heroes.filter((entry) => entry.id !== heroId),
    heroContracts: guild.heroContracts.filter((entry) => entry.heroId !== heroId),
    relationships: guild.relationships.filter((relationship) => relationship.heroIdA !== heroId && relationship.heroIdB !== heroId),
    recentPartyHeroIds: guild.recentPartyHeroIds.filter((id) => id !== heroId),
    partyPresets: guild.partyPresets.map((preset) => ({ ...preset, heroIds: preset.heroIds.filter((id) => id !== heroId) })),
    recruitment: { ...guild.recruitment, formerMembers },
    finance: {
      ...guild.finance,
      salaryArrearsByHeroId: Object.fromEntries(Object.entries(guild.finance.salaryArrearsByHeroId).filter(([id]) => id !== heroId)),
    },
  };
}
