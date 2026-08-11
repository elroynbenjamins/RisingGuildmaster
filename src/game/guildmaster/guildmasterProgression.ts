import { GUILDMASTER_SKILLS } from "../../data/guildmaster/guildmasterSkills";
import type { GuildmasterProfile, GuildmasterSkillId } from "./guildmasterTypes";

export function createGuildmasterProfile(): GuildmasterProfile { return { level: 1, xp: 0, skillPoints: 0, unlockedSkillIds: [] }; }
export function guildmasterXpToNextLevel(level: number): number { return 100 + Math.max(0, level - 1) * 50; }
export function hasGuildmasterSkill(profile: GuildmasterProfile, skillId: GuildmasterSkillId): boolean { return profile.unlockedSkillIds.includes(skillId); }

export function grantGuildmasterXp(profile: GuildmasterProfile, amount: number): GuildmasterProfile {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Guildmaster XP must be non-negative");
  let level = profile.level; let xp = profile.xp + Math.round(amount); let skillPoints = profile.skillPoints;
  while (xp >= guildmasterXpToNextLevel(level)) { xp -= guildmasterXpToNextLevel(level); level += 1; skillPoints += 1; }
  return { ...profile, level, xp, skillPoints };
}

export function unlockGuildmasterSkill(profile: GuildmasterProfile, skillId: GuildmasterSkillId): GuildmasterProfile {
  const skill = GUILDMASTER_SKILLS[skillId];
  if (!skill) throw new Error("Unknown Guildmaster skill");
  if (hasGuildmasterSkill(profile, skillId)) throw new Error("Guildmaster skill is already unlocked");
  if (profile.level < skill.levelRequirement) throw new Error(`Requires Guildmaster Level ${skill.levelRequirement}`);
  if (!skill.prerequisiteSkillIds.every((id) => hasGuildmasterSkill(profile, id))) throw new Error("Prerequisite Guildmaster skill is not unlocked");
  if (profile.skillPoints < skill.pointCost) throw new Error("Not enough Guildmaster skill points");
  return { ...profile, skillPoints: profile.skillPoints - skill.pointCost, unlockedSkillIds: [...profile.unlockedSkillIds, skillId] };
}
