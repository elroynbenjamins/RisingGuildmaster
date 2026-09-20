import type { GuildState } from "../guild/types";
import type { WorldEventDefinition } from "../world/worldTypes";

export const STARTER_JOURNEY = {
  targetSettlementId: "brambleford",
  roadQuestId: "brambleway_road_ambush",
  sideQuestId: "brambleway_caravan",
} as const;

const atChieftainStage = (guild: GuildState) => guild.world.completedCampaignNodeIds.includes("attack_on_guildhaven") && !guild.world.completedCampaignNodeIds.includes("goblin_chieftain");
export const needsThirdHeroForJourney = (guild: GuildState) => atChieftainStage(guild) && guild.heroes.filter((hero) => hero.currentHP > 0).length < 3;
const needsStarterRoadSequence = (guild: GuildState) => atChieftainStage(guild) && !needsThirdHeroForJourney(guild) && guild.world.worldFlags.starter_brambleway_road_ambush_complete !== true;
export const needsStarterJourneyTravel = (guild: GuildState) => needsStarterRoadSequence(guild) && guild.world.currentSettlementId !== STARTER_JOURNEY.targetSettlementId;
export const needsStarterRoadEncounter = (guild: GuildState) => needsStarterRoadSequence(guild) && guild.world.currentSettlementId === STARTER_JOURNEY.targetSettlementId;
export const needsBramblefordSideQuest = (guild: GuildState) => atChieftainStage(guild) && guild.world.worldFlags.starter_brambleway_road_ambush_complete === true && guild.world.worldFlags.starter_brambleford_side_quest_complete !== true;
export const needsFourthHeroForChieftain = (guild: GuildState) => atChieftainStage(guild) && needsBramblefordSideQuest(guild) === false && guild.world.worldFlags.starter_brambleford_side_quest_complete === true && guild.heroes.filter((hero) => hero.currentHP > 0).length < 4;
export const canUsePaidRecruitmentRefresh = (guild: GuildState) => guild.difficultyId !== "iron_guild" || guild.world.worldFlags.starter_iron_refresh_unlocked === true;

export function markFourthHeroReady(guild: GuildState): GuildState {
  if (!atChieftainStage(guild) || guild.world.worldFlags.starter_brambleford_side_quest_complete !== true || guild.heroes.filter((hero) => hero.currentHP > 0).length < 4) return guild;
  return { ...guild, world: { ...guild.world, worldFlags: { ...guild.world.worldFlags, starter_fourth_hero_ready: true } } };
}

export function starterBramblewayEvent(): WorldEventDefinition {
  return { id: "starter_brambleway_road_alarm", title: "Caravan Under Attack", description: "On the first day toward Brambleford, horns sound from Aldren Vale's wagons. Bandits are closing through the brambles.", tier: "common", regionIds: ["greenveil"], weight: 1, choices: [{ id: "protect_caravan", text: "Form up and protect the caravan", questId: STARTER_JOURNEY.roadQuestId, successOutcomes: [] }] };
}
