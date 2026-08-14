import type { QuestDecisionChoiceDefinition, QuestDecisionStageDefinition } from "../../game/quests/questDecisionTypes";

export interface EscortNpcDefinition { id: string; name: string; role: string; description: string; portraitId: string }

export const CARAVAN_ESCORT_NPCS: EscortNpcDefinition[] = [
  { id: "aldren_vale", name: "Aldren Vale", role: "Merchant", description: "The caravan owner. Aldren knows the Brambleway's trade posts, but hides how nervous the recent disappearances have made him.", portraitId: "aldren_vale" },
  { id: "mira_thorn", name: "Mira Thorn", role: "Caravan Guard", description: "A veteran outrider hired to keep Aldren alive. Mira watches the tree line while the guild protects the wagons.", portraitId: "mira_thorn" },
];

export const CARAVAN_DECISION_STAGES: Record<string, QuestDecisionStageDefinition> = {
  caravan_route: { id: "caravan_route", questId: "brambleway_caravan", title: "Choose the Marching Order", description: "Aldren wants speed; Mira suspects the road is being watched. Decide how the guild positions itself around the wagons.", choiceIds: ["scout_ahead", "study_route", "close_escort"] },
  caravan_warning: { id: "caravan_warning", questId: "brambleway_caravan", title: "Signs at the Broken Milestone", description: "Fresh wheel ruts stop abruptly beside an abandoned milestone. Birds have fallen silent in the woods ahead.", choiceIds: ["read_ambush_tracks", "fortify_caravan", "press_on"] },
};

export const CARAVAN_DECISION_CHOICES: Record<string, QuestDecisionChoiceDefinition> = {
  scout_ahead: { id: "scout_ahead", text: "Scout beyond the caravan", description: "Send the sharpest-eyed hero ahead to search for concealed lookouts.", abilityCheck: { attribute: "wisdom", difficultyClass: 12 }, success: { awareness: 1, text: "The scout spots a mirrored signal in the trees. Someone is coordinating an ambush." }, failure: { awareness: -1, text: "The scout finds nothing and returns, unaware that a hidden watcher counted every guard." } },
  study_route: { id: "study_route", text: "Study Aldren's route ledger", description: "Use maps, delivery times, and old attack reports to predict the most likely kill zone.", abilityCheck: { attribute: "intelligence", difficultyClass: 13 }, success: { awareness: 1, text: "The route pattern reveals a narrow bend ideal for an ambush. The party advances cautiously." }, failure: { awareness: 0, text: "The contradictory notes consume precious time without revealing where the attackers wait." } },
  close_escort: { id: "close_escort", text: "Keep a tight escort", description: "Remain beside the wagons. This gives no warning, but keeps shields close to Aldren and Mira.", success: { awareness: 0, heroArmorClassModifier: 1, text: "The party forms a disciplined shield ring around the caravan." } },
  read_ambush_tracks: { id: "read_ambush_tracks", text: "Inspect the broken milestone", description: "Read boot prints and disturbed roots before the caravan enters the bend.", abilityCheck: { attribute: "wisdom", difficultyClass: 14 }, success: { awareness: 1, text: "Boot marks lead to firing positions on both sides of the road. The trap is exposed." }, failure: { awareness: -1, text: "The obvious tracks are decoys. The real attackers are already moving behind the wagons." } },
  fortify_caravan: { id: "fortify_caravan", text: "Use the wagons as cover", description: "Reinforce the wagon line and prepare a defensive fighting position.", abilityCheck: { attribute: "strength", difficultyClass: 12 }, success: { awareness: 1, heroArmorClassModifier: 1, text: "The party shifts the heavy wagons into cover before the first bolt is fired." }, failure: { awareness: 0, text: "A seized axle prevents the wagons from turning. The party is caught halfway through deployment." } },
  press_on: { id: "press_on", text: "Press on without stopping", description: "Trust speed and keep the delivery on schedule.", success: { awareness: -1, text: "The caravan enters the wooded bend without learning who waits beyond it." } },
};
