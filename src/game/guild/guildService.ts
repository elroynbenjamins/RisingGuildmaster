import { GAME_CONFIG } from "../../config/gameConfig";
import type { Hero } from "../heroes/types";
import type { GuildState } from "./types";
import { createWorldState } from "../world/worldState";
import { createRecruitmentState } from "../recruitment/recruitmentService";
import { createGuildArtisanState, emptyMaterialInventory } from "../crafting/craftingTypes";
import { createGuildmasterProfile } from "../guildmaster/guildmasterProgression";
import { createGuildFinanceState } from "../economy/economyTypes";
import { createTrainingGroundState } from "../training/trainingTypes";
import { createTutorialState } from "../onboarding/onboardingTypes";
import { createRogueliteRotationState } from "../dungeons/rogueliteRotationTypes";
import { emptyPotionInventory } from "../alchemy/potionTypes";
import { appendHeroHistoryEvent } from "../heroes/heroHistoryService";
export function createGuild(name = "The Wayfarers"): GuildState { return { guildId: "guild-player", guildName: name, guildmaster: createGuildmasterProfile(), gold: GAME_CONFIG.startingGold, gems: GAME_CONFIG.startingGems, gemTransactions: [], finance: createGuildFinanceState(), reputation: GAME_CONFIG.startingReputation, heroes: [], inventory: [], materials: emptyMaterialInventory(), potions: emptyPotionInventory(), artisans: createGuildArtisanState(), trainingGround: createTrainingGroundState(), gatheringMissions: [], currentDay: GAME_CONFIG.startingDay, world: createWorldState(), recentPartyHeroIds: [], discoveredEnemyIds: [], questChronicle: [], relationships: [], recruitment: createRecruitmentState(GAME_CONFIG.startingDay), heroContracts: [], huntRewardProgress: {}, tutorial: createTutorialState(), rogueliteRotation: createRogueliteRotationState(), activeDungeonRun: null, activeRogueliteRun: null }; }
export function recruitHero(guild: GuildState, hero: Hero): GuildState {
  if (guild.heroes.some((item) => item.id === hero.id)) throw new Error("Hero is already in this guild");
  if (guild.gold < hero.recruitmentCost) throw new Error("Not enough gold");
  const recruited = appendHeroHistoryEvent(hero, { day: guild.currentDay, type: "recruitment", outcome: "positive", title: "Joined the guild", description: `${hero.name} joined ${guild.guildName}.` });
  return { ...guild, gold: guild.gold - hero.recruitmentCost, heroes: [...guild.heroes, recruited] };
}
