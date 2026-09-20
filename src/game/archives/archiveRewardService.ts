import { ENEMIES } from "../../data/enemies";
import { ENEMY_FACTIONS } from "../../data/enemies/factions";
import { LORE_ENTRIES } from "../../data/world/lore";
import type { GuildState } from "../guild/types";
import { grantGuildmasterXp } from "../guildmaster/guildmasterProgression";

export type ArchiveRewardTrack = "bestiary" | "lore" | "tactics" | "heroes";

export interface ArchiveRewardGrant {
  guildmasterXp: number;
  reputation: number;
}

export interface ArchiveRewardProgress {
  id: string;
  track: ArchiveRewardTrack;
  name: string;
  description: string;
  current: number;
  target: number;
  complete: boolean;
  claimed: boolean;
  reward: ArchiveRewardGrant;
}

type Requirement =
  | { kind: "bestiary_ratio"; ratio: number }
  | { kind: "lore_ratio"; ratio: number }
  | { kind: "tactics_ratio"; ratio: number }
  | { kind: "race_count"; count: number }
  | { kind: "class_count"; count: number };

interface ArchiveRewardDefinition {
  id: string;
  track: ArchiveRewardTrack;
  name: string;
  description: string;
  requirement: Requirement;
  reward: ArchiveRewardGrant;
}

const CLAIM_PREFIX = "archive_reward_claimed_";

const REWARDS: readonly ArchiveRewardDefinition[] = [
  { id: "bestiary_first_quarter", track: "bestiary", name: "Field Bestiarist", description: "Record one quarter of the known creature catalogue.", requirement: { kind: "bestiary_ratio", ratio: .25 }, reward: { guildmasterXp: 25, reputation: 4 } },
  { id: "bestiary_half", track: "bestiary", name: "Seasoned Bestiarist", description: "Record half of the known creature catalogue.", requirement: { kind: "bestiary_ratio", ratio: .5 }, reward: { guildmasterXp: 45, reputation: 7 } },
  { id: "bestiary_three_quarters", track: "bestiary", name: "Master of Field Notes", description: "Record three quarters of the known creature catalogue.", requirement: { kind: "bestiary_ratio", ratio: .75 }, reward: { guildmasterXp: 70, reputation: 10 } },
  { id: "bestiary_complete", track: "bestiary", name: "Complete Monster Manual", description: "Identify every creature currently documented by the guild archives.", requirement: { kind: "bestiary_ratio", ratio: 1 }, reward: { guildmasterXp: 110, reputation: 18 } },

  { id: "lore_first_quarter", track: "lore", name: "Listener of Eldoria", description: "Discover one quarter of the Lore Journal.", requirement: { kind: "lore_ratio", ratio: .25 }, reward: { guildmasterXp: 25, reputation: 4 } },
  { id: "lore_half", track: "lore", name: "Guild Chronicler", description: "Discover half of the Lore Journal.", requirement: { kind: "lore_ratio", ratio: .5 }, reward: { guildmasterXp: 45, reputation: 7 } },
  { id: "lore_three_quarters", track: "lore", name: "Keeper of Testimony", description: "Discover three quarters of the Lore Journal.", requirement: { kind: "lore_ratio", ratio: .75 }, reward: { guildmasterXp: 65, reputation: 9 } },
  { id: "lore_complete", track: "lore", name: "Living Chronicle", description: "Recover every currently available lore entry.", requirement: { kind: "lore_ratio", ratio: 1 }, reward: { guildmasterXp: 100, reputation: 15 } },

  { id: "tactics_first_quarter", track: "tactics", name: "Tactical Observer", description: "Record one quarter of enemy techniques used by known creatures.", requirement: { kind: "tactics_ratio", ratio: .25 }, reward: { guildmasterXp: 25, reputation: 3 } },
  { id: "tactics_half", track: "tactics", name: "Battlefield Scholar", description: "Record half of enemy techniques used across Eldoria.", requirement: { kind: "tactics_ratio", ratio: .5 }, reward: { guildmasterXp: 40, reputation: 5 } },
  { id: "tactics_three_quarters", track: "tactics", name: "Countermeasure Ledger", description: "Record three quarters of enemy techniques used across Eldoria.", requirement: { kind: "tactics_ratio", ratio: .75 }, reward: { guildmasterXp: 60, reputation: 7 } },
  { id: "tactics_complete", track: "tactics", name: "Master Tactician's Index", description: "Record every enemy technique currently represented in the field guide.", requirement: { kind: "tactics_ratio", ratio: 1 }, reward: { guildmasterXp: 90, reputation: 12 } },

  { id: "heroes_three_races", track: "heroes", name: "Mixed Company", description: "Maintain a roster representing at least three different peoples.", requirement: { kind: "race_count", count: 3 }, reward: { guildmasterXp: 25, reputation: 4 } },
  { id: "heroes_four_classes", track: "heroes", name: "Four Disciplines", description: "Maintain a roster containing at least four different classes.", requirement: { kind: "class_count", count: 4 }, reward: { guildmasterXp: 30, reputation: 4 } },
  { id: "heroes_five_races", track: "heroes", name: "Guild of Many Peoples", description: "Maintain a roster representing at least five different peoples.", requirement: { kind: "race_count", count: 5 }, reward: { guildmasterXp: 50, reputation: 7 } },
  { id: "heroes_eight_classes", track: "heroes", name: "Eight Paths, One Banner", description: "Fill the eight-hero roster with eight different classes at the same time.", requirement: { kind: "class_count", count: 8 }, reward: { guildmasterXp: 65, reputation: 10 } },
];

function uniqueEnemySkillIds(enemyIds: readonly string[]): Set<string> {
  const ids = new Set<string>();
  for (const enemyId of enemyIds) for (const skillId of ENEMIES[enemyId]?.skillIds ?? []) ids.add(skillId);
  return ids;
}

function ratioTarget(total: number, ratio: number): number {
  if (total <= 0) return 0;
  return Math.max(1, Math.ceil(total * ratio));
}

function requirementProgress(guild: GuildState, requirement: Requirement): { current: number; target: number } {
  if (requirement.kind === "bestiary_ratio") {
    const validKnown = new Set(guild.discoveredEnemyIds.filter((id) => Boolean(ENEMIES[id])));
    return { current: validKnown.size, target: ratioTarget(Object.keys(ENEMIES).length, requirement.ratio) };
  }
  if (requirement.kind === "lore_ratio") {
    const entries = Object.values(LORE_ENTRIES);
    const discovered = entries.filter((entry) => guild.world.worldFlags[entry.unlockFlag] === true).length;
    return { current: discovered, target: ratioTarget(entries.length, requirement.ratio) };
  }
  if (requirement.kind === "tactics_ratio") {
    const allSkills = uniqueEnemySkillIds(Object.keys(ENEMIES));
    const knownSkills = uniqueEnemySkillIds(guild.discoveredEnemyIds.filter((id) => Boolean(ENEMIES[id])));
    return { current: knownSkills.size, target: ratioTarget(allSkills.size, requirement.ratio) };
  }
  if (requirement.kind === "race_count") return { current: new Set(guild.heroes.map((hero) => hero.raceId)).size, target: requirement.count };
  return { current: new Set(guild.heroes.map((hero) => hero.classId)).size, target: requirement.count };
}

function factionRewardProgress(guild: GuildState): ArchiveRewardProgress[] {
  const known = new Set(guild.discoveredEnemyIds);
  return Object.values(ENEMY_FACTIONS).map((faction) => {
    const enemyIds = Object.values(ENEMIES).filter((enemy) => enemy.factionId === faction.id).map((enemy) => enemy.id);
    const current = enemyIds.filter((id) => known.has(id)).length;
    const id = `bestiary_faction_${faction.id}`;
    return {
      id,
      track: "bestiary" as const,
      name: `${faction.name} Dossier`,
      description: `Identify every ${faction.name.toLowerCase()} creature represented in the Monster Manual.`,
      current,
      target: enemyIds.length,
      complete: enemyIds.length > 0 && current >= enemyIds.length,
      claimed: guild.world.worldFlags[`${CLAIM_PREFIX}${id}`] === true,
      reward: { guildmasterXp: 20, reputation: 4 },
    };
  }).filter((entry) => entry.target > 0);
}

export function getArchiveRewardProgress(guild: GuildState, track?: ArchiveRewardTrack): ArchiveRewardProgress[] {
  const staticRewards = REWARDS.map((definition) => {
    const progress = requirementProgress(guild, definition.requirement);
    return {
      id: definition.id,
      track: definition.track,
      name: definition.name,
      description: definition.description,
      current: progress.current,
      target: progress.target,
      complete: progress.target > 0 && progress.current >= progress.target,
      claimed: guild.world.worldFlags[`${CLAIM_PREFIX}${definition.id}`] === true,
      reward: definition.reward,
    } satisfies ArchiveRewardProgress;
  });
  const all = [...staticRewards, ...factionRewardProgress(guild)];
  return track ? all.filter((entry) => entry.track === track) : all;
}

export function claimArchiveReward(guild: GuildState, rewardId: string): GuildState {
  const reward = getArchiveRewardProgress(guild).find((entry) => entry.id === rewardId);
  if (!reward) throw new Error("Unknown archive reward");
  if (reward.claimed) throw new Error("Archive reward has already been claimed");
  if (!reward.complete) throw new Error("Archive milestone is not complete yet");
  return {
    ...guild,
    reputation: guild.reputation + reward.reward.reputation,
    guildmaster: grantGuildmasterXp(guild.guildmaster, reward.reward.guildmasterXp),
    world: { ...guild.world, worldFlags: { ...guild.world.worldFlags, [`${CLAIM_PREFIX}${rewardId}`]: true } },
  };
}
