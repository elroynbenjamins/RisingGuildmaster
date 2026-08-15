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

export type SkillIconAtlasId = "hero" | "enemy" | "ashStory" | "enemyExpansionA" | "enemyExpansionB";

export function getSkillIconArt(skillId: string): SkillIconCoordinate & { atlas: SkillIconAtlasId } {
  const authored = HERO_SKILL_ICON_COORDINATES[skillId]; if (authored) return { ...authored, atlas: "hero" };
  const enemy = ENEMY_SKILL_ICON_COORDINATES[skillId]; if (enemy) return { ...enemy, atlas: "enemy" };
  const ashStory = ASH_STORY_SKILL_ICON_COORDINATES[skillId]; if (ashStory) return { ...ashStory, atlas: "ashStory" };
  const enemyExpansionA = ENEMY_SKILL_EXPANSION_A_COORDINATES[skillId]; if (enemyExpansionA) return { ...enemyExpansionA, atlas: "enemyExpansionA" };
  const enemyExpansionB = ENEMY_SKILL_EXPANSION_B_COORDINATES[skillId]; if (enemyExpansionB) return { ...enemyExpansionB, atlas: "enemyExpansionB" };
  let hash = 0;
  for (let index = 0; index < skillId.length; index += 1) hash = (hash * 31 + skillId.charCodeAt(index)) >>> 0;
  const cell = hash % 36;
  return { column: cell % 6, row: Math.floor(cell / 6), atlas: "enemy" };
}

export function getSkillIconCoordinate(skillId: string): SkillIconCoordinate { const { column, row } = getSkillIconArt(skillId); return { column, row }; }
