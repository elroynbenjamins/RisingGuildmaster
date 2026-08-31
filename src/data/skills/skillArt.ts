export interface SkillIconCoordinate { column: number; row: number }

const heroCoordinates = [
  "warrior_sword_strike", "warrior_shield_bash", "warrior_power_strike", "warrior_battle_hardened", "ranger_bow_shot", "ranger_precise_shot",
  "ranger_multi_shot", "ranger_hunters_focus", "mage_arcane_bolt", "mage_fireball", "mage_frost_bolt", "mage_arcane_knowledge",
  "cleric_holy_strike", "cleric_heal", "cleric_divine_light", "cleric_faith", "paladin_holy_slash", "paladin_smite",
  "paladin_guardians_oath", "paladin_holy_armor", "berserker_wild_swing", "berserker_frenzied_strike", "berserker_whirlwind", "berserker_rage",
  "guardian_taunt", "commander_arcane_rally", "sharpshooter_deadeye", "beastmaster_summon_wolf", "pyromancer_flame_wall", "cryomancer_ice_prison",
  "life_priest_greater_heal", "oracle_foresight_blessing", "oracle_arcane_surge", "templar_defensive_aura", "hexbreaker_null_seal", "juggernaut_unstoppable_charge",
] as const;

export const HERO_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(heroCoordinates.map((id, index) => [id, { column: index % 6, row: Math.floor(index / 6) }])) as Record<string, SkillIconCoordinate>;
HERO_SKILL_ICON_COORDINATES.hexbreaker_weakened_oath = { column: 4, row: 5 };
HERO_SKILL_ICON_COORDINATES.bloodreaver_blood_strike = { column: 3, row: 3 };
const heroSkillVisualAliases: Record<string, string> = {
  warrior_guarded_stance: "warrior_shield_bash", warrior_cleaving_sweep: "berserker_whirlwind", warrior_second_wind: "cleric_heal", warrior_intercept: "guardian_taunt", warrior_relentless_assault: "warrior_power_strike", warrior_unbreakable: "warrior_battle_hardened",
  ranger_hunters_mark: "ranger_hunters_focus", ranger_ensnaring_arrow: "ranger_precise_shot", ranger_evasive_step: "ranger_hunters_focus", ranger_piercing_shot: "sharpshooter_deadeye", ranger_volley: "ranger_multi_shot", ranger_ambush_mastery: "ranger_hunters_focus",
  mage_arcane_shield: "paladin_holy_armor", mage_lightning_line: "mage_arcane_bolt", mage_mist_step: "mage_frost_bolt", mage_counterspell: "hexbreaker_null_seal", mage_chain_lightning: "mage_fireball", mage_mana_font: "mage_arcane_knowledge",
  cleric_blessing: "oracle_foresight_blessing", cleric_sacred_ward: "paladin_guardians_oath", cleric_purifying_light: "cleric_divine_light", cleric_turn_undead: "cleric_holy_strike", cleric_mass_restoration: "life_priest_greater_heal", cleric_divine_intervention: "cleric_faith",
  paladin_lay_on_hands: "cleric_heal", paladin_compelled_challenge: "guardian_taunt", paladin_cleansing_smite: "paladin_smite", paladin_aura_of_courage: "templar_defensive_aura", paladin_judgment: "paladin_holy_slash", paladin_unyielding_faith: "paladin_holy_armor",
  berserker_reckless_attack: "berserker_frenzied_strike", berserker_war_cry: "commander_arcane_rally", berserker_blood_rush: "berserker_rage", berserker_groundbreaker: "berserker_whirlwind", berserker_brutal_critical: "berserker_rage", berserker_refuse_death: "warrior_battle_hardened",
};
for (const [skillId, visualId] of Object.entries(heroSkillVisualAliases)) HERO_SKILL_ICON_COORDINATES[skillId] = HERO_SKILL_ICON_COORDINATES[visualId]!;
const masterySkillVisualAliases: Record<string, string> = {
  vanguard_rallying_advance: "commander_arcane_rally", warmaster_battle_standard: "commander_arcane_rally", pathfinder_trailblazer: "ranger_hunters_focus", huntmaster_marked_quarry: "ranger_hunters_mark",
  high_arcanist_confluence: "mage_arcane_knowledge", warcaster_overchannel: "mage_fireball", beacon_consecrated_presence: "templar_defensive_aura", exorcist_banish_corruption: "hexbreaker_null_seal",
  crusader_radiant_challenge: "paladin_smite", oathkeeper_steadfast_oath: "paladin_guardians_oath", ravager_rending_sweep: "berserker_whirlwind", totem_bearer_war_totem: "berserker_war_cry"
};
for (const [skillId, visualId] of Object.entries(masterySkillVisualAliases)) HERO_SKILL_ICON_COORDINATES[skillId] = HERO_SKILL_ICON_COORDINATES[visualId]!;

/** Enemy abilities reuse this visual vocabulary deterministically pending a dedicated bestiary atlas. */
const enemyCoordinates = [
  "goblin_stab", "goblin_dodge", "arrow_shot", "brute_slam", "wardstone_hex", "rusty_slash",
  "bone_arrow", "zombie_claw", "infectious_bite", "wolf_bite", "wolf_pounce", "predator_instinct",
  "spider_bite", "venom_bite", "binding_web", "broodguard_fangs", "venom_rain", "web_entomb",
  "dirty_strike", "bandit_rally", "commanding_presence", "orc_cleave", "reckless_charge", "orc_blood_fury",
  "troll_smash", "ground_slam", "troll_regeneration", "chieftain_war_cry", "desperate_command", "chainbreaker_roar",
  "sentry_hammer", "runic_bulwark", "shard_bolt", "fracture_ray", "serpent_constrict", "avalanche_roar",
] as const;
export const ENEMY_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(enemyCoordinates.map((id, index) => [id, { column: index % 6, row: Math.floor(index / 6) }])) as Record<string, SkillIconCoordinate>;

const ashStoryCoordinates = [
  "ember_bite", "cinder_scuttle", "ember_fed",
  "cinder_blade", "ash_bomb", "scale_hammer",
  "wardfire_pulse", "ancient_scale_shell", "sleeping_ember",
] as const;
export const ASH_STORY_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(ashStoryCoordinates.map((id, index) => [id, { column: index % 3, row: Math.floor(index / 3) }])) as Record<string, SkillIconCoordinate>;

const enemyExpansionACoordinates = [
  "raking_beaks", "blinding_wings", "feast_on_the_fallen", "sapper_knife", "blasting_charge", "smoke_pot",
  "spectral_brand", "accusing_whisper", "unfinished_oath", "laurel_blade", "shield_rebuke", "laurel_discipline",
  "revenant_glaive", "heartstone_pulse", "oathbound_shell", "final_testimony", "gloam_stiletto", "shadowstep_strike",
  "death_from_shadow", "nightglass_bolt", "caltrop_burst", "prepared_killbox", "blackglass_blade", "vanishing_cut",
  "silent_coordination", "no_witnesses", "quick_strike", "aimed_shot", "heavy_swing", "splinter_bolt",
  "piercing_shot", "bone_precision", "spiderling_bites", "skittering_strike", "web_bolt", "brood_crush",
] as const;
export const ENEMY_SKILL_EXPANSION_A_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(enemyExpansionACoordinates.map((id, index) => [id, { column: index % 6, row: Math.floor(index / 6) }])) as Record<string, SkillIconCoordinate>;

const enemyExpansionBCoordinates = [
  "queen_fangs", "queen_frenzy", "brood_matriarch", "bandit_slash", "captain_sword_strike", "chieftain_cleave",
  "chieftain_presence", "chain_cleaver", "unbound_fury", "warden_hammer", "warden_pulse", "hollow_ward_shell",
  "warden_judgment_protocol", "serpent_fangs", "venom_spit", "coiled_fury", "crocodile_bite", "death_roll",
  "blood_in_water", "ice_shard", "freezing_gust", "yeti_maul", "thick_winter_fur", "whiteout_fury",
] as const;
export const ENEMY_SKILL_EXPANSION_B_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(enemyExpansionBCoordinates.map((id, index) => [id, { column: index % 6, row: Math.floor(index / 6) }])) as Record<string, SkillIconCoordinate>;
const frostmarchChapter3Coordinates = ["rimefang_bite", "rime_pounce", "frozen_halberd", "deathless_watch", "aurora_lance", "false_sky_chorus", "hroth_greataxe", "blue_horn_call", "iceblood_fury", "drake_fang", "pale_breath", "echo_of_the_first"] as const;
export const FROSTMARCH_CHAPTER_3_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(frostmarchChapter3Coordinates.map((id,index)=>[id,{column:index%4,row:Math.floor(index/4)}]));
for (const id of frostmarchChapter3Coordinates) ENEMY_SKILL_EXPANSION_B_COORDINATES[id] = FROSTMARCH_CHAPTER_3_SKILL_ICON_COORDINATES[id]!;
const shadowfenChapter4Coordinates = ["mire_claw", "bog_ambush", "rusted_glaive", "shield_of_silt", "gravewater_bolt", "stolen_name", "bell_claw", "funeral_toll", "widows_refrain", "memory_quill", "erase_from_record", "archive_unbound"] as const;
export const SHADOWFEN_CHAPTER_4_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(shadowfenChapter4Coordinates.map((id,index)=>[id,{column:index%4,row:Math.floor(index/4)}]));
for (const id of shadowfenChapter4Coordinates) ENEMY_SKILL_EXPANSION_B_COORDINATES[id] = SHADOWFEN_CHAPTER_4_SKILL_ICON_COORDINATES[id]!;
const chapter6Coordinates=["laurel_sword","formation_rebuke","writ_of_order","laurel_bolt","pinning_volley","oath_spark","binding_clause","examiner_hammer","unlawful_command","echo_touch","borrowed_face","cassian_blade","crown_decree","perfected_authority","sixth_denial"] as const;
export const GREENVEIL_CHAPTER_6_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(chapter6Coordinates.map((id,index)=>[id,{column:index%4,row:Math.floor(index/4)}]));
const chapter7Coordinates=["brass_halberd","embassy_interdict","hollow_protocol","crown_pick","sever_anchor","storm_beak","mimic_cry","gale_wings","drake_fang_brass","thunder_sweep","beacon_spark","crown_refraction","gilded_bite","rupture_breath","stolen_concord","storm_rupture"] as const;
export const IRON_HILLS_CHAPTER_7_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(chapter7Coordinates.map((id,index)=>[id,{column:index%4,row:Math.floor(index/4)}]));
const chapter8Coordinates=["salt_iron_cutlass","boarding_hook","drowned_discipline","nullwake_bolt","black_squall_volley","devour_oath","hush_the_sixth","borrowed_resolve","reaver_blade","undertow_charge","leviathan_maul","abyssal_hide","admirals_sabre","black_tide_broadside","no_harbor_aura","last_flag_phase"] as const;
export const WESTERN_SEA_CHAPTER_8_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(chapter8Coordinates.map((id,index)=>[id,{column:index%4,row:Math.floor(index/4)}]));
const chapter9Coordinates=["drowned_halberd","undertow_guard","lantern_ray","borrowed_light","eat_the_name","swarm_of_doubt","tideglass_claw","mirror_step","gate_fist","civic_bulwark","chartmakers_blade","redraw_battlefield","law_of_the_drowned","below_the_chart","tidal_sentence","chained_voice"] as const;
export const DROWNED_SEVENTH_CHAPTER_9_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(chapter9Coordinates.map((id,index)=>[id,{column:index%4,row:Math.floor(index/4)}]));
const masteryCoordinates=["vanguard_rallying_advance","warmaster_battle_standard","pathfinder_trailblazer","huntmaster_marked_quarry","high_arcanist_confluence","warcaster_overchannel","beacon_consecrated_presence","exorcist_banish_corruption","crusader_radiant_challenge","oathkeeper_steadfast_oath","ravager_rending_sweep","totem_bearer_war_totem"] as const;
export const LEVEL_10_MASTERY_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(masteryCoordinates.map((id,index)=>[id,{column:index%4,row:Math.floor(index/4)}]));
const monkBardCoordinates = ["monk_unarmed_strike","monk_flurry_of_blows","monk_patient_defense","monk_deflect_missiles","monk_step_of_wind","monk_stunning_strike","monk_sweeping_kick","monk_stillness","monk_quivering_palm","open_hand_push","shadow_step","enlightened_fist_radiant_blow","zen_master_centered_aura","bard_rapier_strike","bard_inspiration","bard_dissonant_whisper","bard_song_of_rest","bard_cutting_words","bard_healing_word","bard_shatter","bard_countercharm","bard_grand_finale","lore_bard_secrets","valor_bard_combat_inspiration","virtuoso_crescendo","war_skald_battle_hymn","monk_perfect_self","bard_jack_of_all_trades"] as const;
export const MONK_BARD_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(monkBardCoordinates.map((id,index)=>[id,{column:index%5,row:Math.floor(index/5)}]));
for (const id of monkBardCoordinates) HERO_SKILL_ICON_COORDINATES[id] = MONK_BARD_SKILL_ICON_COORDINATES[id]!;
const spellbowBulwarkCoordinates = ["spellbow_arcane_arrow","spellbow_ember_arrow","spellbow_frost_arrow","spellbow_runic_aim","spellbow_chain_arrow","spellbow_phase_step","spellbow_null_arrow","spellbow_arcane_volley","spellbow_wardpiercer","spellbow_arcane_reservoir","elemental_archer_trinity_shot","hexstalker_witchbolt","stormshot_tempest_mark","dusk_reaper_silence_arrow","spellbow_class_crest","bulwark_shield_bash","bulwark_interpose","bulwark_brace","bulwark_hold_line","bulwark_challenge","bulwark_guarded_advance","bulwark_shield_sweep","bulwark_last_bastion","bulwark_iron_rebuke","bulwark_unyielding","bastion_sanctuary_wall","vanguard_shield_rush","adamant_sentinel_immovable","ironbreaker_break_line","bulwark_class_crest"] as const;
export const SPELLBOW_BULWARK_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(spellbowBulwarkCoordinates.map((id,index)=>[id,{column:index%5,row:Math.floor(index/5)}]));
for (const id of spellbowBulwarkCoordinates) HERO_SKILL_ICON_COORDINATES[id] = SPELLBOW_BULWARK_SKILL_ICON_COORDINATES[id]!;
const summonerCoordinates = ["summoner_spirit_bolt","summoner_call_wisp","summoner_binding_ward","summoner_shared_essence","summoner_spirit_chain","summoner_planar_step","summoner_banish","summoner_twin_invocation","summoner_greater_eidolon","summoner_soul_conduit","conjurer_elemental_host","spirit_shepherd_recall","planar_binder_seal","legion_master_command","summoner_class_crest"] as const;
export const SUMMONER_SKILL_ICON_COORDINATES: Record<string, SkillIconCoordinate> = Object.fromEntries(summonerCoordinates.map((id,index)=>[id,{column:index%4,row:Math.floor(index/4)}]));
for (const id of summonerCoordinates) HERO_SKILL_ICON_COORDINATES[id] = SUMMONER_SKILL_ICON_COORDINATES[id]!;

export type SkillIconAtlasId = "hero" | "enemy" | "ashStory" | "enemyExpansionA" | "enemyExpansionB" | "frostmarchChapter3" | "shadowfenChapter4" | "greenveilChapter6" | "ironHillsChapter7" | "westernSeaChapter8" | "drownedSeventhChapter9" | "level10Mastery" | "monkBard" | "spellbowBulwark" | "summoner";

export function getSkillIconArt(skillId: string): SkillIconCoordinate & { atlas: SkillIconAtlasId } {
  const summoner = SUMMONER_SKILL_ICON_COORDINATES[skillId]; if (summoner) return { ...summoner, atlas: "summoner" };
  const spellbowBulwark = SPELLBOW_BULWARK_SKILL_ICON_COORDINATES[skillId]; if (spellbowBulwark) return { ...spellbowBulwark, atlas: "spellbowBulwark" };
  const monkBard = MONK_BARD_SKILL_ICON_COORDINATES[skillId]; if (monkBard) return { ...monkBard, atlas: "monkBard" };
  const mastery = LEVEL_10_MASTERY_SKILL_ICON_COORDINATES[skillId]; if (mastery) return { ...mastery, atlas: "level10Mastery" };
  const authored = HERO_SKILL_ICON_COORDINATES[skillId]; if (authored) return { ...authored, atlas: "hero" };
  const enemy = ENEMY_SKILL_ICON_COORDINATES[skillId]; if (enemy) return { ...enemy, atlas: "enemy" };
  const ashStory = ASH_STORY_SKILL_ICON_COORDINATES[skillId]; if (ashStory) return { ...ashStory, atlas: "ashStory" };
  const frost = FROSTMARCH_CHAPTER_3_SKILL_ICON_COORDINATES[skillId]; if (frost) return { ...frost, atlas: "frostmarchChapter3" };
  const shadowfen = SHADOWFEN_CHAPTER_4_SKILL_ICON_COORDINATES[skillId]; if (shadowfen) return { ...shadowfen, atlas: "shadowfenChapter4" };
  const greenveil = GREENVEIL_CHAPTER_6_SKILL_ICON_COORDINATES[skillId]; if (greenveil) return { ...greenveil, atlas: "greenveilChapter6" };
  const ironHills = IRON_HILLS_CHAPTER_7_SKILL_ICON_COORDINATES[skillId]; if (ironHills) return { ...ironHills, atlas: "ironHillsChapter7" };
  const westernSea = WESTERN_SEA_CHAPTER_8_SKILL_ICON_COORDINATES[skillId]; if (westernSea) return { ...westernSea, atlas: "westernSeaChapter8" };
  const drownedSeventh = DROWNED_SEVENTH_CHAPTER_9_SKILL_ICON_COORDINATES[skillId]; if (drownedSeventh) return { ...drownedSeventh, atlas: "drownedSeventhChapter9" };
  const enemyExpansionA = ENEMY_SKILL_EXPANSION_A_COORDINATES[skillId]; if (enemyExpansionA) return { ...enemyExpansionA, atlas: "enemyExpansionA" };
  const enemyExpansionB = ENEMY_SKILL_EXPANSION_B_COORDINATES[skillId]; if (enemyExpansionB) return { ...enemyExpansionB, atlas: "enemyExpansionB" };
  let hash = 0;
  for (let index = 0; index < skillId.length; index += 1) hash = (hash * 31 + skillId.charCodeAt(index)) >>> 0;
  const cell = hash % 36;
  return { column: cell % 6, row: Math.floor(cell / 6), atlas: "enemy" };
}

export function getSkillIconCoordinate(skillId: string): SkillIconCoordinate { const { column, row } = getSkillIconArt(skillId); return { column, row }; }
