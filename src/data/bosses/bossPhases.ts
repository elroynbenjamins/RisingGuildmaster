import type { BossPhaseDefinition } from "../../game/bosses/bossMechanicTypes";

const permanent = (stat: string, value: number) => ({ stat, operation: "percentage" as const, value, durationTurns: -1 });
const timedFlat = (stat: string, value: number, durationTurns: number) => ({ stat, operation: "flat" as const, value, durationTurns });
const timedPercent = (stat: string, value: number, durationTurns: number) => ({ stat, operation: "percentage" as const, value, durationTurns });

/**
 * Boss phases are deliberately compact.  Standard bosses get a memorable
 * reinforcement, pressure spike, short debuff or recovery moment; Raid bosses
 * keep the larger multi-squad objective/hazard language in /data/raids.
 */
export const BOSS_PHASES: Record<string, BossPhaseDefinition> = {
  chieftain_rallies_last_scouts: {
    id: "chieftain_rallies_last_scouts", bossEnemyDefinitionId: "goblin_chieftain", hpRatioAtMost: .55,
    name: "Rally the Warband", announcement: "The Chieftain blows a jagged horn and a last scout vaults into the warfront.",
    playerHint: "The reinforcement is fragile. Remove it quickly or keep pressure on the Chieftain before his command aura matters.",
    summonGroups: [{ enemyDefinitionId: "goblin_scout", count: 1 }], selfModifiers: [],
  },
  chieftain_last_stand: {
    id: "chieftain_last_stand", bossEnemyDefinitionId: "goblin_chieftain", hpRatioAtMost: .25,
    name: "Chieftain's Last Stand", announcement: "Cornered beside the broken Wardstone, the Chieftain abandons command for a desperate charge.",
    playerHint: "His personal strikes are stronger now. Protect weakened heroes and finish the fight rather than spreading damage.",
    summonGroups: [], selfModifiers: [permanent("physicalDamage", .10), permanent("speed", .05)],
  },

  queen_brood_stirs: {
    id: "queen_brood_stirs", bossEnemyDefinitionId: "spider_queen", hpRatioAtMost: .75,
    name: "The Brood Stirs", announcement: "The brood sacs rupture—spiderlings flood the sanctum.",
    playerHint: "Clear the new spiderlings before the Queen's Brood Matriarch aura turns them into real damage pressure.",
    summonGroups: [{ enemyDefinitionId: "spiderling_swarm", count: 2 }], selfModifiers: [],
  },
  queen_webguard: {
    id: "queen_webguard", bossEnemyDefinitionId: "spider_queen", hpRatioAtMost: .50,
    name: "Webguard", announcement: "A Webspinner descends to shield its wounded queen.",
    playerHint: "The Webspinner can disrupt positioning. Decide whether to remove it or commit cooldowns to the Queen.",
    summonGroups: [{ enemyDefinitionId: "webspinner", count: 1 }], selfModifiers: [],
  },
  queen_last_brood: {
    id: "queen_last_brood", bossEnemyDefinitionId: "spider_queen", hpRatioAtMost: .25,
    name: "Last Brood", announcement: "The Spider Queen abandons the brood and attacks with desperate fury.",
    playerHint: "Her existing Maternal Frenzy is now active. Keep injured heroes out of melee reach and end the fight cleanly.",
    summonGroups: [], selfModifiers: [],
  },

  ghorak_breaks_chain: {
    id: "ghorak_breaks_chain", bossEnemyDefinitionId: "ghorak_chainbreaker", hpRatioAtMost: .50,
    name: "The Last Chain Breaks", announcement: "Ghorak tears away his final binding chain; an orc raider answers the roar from the liftworks.",
    playerHint: "Ghorak's Unbound Fury is active below half health. Control the reinforcement without letting your backline become isolated.",
    summonGroups: [{ enemyDefinitionId: "orc_raider", count: 1 }], selfModifiers: [], heroModifiers: [timedFlat("attackRollModifier", -1, 1)],
  },

  warden_calls_sentries: {
    id: "warden_calls_sentries", bossEnemyDefinitionId: "hollow_warden", hpRatioAtMost: .75,
    name: "Forge Sentries", announcement: "The forge answers the Warden: two iron sentries rise from their alcoves.",
    playerHint: "The Warden is extremely durable. Remove the sentries if they are pinning your damage dealers, then refocus the core.",
    summonGroups: [{ enemyDefinitionId: "ironbound_sentry", count: 2 }], selfModifiers: [],
  },
  warden_releases_wisps: {
    id: "warden_releases_wisps", bossEnemyDefinitionId: "hollow_warden", hpRatioAtMost: .50,
    name: "Ward-Shell Fracture", announcement: "Cracks spread across the ward-shell and living shards spill into the chamber.",
    playerHint: "Wardstone Wisps add ranged magic pressure. Keep your formation from being surrounded while the Warden's protocol escalates.",
    summonGroups: [{ enemyDefinitionId: "wardstone_wisp", count: 2 }], selfModifiers: [],
  },
  warden_final_judgment: {
    id: "warden_final_judgment", bossEnemyDefinitionId: "hollow_warden", hpRatioAtMost: .25,
    name: "Final Judgment", announcement: "The Hollow Warden abandons restraint and declares every living soul condemned.",
    playerHint: "Judgment Protocol is fully active. Spend remaining resources and finish the Warden before attrition wins.",
    summonGroups: [], selfModifiers: [], heroPulseDamageMaxHpRatio: .04,
  },

  hroth_blue_horn_answered: {
    id: "hroth_blue_horn_answered", bossEnemyDefinitionId: "hroth_iceblood", hpRatioAtMost: .60,
    name: "Blue Horn Answered", announcement: "Hroth's horn booms across the broken gate and a Rimefang wolf crashes through the snow.",
    playerHint: "The wolf is fast and can punish your backline. Keep a protector between it and fragile heroes.",
    summonGroups: [{ enemyDefinitionId: "rimefang_wolf", count: 1 }], selfModifiers: [],
  },
  hroth_whiteout_rage: {
    id: "hroth_whiteout_rage", bossEnemyDefinitionId: "hroth_iceblood", hpRatioAtMost: .30,
    name: "Whiteout Rage", announcement: "Hroth smashes the Blue Horn into the ice; the shock throws frozen splinters across the line.",
    playerHint: "The party takes a small burst of unavoidable pressure while Iceblood Fury is active. Stabilize before trading blows.",
    summonGroups: [], selfModifiers: [], heroPulseDamageMaxHpRatio: .05,
  },

  vaelith_pale_wind: {
    id: "vaelith_pale_wind", bossEnemyDefinitionId: "vaelith_pale_echo", hpRatioAtMost: .65,
    name: "Pale Wind", announcement: "The Echo tears open a false winter and the battlefield stiffens under spectral frost.",
    playerHint: "Movement is briefly reduced. Avoid overcommitting melee heroes until the frost pressure passes.",
    summonGroups: [], selfModifiers: [], heroModifiers: [timedFlat("movementRange", -1, 1)],
  },
  vaelith_crown_echo: {
    id: "vaelith_crown_echo", bossEnemyDefinitionId: "vaelith_pale_echo", hpRatioAtMost: .30,
    name: "Crown Echo", announcement: "A second voice answers from inside Vaelith's reflection and the air fractures with cold light.",
    playerHint: "The Echo's final passive bonuses are active. Keep magic-defense specialists standing and commit your strongest attacks.",
    summonGroups: [], selfModifiers: [], heroPulseDamageMaxHpRatio: .05,
  },

  bell_widow_funeral_chorus: {
    id: "bell_widow_funeral_chorus", bossEnemyDefinitionId: "bell_widow", hpRatioAtMost: .55,
    name: "Funeral Chorus", announcement: "The stolen bell answers itself and another Gravewater Hexer rises with the chorus.",
    playerHint: "Silence the Hexer if its debuffs are compounding the Widow's Funeral Toll; otherwise race the boss before the chorus grows.",
    summonGroups: [{ enemyDefinitionId: "gravewater_hexer", count: 1 }], selfModifiers: [],
  },
  bell_widow_stolen_voices: {
    id: "bell_widow_stolen_voices", bossEnemyDefinitionId: "bell_widow", hpRatioAtMost: .25,
    name: "Stolen Voices", announcement: "The Bell Widow drinks the last voices trapped in the bronze and stitches herself together.",
    playerHint: "She restores a small amount of health once. Do not panic—her final Refrain is dangerous, but the recovery is not repeatable.",
    summonGroups: [], selfModifiers: [], bossHealMaxHpRatio: .07,
  },

  morrowveil_redacts_company: {
    id: "morrowveil_redacts_company", bossEnemyDefinitionId: "morrowveil_archivist", hpRatioAtMost: .66,
    name: "Redact the Company", announcement: "Morrowveil crosses the guild's names from a drowned ledger; certainty slips from every strike.",
    playerHint: "Attack rolls are briefly reduced. Use reliable buffs, healing, or positioning while the redaction fades.",
    summonGroups: [], selfModifiers: [], heroModifiers: [timedFlat("attackRollModifier", -1, 2)],
  },
  morrowveil_last_annotation: {
    id: "morrowveil_last_annotation", bossEnemyDefinitionId: "morrowveil_archivist", hpRatioAtMost: .33,
    name: "Last Annotation", announcement: "A drowned legionnaire crawls from between the shelves as Morrowveil opens the archive's final page.",
    playerHint: "The Archivist's low-health magic bonuses are active. Do not let the new frontline keep your damage away from Morrowveil for long.",
    summonGroups: [{ enemyDefinitionId: "drowned_legionnaire", count: 1 }], selfModifiers: [],
  },

  keeper_brand_recoils: {
    id: "keeper_brand_recoils", bossEnemyDefinitionId: "cinder_keeper", hpRatioAtMost: .50,
    name: "Brand Recoil", announcement: "The command brand tears against the Keeper's older oath and releases a wave of stored wardfire.",
    playerHint: "The Keeper repairs a small amount of damage once. Preserve cooldowns for the second half instead of treating the heal as a reset.",
    summonGroups: [], selfModifiers: [], bossHealMaxHpRatio: .06,
  },
  keeper_sleeping_ember_wakes: {
    id: "keeper_sleeping_ember_wakes", bossEnemyDefinitionId: "cinder_keeper", hpRatioAtMost: .25,
    name: "Sleeping Ember", announcement: "The memory core burns through the brand and the Keeper's wardfire surges uncontrolled.",
    playerHint: "Its low-health damage passive is active. Finish quickly while keeping anyone already injured out of the center line.",
    summonGroups: [], selfModifiers: [], heroPulseDamageMaxHpRatio: .04,
  },

  solkar_calls_the_scale: {
    id: "solkar_calls_the_scale", bossEnemyDefinitionId: "solkar_ash_herald", hpRatioAtMost: .60,
    name: "Call of the Scale", announcement: "Solkar calls an Ashbound Sentinel from the violet hearth and orders it to weigh the guild's worth.",
    playerHint: "The Sentinel can stall melee access. Remove it if it blocks your route; otherwise keep burst damage on Solkar.",
    summonGroups: [{ enemyDefinitionId: "ashbound_sentinel", count: 1 }], selfModifiers: [],
  },
  solkar_sentence_of_ash: {
    id: "solkar_sentence_of_ash", bossEnemyDefinitionId: "solkar_ash_herald", hpRatioAtMost: .30,
    name: "Sentence of Ash", announcement: "The purple hearth answers Solkar's verdict and a ring of cinders explodes through the company.",
    playerHint: "Everyone takes a small burst as the final damage phase begins. Heal once, then commit your remaining resources.",
    summonGroups: [], selfModifiers: [], heroPulseDamageMaxHpRatio: .06,
  },

  cassian_crown_decree: {
    id: "cassian_crown_decree", bossEnemyDefinitionId: "cassian_vane", hpRatioAtMost: .60,
    name: "Crown Decree", announcement: "Cassian speaks with two voices and the guild's orders suddenly feel uncertain.",
    playerHint: "Attack rolls are briefly reduced while Perfected Authority begins. Defensive or support actions lose less value during this window.",
    summonGroups: [], selfModifiers: [], heroModifiers: [timedFlat("attackRollModifier", -1, 2)],
  },
  cassian_perfected_authority: {
    id: "cassian_perfected_authority", bossEnemyDefinitionId: "cassian_vane", hpRatioAtMost: .30,
    name: "Perfected Authority", announcement: "A Lying Crown Echo peels away from Cassian's shadow and takes up his discarded command.",
    playerHint: "The new Echo adds control while Cassian reaches full phase power. Keep the party together and focus a clear kill target.",
    summonGroups: [{ enemyDefinitionId: "lying_crown_echo", count: 1 }], selfModifiers: [],
  },

  varkesh_beacon_rekindled: {
    id: "varkesh_beacon_rekindled", bossEnemyDefinitionId: "varkesh_gilded_rupture", hpRatioAtMost: .60,
    name: "Beacon Rekindled", announcement: "Varkesh tears open a brass seam and a Crown Beacon reignites beside the platform.",
    playerHint: "The Beacon strengthens construct allies. Destroy it if the aura is amplifying Varkesh's pressure too far.",
    summonGroups: [{ enemyDefinitionId: "crown_beacon", count: 1 }], selfModifiers: [],
  },
  varkesh_storm_rupture: {
    id: "varkesh_storm_rupture", bossEnemyDefinitionId: "varkesh_gilded_rupture", hpRatioAtMost: .30,
    name: "Storm Rupture", announcement: "Gold seams split across Varkesh's frame and stored stormlight detonates over the company.",
    playerHint: "The final passive phase is active after a small party-wide burst. Mobility and fast healing matter more than attrition now.",
    summonGroups: [], selfModifiers: [], heroPulseDamageMaxHpRatio: .06,
  },

  nhal_calls_last_oath: {
    id: "nhal_calls_last_oath", bossEnemyDefinitionId: "admiral_nhal_veyr", hpRatioAtMost: .60,
    name: "The Last Oath", announcement: "Nhal raises the drowned standard and an Oath-Eater climbs onto the quarterdeck.",
    playerHint: "The add can punish a split formation. Keep your frontline coherent while the Admiral's Last Flag passive comes online.",
    summonGroups: [{ enemyDefinitionId: "oath_eater", count: 1 }], selfModifiers: [],
  },
  nhal_no_harbor: {
    id: "nhal_no_harbor", bossEnemyDefinitionId: "admiral_nhal_veyr", hpRatioAtMost: .30,
    name: "No Harbor", announcement: "The quarterdeck pitches beneath black water and every safe route narrows for a heartbeat.",
    playerHint: "Movement is briefly reduced while Nhal reaches maximum phase power. Do not chase if a safer ranged or support action is available.",
    summonGroups: [], selfModifiers: [], heroModifiers: [timedFlat("movementRange", -1, 1)],
  },

  serekh_redraws_names: {
    id: "serekh_redraws_names", bossEnemyDefinitionId: "serekh_chartmaker", hpRatioAtMost: .65,
    name: "Redraw the Names", announcement: "Serekh draws a line through the guild's formation and the map insists everyone stands somewhere else.",
    playerHint: "Attack accuracy and movement are briefly impaired. Use the turn to regroup, heal, or take only high-confidence attacks.",
    summonGroups: [], selfModifiers: [], heroModifiers: [timedFlat("attackRollModifier", -1, 1), timedFlat("movementRange", -1, 1)],
  },
  serekh_below_the_chart: {
    id: "serekh_below_the_chart", bossEnemyDefinitionId: "serekh_chartmaker", hpRatioAtMost: .30,
    name: "Below the Chart", announcement: "An Abyssal Lanternbearer rises at Serekh's mark as the platform remembers the sea below it.",
    playerHint: "Remove the Lanternbearer only if its support will cost more turns than it saves Serekh. The boss is now in his finishing phase.",
    summonGroups: [{ enemyDefinitionId: "abyssal_lanternbearer", count: 1 }], selfModifiers: [], heroPulseDamageMaxHpRatio: .05,
  },

  serpent_coils_tighten: {
    id: "serpent_coils_tighten", bossEnemyDefinitionId: "great_forest_serpent", hpRatioAtMost: .50,
    name: "Coils Tighten", announcement: "The great serpent crashes through the drowned roots and a giant spider is shaken from the canopy.",
    playerHint: "Coiled Fury is active. Keep wounded heroes out of constrict range and avoid letting the new spider surround your support.",
    summonGroups: [{ enemyDefinitionId: "giant_spider", count: 1 }], selfModifiers: [],
  },
  crocodile_death_roll: {
    id: "crocodile_death_roll", bossEnemyDefinitionId: "sewer_crocodile", hpRatioAtMost: .50,
    name: "Floodgate Death Roll", announcement: "The ancient crocodile churns the cistern into a violent whirl and plates of old scale lock together.",
    playerHint: "Its physical defense rises slightly. Magic damage and attacks on already weakened targets are the best way to close the hunt.",
    summonGroups: [], selfModifiers: [permanent("physicalDefense", .10)],
  },
  yeti_whiteout_break: {
    id: "yeti_whiteout_break", bossEnemyDefinitionId: "frostmarch_yeti", hpRatioAtMost: .50,
    name: "Whiteout Break", announcement: "The White Maw's roar knocks ice from the cavern roof and a Frost Wisp condenses in the storm.",
    playerHint: "The Wisp adds ranged pressure while Whiteout Fury approaches. Eliminate it if your backline cannot absorb another attacker.",
    summonGroups: [{ enemyDefinitionId: "frost_wisp", count: 1 }], selfModifiers: [],
  },
  yeti_last_hunt: {
    id: "yeti_last_hunt", bossEnemyDefinitionId: "frostmarch_yeti", hpRatioAtMost: .25,
    name: "The Last Hunt", announcement: "The White Maw lowers its head and hunts through the storm without hesitation.",
    playerHint: "Movement is briefly reduced just as its fury peaks. Protect injured heroes and finish with ranged damage if necessary.",
    summonGroups: [], selfModifiers: [], heroModifiers: [timedFlat("movementRange", -1, 1), timedPercent("speed", -.08, 1)],
  },
};
