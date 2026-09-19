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
import type { GameDifficultyId } from "../difficulty/difficultyTypes";
import { createGuildOperationState } from "../operations/guildOperationTypes";
import { createGuildLegacyState } from "../renown/guildLegacyService";
import { createContentEntitlements, createDailyLoginState } from "../monetization/contentUnlockService";
import { CURRENT_SAVE_VERSION } from "../save/saveVersion";
export function createGuild(name = "The Wayfarers", difficultyId: GameDifficultyId = "standard"): GuildState { return { saveVersion: CURRENT_SAVE_VERSION, achievementClaims: [], seenUnlockSummaryIds: ["region:greenveil","class:warrior","class:ranger","class:mage","class:cleric","class:paladin","class:berserker","race:human","race:elf","race:dwarf","race:orc"], metrics: { craftedItemsCount: 0 }, guildId: "guild-player", guildName: name, difficultyId, guildmaster: createGuildmasterProfile(), legacy: createGuildLegacyState(), gold: GAME_CONFIG.startingGold, gems: GAME_CONFIG.startingGems, rations: GAME_CONFIG.startingRations, gemTransactions: [], viewedAdMilestoneDays: [], entitlements: createContentEntitlements(), dailyLogin: createDailyLoginState(), finance: createGuildFinanceState(), reputation: GAME_CONFIG.startingReputation, heroes: [], inventory: [], materials: emptyMaterialInventory(), potions: emptyPotionInventory(), artisans: createGuildArtisanState(), trainingGround: createTrainingGroundState(), gatheringMissions: [], currentDay: GAME_CONFIG.startingDay, world: createWorldState(), recentPartyHeroIds: [], partyPresets: [], equipmentLoadoutsByHeroId:{},uiPreferences:{reduceCombatEffects:false,reduceMotion:false,strongerCombatContrast:false,tactileFeedback:true,confirmEndTurn:false,defaultCombatZoom:"fit",compactQuestCards:true,enemyTurnSpeed:"normal"}, discoveredEnemyIds: [], questChronicle: [], relationships: [], recruitment: createRecruitmentState(GAME_CONFIG.startingDay), heroContracts: [], huntRewardProgress: {}, tutorial: createTutorialState(), rogueliteRotation: createRogueliteRotationState(), guildOperations: createGuildOperationState(), activeDungeonRun: null, activeRogueliteRun: null }; }
export function recruitHero(guild: GuildState, hero: Hero): GuildState {
  if (guild.heroes.some((item) => item.id === hero.id)) throw new Error("Hero is already in this guild");
  if (guild.gold < hero.recruitmentCost) throw new Error("Not enough gold");
  const recruited = appendHeroHistoryEvent(hero, { day: guild.currentDay, type: "recruitment", outcome: "positive", title: "Joined the guild", description: `${hero.name} joined ${guild.guildName}.` });
  return { ...guild, gold: guild.gold - hero.recruitmentCost, heroes: [...guild.heroes, recruited] };
}
