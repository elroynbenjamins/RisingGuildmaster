import type { Modifier, ModifierOperation, ModifierTarget } from "../../game/modifiers/types";
import type { MasteryDefinition } from "../../game/progression/masteries/masteryTypes";
export const MASTERY_LEVEL = 10;
const mod = (sourceId: string, target: ModifierTarget, operation: ModifierOperation, value: number): Modifier => ({ source: "subclass", sourceId, target, operation, value });
const define = (id: string, name: string, baseClassId: MasteryDefinition["baseClassId"], skillId: string, description: string, modifiers: Modifier[] = []): MasteryDefinition => ({ id, name, baseClassId, levelRequirement: MASTERY_LEVEL, addedSkillIds: [skillId], modifiers, description });
export const MASTERIES: Record<string, MasteryDefinition> = {
  vanguard: define("vanguard", "Vanguard", "warrior", "vanguard_rallying_advance", "A mobile protector who advances the whole battle line."),
  warmaster: define("warmaster", "Warmaster", "warrior", "warmaster_battle_standard", "A battlefield commander whose standard sharpens allied attacks."),
  pathfinder: define("pathfinder", "Pathfinder", "ranger", "pathfinder_trailblazer", "A terrain expert who opens routes for nearby allies."),
  huntmaster: define("huntmaster", "Huntmaster", "ranger", "huntmaster_marked_quarry", "A relentless tracker who exposes one priority target."),
  high_arcanist: define("high_arcanist", "High Arcanist", "mage", "high_arcanist_confluence", "A disciplined mage who stabilizes and amplifies nearby magic."),
  warcaster: define("warcaster", "Warcaster", "mage", "warcaster_overchannel", "A dangerous battle mage who trades vitality for overwhelming power."),
  beacon: define("beacon", "Beacon", "cleric", "beacon_consecrated_presence", "A living sanctuary whose presence strengthens recovery."),
  exorcist: define("exorcist", "Exorcist", "cleric", "exorcist_banish_corruption", "A hunter of curses, constructs and restless dead."),
  crusader: define("crusader", "Crusader", "paladin", "crusader_radiant_challenge", "A radiant duelist who forces dangerous foes to answer them."),
  oathkeeper: define("oathkeeper", "Oathkeeper", "paladin", "oathkeeper_steadfast_oath", "A steadfast anchor against hostile steel and sorcery."),
  ravager: define("ravager", "Ravager", "berserker", "ravager_rending_sweep", "A close-range destroyer who leaves whole formations bleeding."),
  totem_bearer: define("totem_bearer", "Totem Bearer", "berserker", "totem_bearer_war_totem", "A primal standard-bearer who drives allies into a war frenzy.")
  ,enlightened_fist: define("enlightened_fist", "Enlightened Fist", "monk", "enlightened_fist_radiant_blow", "A transcendent striker who channels inner focus as radiant force."),
  zen_master: define("zen_master", "Zen Master", "monk", "zen_master_centered_aura", "A calm battlefield anchor whose presence steadies nearby minds."),
  virtuoso: define("virtuoso", "Virtuoso", "bard", "virtuoso_crescendo", "A peerless performer whose sustained rhythm sharpens every ally."),
  war_skald: define("war_skald", "War Skald", "bard", "war_skald_battle_hymn", "A martial storyteller who makes the party's courage louder than fear.")
  ,stormshot: define("stormshot", "Stormshot", "spellbow", "stormshot_tempest_mark", "An elemental commander whose charged arrows amplify nearby spellcraft."),
  dusk_reaper: define("dusk_reaper", "Dusk Reaper", "spellbow", "dusk_reaper_silence_arrow", "A relentless arcane hunter who severs enemy magic before the final shot."),
  adamant_sentinel: define("adamant_sentinel", "Adamant Sentinel", "bulwark", "adamant_sentinel_immovable", "A living fortress who makes the entire shield line harder to break."),
  ironbreaker: define("ironbreaker", "Ironbreaker", "bulwark", "ironbreaker_break_line", "A formation breaker who turns defense into violent battlefield control."),
  planar_binder: define("planar_binder", "Planar Binder", "summoner", "planar_binder_seal", "A ward-master who closes hostile crossings and imprisons dangerous outsiders."),
  legion_master: define("legion_master", "Legion Master", "summoner", "legion_master_command", "A commander who coordinates mortal allies and bound spirits as one host.")
};
export const ADVANCED_CLASS_NAMES: Record<string, string> = {
  "guardian:vanguard":"Bastion Marshal", "guardian:warmaster":"Shieldlord", "battlemage_commander:vanguard":"Arcane Vanguard", "battlemage_commander:warmaster":"Runebound General",
  "sharpshooter:pathfinder":"Farstrider", "sharpshooter:huntmaster":"Deathmark Sniper", "beastmaster:pathfinder":"Wildroad Warden", "beastmaster:huntmaster":"Packlord",
  "pyromancer:high_arcanist":"Ember Sage", "pyromancer:warcaster":"Siege Pyromancer", "cryomancer:high_arcanist":"Winter Sage", "cryomancer:warcaster":"Glacial Warcaster",
  "life_priest:beacon":"Saint of Renewal", "life_priest:exorcist":"Mercy Inquisitor", "oracle:beacon":"Star-Seer", "oracle:exorcist":"Fatebreaker",
  "templar:crusader":"Dawn Bastion", "templar:oathkeeper":"Iron Saint", "hexbreaker:crusader":"Spellbane Justiciar", "hexbreaker:oathkeeper":"Nullwarden",
  "bloodreaver:ravager":"Crimson Reaver", "bloodreaver:totem_bearer":"Blood-Totem Champion", "juggernaut:ravager":"Siegebreaker", "juggernaut:totem_bearer":"Stonehide Chieftain",
  "open_hand:enlightened_fist":"Sun-Soul Ascendant", "open_hand:zen_master":"Perfect Hand", "shadow_monk:enlightened_fist":"Eclipsed Fist", "shadow_monk:zen_master":"Silent Sage",
  "college_of_lore:virtuoso":"Mythweaver", "college_of_lore:war_skald":"Saga Keeper", "college_of_valor:virtuoso":"Heroic Maestro", "college_of_valor:war_skald":"War-Chorus Marshal"
  ,"elemental_archer:stormshot":"Tempest Arcstrider", "elemental_archer:dusk_reaper":"Ashen Witchbow", "hexstalker:stormshot":"Runestorm Hunter", "hexstalker:dusk_reaper":"Twilight Spellreaver",
  "bastion:adamant_sentinel":"Adamant Oathwall", "bastion:ironbreaker":"Siege Bastion", "shield_vanguard:adamant_sentinel":"Ironroad Marshal", "shield_vanguard:ironbreaker":"Shieldquake Commander",
  "conjurer:planar_binder":"Rift Architect", "conjurer:legion_master":"Elemental Hostlord", "spirit_shepherd:planar_binder":"Veilwarden", "spirit_shepherd:legion_master":"Eidolon Marshal"
};
