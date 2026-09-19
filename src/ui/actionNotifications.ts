import type { GuildState } from "../game/guild/types";
import type { Hero } from "../game/heroes/types";
import { GUILDMASTER_SKILLS } from "../data/guildmaster/guildmasterSkills";
import { getHeroSkillTree } from "../game/progression/skills/skillProgressionService";
import { getSubclassChoices } from "../game/progression/subclasses/subclassService";
import { validateSubclassSelection } from "../game/progression/subclasses/subclassValidator";
import { getMasteryChoices, validateMasterySelection } from "../game/progression/masteries/masteryService";
import { canClaimDailyLogin } from "../game/monetization/contentUnlockService";
import { getClaimableAchievements } from "../game/achievements/achievementService";
export function heroHasSkillChoice(hero: Hero): boolean {
  return hero.currentHP > 0 && (getHeroSkillTree(hero).some((node) => node.state === "available")
    || getSubclassChoices(hero).some((choice) => !validateSubclassSelection(hero, choice.id).length)
    || getMasteryChoices(hero).some((choice) => !validateMasterySelection(hero, choice.id).length));
}
export function guildActionNotifications(guild: GuildState, date = new Date()) {
  const profile = guild.guildmaster;
  const guildmaster = Object.values(GUILDMASTER_SKILLS).some((skill) =>
    !profile.unlockedSkillIds.includes(skill.id) && profile.level >= skill.levelRequirement
    && profile.skillPoints >= skill.pointCost && skill.prerequisiteSkillIds.every((id) => profile.unlockedSkillIds.includes(id)));
  const heroes = guild.heroes.some(heroHasSkillChoice);
  const daily = canClaimDailyLogin(guild, date);
  const achievements = getClaimableAchievements(guild).length > 0;
  return { guildmaster, heroes, daily, achievements, manage: guildmaster || heroes || daily || achievements };
}
