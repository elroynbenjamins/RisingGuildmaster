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

export type SkillIconAtlasId = "hero" | "enemy" | "ashStory";

export function getSkillIconArt(skillId: string): SkillIconCoordinate & { atlas: SkillIconAtlasId } {
  const authored = HERO_SKILL_ICON_COORDINATES[skillId]; if (authored) return { ...authored, atlas: "hero" };
  const enemy = ENEMY_SKILL_ICON_COORDINATES[skillId]; if (enemy) return { ...enemy, atlas: "enemy" };
  const ashStory = ASH_STORY_SKILL_ICON_COORDINATES[skillId]; if (ashStory) return { ...ashStory, atlas: "ashStory" };
  let hash = 0;
  for (let index = 0; index < skillId.length; index += 1) hash = (hash * 31 + skillId.charCodeAt(index)) >>> 0;
  const cell = hash % 36;
  return { column: cell % 6, row: Math.floor(cell / 6), atlas: "enemy" };
}

export function getSkillIconCoordinate(skillId: string): SkillIconCoordinate { const { column, row } = getSkillIconArt(skillId); return { column, row }; }
