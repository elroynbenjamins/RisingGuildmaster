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

export type StarterJourneyDestination = "recruitment" | "world" | "sideQuests";
export interface StarterJourneyStep {
  id: "recruit_third" | "travel_brambleford" | "road_ambush" | "brambleway_run" | "recruit_fourth";
  title: string;
  description: string;
  actionLabel: string;
  destination: StarterJourneyDestination;
}

export function getStarterJourneyStep(guild: GuildState): StarterJourneyStep | null {
  if (needsThirdHeroForJourney(guild)) return {
    id: "recruit_third",
    title: "Recruit a Third Hero",
    description: "The road to the Goblin Chieftain needs a three-hero field company. Sign one more adventurer before leaving Guildhaven.",
    actionLabel: "OPEN RECRUITMENT",
    destination: "recruitment",
  };
  if (needsStarterJourneyTravel(guild)) return {
    id: "travel_brambleford",
    title: "Travel to Brambleford",
    description: "Take your three-hero company to Brambleford. The first Brambleway journey begins the final preparation for the Chieftain.",
    actionLabel: "OPEN WORLD",
    destination: "world",
  };
  if (needsStarterRoadEncounter(guild)) return {
    id: "road_ambush",
    title: "Answer the Brambleway Alarm",
    description: "Open Brambleford on the regional map and visit the settlement. Aldren Vale's caravan encounter is waiting there.",
    actionLabel: "OPEN WORLD",
    destination: "world",
  };
  if (needsBramblefordSideQuest(guild)) return {
    id: "brambleway_run",
    title: "Complete the Brambleway Run",
    description: "Escort the caravan from Brambleford. This Level 2 company trial is available before the normal Level 3 Side Quest unlock.",
    actionLabel: "OPEN SIDE QUESTS",
    destination: "sideQuests",
  };
  if (needsFourthHeroForChieftain(guild)) return {
    id: "recruit_fourth",
    title: "Recruit the Fourth Hero",
    description: "The company trial is complete. Add a fourth living hero to finish preparations for the Goblin Chieftain.",
    actionLabel: "OPEN RECRUITMENT",
    destination: "recruitment",
  };
  return null;
}

export function markFourthHeroReady(guild: GuildState): GuildState {
  if (!atChieftainStage(guild) || guild.world.worldFlags.starter_brambleford_side_quest_complete !== true || guild.heroes.filter((hero) => hero.currentHP > 0).length < 4) return guild;
  return { ...guild, world: { ...guild.world, worldFlags: { ...guild.world.worldFlags, starter_fourth_hero_ready: true } } };
}

export function starterBramblewayEvent(): WorldEventDefinition {
  return { id: "starter_brambleway_road_alarm", title: "Caravan Under Attack", description: "On the first day toward Brambleford, horns sound from Aldren Vale's wagons. Bandits are closing through the brambles.", tier: "common", regionIds: ["greenveil"], weight: 1, choices: [{ id: "protect_caravan", text: "Form up and protect the caravan", questId: STARTER_JOURNEY.roadQuestId, successOutcomes: [] }] };
}
