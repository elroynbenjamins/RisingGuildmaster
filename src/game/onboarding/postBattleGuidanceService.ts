import { GAME_CONFIG } from "../../config/gameConfig";
import { getCampaignPreparationRecommendation } from "../campaign/campaignPreparationGuide";
import type { GuildState } from "../guild/types";
import type { QuestHeroOutcomeRecord } from "../quests/questChronicleTypes";

export type PostBattleActionId = "recovery" | "preparation" | "skills" | "equipment" | "readiness";
export type PostBattlePreparationDestination = "side_quests" | "dungeon";

export interface PostBattleManagementAction {
  id: PostBattleActionId;
  title: string;
  description: string;
  actionLabel: string;
  heroId?: string;
  itemId?: string;
  destination?: PostBattlePreparationDestination;
  isNew: boolean;
}

const SEEN_FLAGS: Record<PostBattleActionId, string> = {
  recovery: "post_battle_recovery_guidance_seen",
  preparation: "post_battle_preparation_guidance_seen",
  skills: "post_battle_skills_guidance_seen",
  equipment: "post_battle_equipment_guidance_seen",
  readiness: "post_battle_readiness_guidance_seen",
};

interface PostBattleSummary {
  status?: "victory" | "defeat";
  lootIds: string[];
  heroOutcomes: QuestHeroOutcomeRecord[];
}

function preparationAction(summary: PostBattleSummary, guild: GuildState): PostBattleManagementAction | null {
  const recommendation = getCampaignPreparationRecommendation(guild);
  if (!recommendation) return null;

  const fallenCount = summary.heroOutcomes.filter((outcome) => outcome.fellInBattle).length;
  const casualtyHeavy = fallenCount >= 2;
  const visibleUnderpreparedSignal = fallenCount >= 1 && recommendation.reason !== "boss";
  const shouldRecommend = summary.status === "defeat" || casualtyHeavy || visibleUnderpreparedSignal;
  if (!shouldRecommend) return null;

  const resultLead = summary.status === "defeat"
    ? "The party was defeated."
    : fallenCount === 1
      ? "This victory cost one hero."
      : `This victory cost ${fallenCount} heroes.`;
  const destination: PostBattlePreparationDestination = recommendation.type === "dungeon" ? "dungeon" : "side_quests";
  const routeText = recommendation.type === "dungeon"
    ? recommendation.suggestedRuns === 1
      ? "Recover first, then complete one Wardstone Expedition before the next story push."
      : "Recover first, then complete two Wardstone Expeditions and reassess before the next story push."
    : `Recover first, then take ${recommendation.title} before the next story push.`;

  return {
    id: "preparation",
    title: "Rebuild Before the Next Push",
    description: `${resultLead} ${routeText} ${recommendation.detail}`,
    actionLabel: recommendation.type === "dungeon" ? "Open Roguelite" : "Browse Side Quests",
    destination,
    isNew: guild.world.worldFlags[SEEN_FLAGS.preparation] !== true,
  };
}

export function getPostBattleManagementActions(summary: PostBattleSummary, guild: GuildState): PostBattleManagementAction[] {
  const actions: PostBattleManagementAction[] = [];
  const partyIds = new Set(summary.heroOutcomes.map((hero) => hero.heroId));
  const needsRecovery = summary.heroOutcomes.some((outcome) => {
    const hero = guild.heroes.find((entry) => entry.id === outcome.heroId);
    return Boolean(hero && (hero.currentHP <= 0 || hero.currentHP < outcome.maxHP || hero.conditions.length > 0));
  });
  const preparation = preparationAction(summary, guild);
  const skillHero = summary.heroOutcomes.find((outcome) => outcome.availableSkillPoints > 0 && guild.heroes.some((hero) => hero.id === outcome.heroId));
  const itemId = summary.lootIds.find((id) => guild.inventory.includes(id)) ?? summary.lootIds[0];
  const needsReadiness = guild.heroes.some((hero) => partyIds.has(hero.id) && hero.adventureStamina < GAME_CONFIG.maxAdventureStamina);

  if (needsRecovery) actions.push({ id: "recovery", title: "Restore the Party", description: "HP loss, injuries, and fallen heroes persist after battle. The Temple uses gold for treatment; revival costs 5 gems, or today’s free revive when Remove Ads is owned.", actionLabel: "Open Temple", isNew: guild.world.worldFlags[SEEN_FLAGS.recovery] !== true });
  if (preparation) actions.push(preparation);
  if (skillHero) actions.push({ id: "skills", title: "Spend a Skill Point", description: `${skillHero.name} can make a permanent class-skill choice. Inspect the full tree and its prerequisites before committing.`, actionLabel: `Develop ${skillHero.name}`, heroId: skillHero.heroId, isNew: guild.world.worldFlags[SEEN_FLAGS.skills] !== true });
  if (itemId) actions.push({ id: "equipment", title: "Equip Recovered Gear", description: "Quest equipment is stored in Inventory. Inspect it to compare eligible heroes and replace their currently equipped item.", actionLabel: "Inspect New Gear", itemId, isNew: guild.world.worldFlags[SEEN_FLAGS.equipment] !== true });
  if (needsReadiness) actions.push({ id: "readiness", title: "Recover Readiness", description: `This quest already advanced the calendar by one day. Additional days restore ${GAME_CONFIG.adventureStaminaRecoveryPerDay} readiness, but also progress payroll, candidate expiry, projects, and regional threats.`, actionLabel: "Review Calendar", isNew: guild.world.worldFlags[SEEN_FLAGS.readiness] !== true });
  return actions;
}

export function markPostBattleGuidanceSeen(guild: GuildState, actionId: PostBattleActionId): GuildState {
  return { ...guild, world: { ...guild.world, worldFlags: { ...guild.world.worldFlags, [SEEN_FLAGS[actionId]]: true } } };
}
