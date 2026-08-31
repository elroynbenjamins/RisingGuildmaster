import type { SkillId } from "../../game/proficiencies/proficiencyTypes";

// Older authored quests predate named proficiencies. Keeping this association in
// quest data lets them use 5e-style skills without embedding quest IDs in logic.
export const QUEST_STAGE_PROFICIENCIES: Readonly<Record<string, SkillId>> = {
  blackbridge_read_ashes: "investigation", blackbridge_cross_span: "acrobatics", blackbridge_answer_bell: "insight",
  ledger_break_cipher: "investigation", ledger_find_storehouse: "perception",
  oath_resist_echoes: "religion", oath_align_heartstone: "arcana",
  mosswatch_cipher: "history", mosswatch_gate: "athletics", mosswatch_resonance: "perception",
  queen_tracks: "survival", queen_ravine: "acrobatics", queen_echoes: "nature",
  bellkeeper_skiff: "survival", bellkeeper_bell_code: "history", bellkeeper_floodgate: "athletics",
  ladders_reinforce_wall: "athletics", ladders_rally_defenders: "persuasion", ladders_read_attack: "perception",
  lift_counterweight: "investigation", lift_maintenance_shaft: "acrobatics", lift_brace_winch: "athletics",
  knives_read_murder_room: "investigation", knives_cross_rain_roofs: "acrobatics", knives_spot_tripwires: "perception",
  serpent_read_trail: "survival", serpent_cross_roots: "acrobatics", serpent_prepare_antivenom: "nature",
  sewer_question_keeper: "persuasion", sewer_raise_gate: "athletics", sewer_predict_attack: "perception",
  yeti_endure_whiteout: "survival", yeti_read_whiteout: "survival", yeti_cross_avalanche: "athletics",
  ash_read_burn: "arcana", ash_measure_tracks: "nature", ash_follow_vermin: "stealth",
  hollow_open_observatory: "arcana", hollow_translate_warning: "history", hollow_quiet_embers: "insight",
};

export function getQuestStageProficiency(stageId: string, explicit?: SkillId): SkillId | undefined {
  return explicit ?? QUEST_STAGE_PROFICIENCIES[stageId];
}
