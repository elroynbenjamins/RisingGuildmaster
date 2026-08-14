export type NpcGender = "female" | "male";
export type NpcPortraitAtlasId = "storyCast" | "archetypes" | "regionalCast" | "settlementCast" | "questCast" | "hiddenPowers";

export interface NpcPortraitDefinition {
  id: string;
  name: string;
  gender: NpcGender;
  atlasId: NpcPortraitAtlasId;
  column: 0 | 1 | 2 | 3;
  row: 0 | 1 | 2;
  role: string;
}

const portrait = (id: string, name: string, gender: NpcGender, atlasId: NpcPortraitAtlasId, column: 0 | 1 | 2 | 3, row: 0 | 1 | 2, role: string): NpcPortraitDefinition => ({ id, name, gender, atlasId, column, row, role });

const entries: NpcPortraitDefinition[] = [
  portrait("cassian_vane", "Cassian Vane", "male", "storyCast", 0, 0, "Iron Laurel guildmaster"),
  portrait("registrar_mara_voss", "Registrar Mara Voss", "female", "storyCast", 1, 0, "Guildhaven registrar"),
  portrait("keeper_dagna_flint", "Keeper Dagna Flint", "female", "storyCast", 2, 0, "Stonegate ward-smith"),
  portrait("surveyor_bruni_vale", "Surveyor Bruni Vale", "female", "storyCast", 3, 0, "Iron Hills surveyor"),
  portrait("aldren_vale", "Aldren Vale", "male", "storyCast", 0, 1, "Merchant"),
  portrait("mira_thorn", "Mira Thorn", "female", "storyCast", 1, 1, "Caravan guard"),
  portrait("bellkeeper_ysra_venn", "Bellkeeper Ysra Venn", "female", "storyCast", 2, 1, "Shadowfen bellkeeper"),
  portrait("warden_elowen", "Warden Elowen", "female", "storyCast", 3, 1, "Retired Greenveil warden"),
  portrait("sister_maelin", "Sister Maelin", "female", "storyCast", 0, 2, "Temple archivist"),
  portrait("ilyra_silverbough", "Ilyra of Silverbough", "female", "storyCast", 1, 2, "Memory-keeper"),
  portrait("master_veyr", "Master Veyr", "male", "storyCast", 2, 2, "Relic broker"),
  portrait("tomas_reed", "Tomas Reed", "male", "storyCast", 3, 2, "Blackbridge survivor"),

  portrait("blacksmith_veteran", "Veteran Blacksmith", "male", "archetypes", 0, 0, "Blacksmith"),
  portrait("tailor_artisan", "Elven Tailor", "female", "archetypes", 1, 0, "Tailor"),
  portrait("jeweler_enchanter", "Jeweler-Enchanter", "male", "archetypes", 2, 0, "Jeweler"),
  portrait("temple_healer", "Temple Healer", "female", "archetypes", 3, 0, "Healer"),
  portrait("tavern_keeper", "Dwarven Tavern Keeper", "female", "archetypes", 0, 1, "Innkeeper"),
  portrait("guild_scout", "Elven Guild Scout", "male", "archetypes", 1, 1, "Scout"),
  portrait("town_guard_captain", "Town Guard Captain", "female", "archetypes", 2, 1, "Guard captain"),
  portrait("greenveil_farmer", "Greenveil Farmer", "male", "archetypes", 3, 1, "Farmer"),
  portrait("clanroad_hearth_speaker", "Clanroad Hearth-Speaker", "female", "archetypes", 0, 2, "Hearth-speaker"),
  portrait("orc_traveling_merchant", "Orc Traveling Merchant", "male", "archetypes", 1, 2, "Merchant"),
  portrait("traveling_scholar", "Elven Traveling Scholar", "female", "archetypes", 2, 2, "Scholar"),
  portrait("road_pilgrim", "Dwarven Road Pilgrim", "male", "archetypes", 3, 2, "Pilgrim"),

  portrait("serah_kaine", "Serah Kaine", "female", "regionalCast", 0, 0, "First Laurel"),
  portrait("thalen_quill", "Thalen Quill", "male", "regionalCast", 1, 0, "Laurel arcanist"),
  portrait("brunna_stonehand", "Brunna Stonehand", "female", "regionalCast", 2, 0, "Laurel shield"),
  portrait("master_halric_vale", "Master Halric Vale", "male", "regionalCast", 3, 0, "Schoolmaster"),
  portrait("old_fenrick", "Old Fenrick", "male", "regionalCast", 0, 1, "Ferryman"),
  portrait("nikkit_two_knives", "Nikkit Two-Knives", "male", "regionalCast", 1, 1, "Goblin pathfinder"),
  portrait("borin_slate", "Borin Slate", "male", "regionalCast", 2, 1, "Lift-master"),
  portrait("bellkeeper_osa", "Bellkeeper Osa", "female", "regionalCast", 3, 1, "Blackwater watchkeeper"),
  portrait("ranger_sella_north", "Ranger Sella North", "female", "regionalCast", 0, 2, "Frostmarch ranger"),
  portrait("iron_laurel_envoy", "Iron Laurel Envoy", "male", "regionalCast", 1, 2, "Guild envoy"),
  portrait("ghorak_ash_ear", "Ghorak Ash-Ear", "male", "regionalCast", 2, 2, "Hearth-speaker"),
  portrait("alchemist_neve", "Alchemist Neve", "female", "regionalCast", 3, 2, "Potion-maker"),

  portrait("guild_clerk", "Guild Clerk", "male", "settlementCast", 0, 0, "Guild clerk"),
  portrait("stablemaster", "Stablemaster", "female", "settlementCast", 1, 0, "Stablemaster"),
  portrait("elven_healer", "Elven Healer", "male", "settlementCast", 2, 0, "Healer"),
  portrait("mine_forewoman", "Mine Forewoman", "female", "settlementCast", 3, 0, "Mine forewoman"),
  portrait("orc_blacksmith", "Orc Blacksmith", "male", "settlementCast", 0, 1, "Blacksmith"),
  portrait("orc_wilderness_scout", "Orc Wilderness Scout", "female", "settlementCast", 1, 1, "Scout"),
  portrait("dwarf_jewelcrafter", "Dwarf Jewelcrafter", "male", "settlementCast", 2, 1, "Jewelcrafter"),
  portrait("elf_enchanter", "Elf Enchanter", "female", "settlementCast", 3, 1, "Enchanter"),
  portrait("river_fisherman", "River Fisherman", "male", "settlementCast", 0, 2, "Fisherman"),
  portrait("field_archaeologist", "Field Archaeologist", "female", "settlementCast", 1, 2, "Archaeologist"),
  portrait("elf_diplomatic_envoy", "Elven Diplomatic Envoy", "male", "settlementCast", 2, 2, "Diplomat"),
  portrait("dwarf_rune_engineer", "Dwarf Rune Engineer", "female", "settlementCast", 3, 2, "Rune engineer"),

  portrait("noble_patron", "Noble Patron", "female", "questCast", 0, 0, "Patron"),
  portrait("escaped_prisoner", "Escaped Prisoner", "male", "questCast", 1, 0, "Witness"),
  portrait("shadowfen_guide", "Shadowfen Guide", "female", "questCast", 2, 0, "Guide"),
  portrait("caravan_factor", "Dwarf Caravan Factor", "male", "questCast", 3, 0, "Caravan factor"),
  portrait("orc_clan_champion", "Orc Clan Champion", "female", "questCast", 0, 1, "Clan champion"),
  portrait("orc_spirit_keeper", "Orc Spirit-Keeper", "male", "questCast", 1, 1, "Spirit-keeper"),
  portrait("village_elder", "Village Elder", "female", "questCast", 2, 1, "Village elder"),
  portrait("gravekeeper", "Gravekeeper", "male", "questCast", 3, 1, "Gravekeeper"),
  portrait("frostmarch_hermit", "Frostmarch Hermit", "male", "questCast", 0, 2, "Hermit"),
  portrait("dwarf_archive_keeper", "Dwarf Archive Keeper", "female", "questCast", 1, 2, "Archivist"),
  portrait("goblin_defector", "Goblin Defector", "female", "questCast", 2, 2, "Defector"),
  portrait("goblin_tinkerer", "Goblin Tinkerer", "male", "questCast", 3, 2, "Tinkerer"),

  portrait("lady_octavia_vane", "Lady Octavia Vane", "female", "hiddenPowers", 0, 0, "Iron Laurel patron"),
  portrait("marshal_roderic_thorne", "Marshal Roderic Thorne", "male", "hiddenPowers", 1, 0, "Iron Laurel commander"),
  portrait("selene_ashglass", "Selene Ashglass", "female", "hiddenPowers", 2, 0, "Occult scholar"),
  portrait("brother_caldus", "Brother Caldus", "male", "hiddenPowers", 3, 0, "Wardstone scribe"),
  portrait("varka_ember_tongue", "Varka Ember-Tongue", "female", "hiddenPowers", 0, 1, "Orc clan diplomat"),
  portrait("edrin_mosswake", "Edrin Mosswake", "male", "hiddenPowers", 1, 1, "Wardwarden spirit"),
  portrait("kesta_flintvein", "Kesta Flintvein", "female", "hiddenPowers", 2, 1, "Smuggler-informant"),
  portrait("scale_collector", "The Scale Collector", "male", "hiddenPowers", 3, 1, "Relic hunter"),
  portrait("sable_eye", "Sable-Eye", "female", "hiddenPowers", 0, 2, "Goblin seer"),
  portrait("ash_herald", "The Ash Herald", "male", "hiddenPowers", 1, 2, "Draconic emissary"),
  portrait("dreaming_wyrmling", "The Dreaming Wyrmling", "female", "hiddenPowers", 2, 2, "Wardbound dragon"),
  portrait("first_crown", "The First Crown", "male", "hiddenPowers", 3, 2, "Ancient crowned dragon"),
];

export const NPC_PORTRAITS: Record<string, NpcPortraitDefinition> = Object.fromEntries(entries.map((entry) => [entry.id, entry]));

const speakerAliases: Record<string, string> = {
  "Cassian Vane": "cassian_vane", "Registrar Mara Voss": "registrar_mara_voss", "Registrar Mara Venn": "registrar_mara_voss",
  "Keeper Dagna Flint": "keeper_dagna_flint", "Dagna Flint": "keeper_dagna_flint", "Surveyor Bruni Vale": "surveyor_bruni_vale",
  "Aldren Vale": "aldren_vale", "Mira Thorn": "mira_thorn", "Bellkeeper Ysra Venn": "bellkeeper_ysra_venn", "Warden Elowen": "warden_elowen",
  "Sister Maelin": "sister_maelin", "Ilyra of Silverbough": "ilyra_silverbough", "Master Veyr": "master_veyr", "Tomas Reed": "tomas_reed",
  "Master Halric Vale": "master_halric_vale", "Old Fenrick": "old_fenrick", "Nikkit Two-Knives": "nikkit_two_knives", "Borin Slate": "borin_slate",
  "Bellkeeper Osa": "bellkeeper_osa", "Ranger Sella North": "ranger_sella_north", "Iron Laurel Envoy": "iron_laurel_envoy", "Ghorak Ash-Ear": "ghorak_ash_ear",
  "Lady Octavia Vane": "lady_octavia_vane", "Marshal Roderic Thorne": "marshal_roderic_thorne", "Selene Ashglass": "selene_ashglass", "Brother Caldus": "brother_caldus",
  "Varka Ember-Tongue": "varka_ember_tongue", "Edrin Mosswake": "edrin_mosswake", "Kesta Flintvein": "kesta_flintvein", "The Scale Collector": "scale_collector",
  "Sable-Eye": "sable_eye", "The Ash Herald": "ash_herald", "The Dreaming Wyrmling": "dreaming_wyrmling", "The First Crown": "first_crown",
};

export function getNpcPortraitForSpeaker(speaker: string): NpcPortraitDefinition | undefined {
  const id = speakerAliases[speaker];
  return id ? NPC_PORTRAITS[id] : undefined;
}
