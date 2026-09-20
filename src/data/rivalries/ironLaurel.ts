import type { RivalCharacterDefinition, RivalGuildDefinition, RivalryEncounterDefinition } from "../../game/rivalries/rivalryTypes";

export const IRON_LAUREL_CHARACTERS: Record<string, RivalCharacterDefinition> = {
  cassian_vane: { id: "cassian_vane", name: "Cassian Vane", title: "Guildmaster of the Iron Laurel", raceId: "human", classId: "paladin", level: 14, combatRole: "Commander and defensive duelist", personality: "Polished, calculating, and convinced that a guild's reputation matters more than any replaceable recruit." },
  serah_kaine: { id: "serah_kaine", name: "Serah Kaine", title: "First Laurel", raceId: "human", classId: "warrior", level: 11, combatRole: "Frontline champion", personality: "A disciplined tournament victor who openly mocks unproven guilds, but respects strength demonstrated without excuses." },
  thalen_quill: { id: "thalen_quill", name: "Thalen Quill", title: "Laurel Arcanist", raceId: "elf", classId: "mage", level: 10, combatRole: "Battlefield controller", personality: "An observant spellcaster who suspects Cassian's version of the Blackbridge disaster is incomplete." },
  brunna_stonehand: { id: "brunna_stonehand", name: "Brunna Stonehand", title: "Laurel Shield", raceId: "dwarf", classId: "cleric", level: 10, combatRole: "Armored healer", personality: "Gruff and loyal to the Laurel's rank-and-file members rather than its leadership." },
};

export const IRON_LAUREL_RIVALRY_ENCOUNTERS: Record<string, RivalryEncounterDefinition> = {
  guildhaven_yard_duel: { id: "guildhaven_yard_duel", name: "Challenge in the Guildhaven Yard", chapter: 2, mode: "nonlethal_duel", opponentCharacterIds: ["serah_kaine"], recommendedLevelMin: 6, recommendedLevelMax: 8, unlockFlag: "iron_laurel_yard_challenge", narrativePurpose: "The player's chosen champion can earn public respect in a controlled hero-versus-hero duel." },
  laurels_trial: { id: "laurels_trial", name: "The Laurel's Trial", chapter: 3, mode: "guild_battle", opponentCharacterIds: ["serah_kaine", "thalen_quill", "brunna_stonehand"], recommendedLevelMin: 9, recommendedLevelMax: 11, unlockFlag: "iron_laurel_team_challenge", narrativePurpose: "A nonlethal team battle tests whether the player's guild has grown beyond a promising local company." },
  blackbridge_reckoning: { id: "blackbridge_reckoning", name: "Blackbridge Reckoning", chapter: 4, mode: "guild_battle", opponentCharacterIds: ["cassian_vane", "serah_kaine", "thalen_quill", "brunna_stonehand"], recommendedLevelMin: 12, recommendedLevelMax: 14, unlockFlag: "blackbridge_truth_revealed", narrativePurpose: "The rivalry culminates when the truth behind the abandoned recruits becomes public." },
};

export const IRON_LAUREL: RivalGuildDefinition = {
  id: "iron_laurel",
  name: "The Iron Laurel",
  motto: "Victory is the only testimony.",
  homeCity: "Highcourt",
  startingReputation: 80,
  leaderCharacterId: "cassian_vane",
  championCharacterId: "serah_kaine",
  characterIds: ["cassian_vane", "serah_kaine", "thalen_quill", "brunna_stonehand"],
  description: "A wealthy, decorated guild that claims prestigious contracts and treats smaller companies as disposable competition. The player once managed its contracts before leaving over the Blackbridge disaster.",
  rivalryEncounterIds: ["guildhaven_yard_duel", "laurels_trial", "blackbridge_reckoning"],
};
