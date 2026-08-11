import type { RaceId } from "../../game/heroes/types";

export interface RaceHomelandDefinition {
  raceId: RaceId;
  regionId: "greenveil" | "iron_hills" | "frostmarch" | "ashlands";
  locationName: string;
  peopleName: string;
  scoutApproach: string;
  description: string;
  wardstoneLegacy: string;
  loreUnlockFlag: string;
}

/**
 * Cultural homelands are recruitment destinations, not racial restrictions.
 * Eldoria's peoples also live throughout the continent and in mixed settlements.
 */
export const RACE_HOMELANDS: Record<RaceId, RaceHomelandDefinition> = {
  human: {
    raceId: "human",
    regionId: "greenveil",
    locationName: "The Crownroad Freeholds",
    peopleName: "Freeholders",
    scoutApproach: "Visit tourney fields, caravan companies, temple schools, and the smaller guild halls overshadowed by the Iron Laurel.",
    description: "The river valleys around Guildhaven hold dozens of self-governing towns linked by the Crownroad. Humans form the largest population, but the Freeholds are proudly mixed and judge newcomers more by sworn company than ancestry. Their restless squires, hedge-mages, caravan guards, and disappointed guild apprentices produce versatile recruits.",
    wardstoneLegacy: "Greenveil's Wardstone made open roads possible. As it weakens, local militias are stretched thin and more young Freeholders seek the protection and purpose of a guild banner.",
    loreUnlockFlag: "lore_crownroad_freeholds",
  },
  elf: {
    raceId: "elf",
    regionId: "frostmarch",
    locationName: "The Silverbough Enclaves",
    peopleName: "Silverbough Kin",
    scoutApproach: "Ask permission at moon-gates, exchange news with winter rangers, and attend the quiet oath-markets held beneath aurora-lit pines.",
    description: "Long ago the northern elves withdrew into evergreen valleys warmed by luminous root-stones beneath Frostmarch's ice. Their enclaves are not a single kingdom but a covenant of ranger lodges, spell choirs, memory keepers, and wandering houses. They value patience and exact promises; a scout who boasts will return empty-handed.",
    wardstoneLegacy: "The northern Wardstone once calmed the killing winters and guided migrating beasts away from the valleys. Its failing pulse has driven monsters through elven hunting grounds, forcing the Enclaves to seek allies beyond their old borders.",
    loreUnlockFlag: "lore_silverbough_enclaves",
  },
  dwarf: {
    raceId: "dwarf",
    regionId: "iron_hills",
    locationName: "Kharum-Deep and the Seven Holds",
    peopleName: "Holdfolk",
    scoutApproach: "Carry a witnessed contract through Stonegate, speak with clan factors, and sponsor trials in the shield halls and forge colleges.",
    description: "Beneath the Iron Hills lies a chain of ancient holds joined by lift-shafts, rune rails, and guarded underways. Dwarven society is organized around craft colleges and oath-clans rather than one throne. Surface-born dwarves and adopted outsiders are common in Stonegate, while the deep halls prize proven workmanship, endurance, and debts honestly recorded.",
    wardstoneLegacy: "The central Wardstone sealed older caverns where warped ore and deep creatures sleep. Cracks in its wards have closed trade tunnels and displaced entire oath-clans, sending veteran defenders and ambitious apprentices toward surface guilds.",
    loreUnlockFlag: "lore_kharum_deep",
  },
  orc: {
    raceId: "orc",
    regionId: "ashlands",
    locationName: "The Red Mesa Clanroads",
    peopleName: "Clanroad Orcs",
    scoutApproach: "Enter under a peace-knot, offer a public challenge or useful service, and negotiate with hearth-speakers after the clan moot.",
    description: "The Ashlands' orc clans travel between basalt mesas, fortress-oases, and ancestral forges that drink volcanic heat. They are divided by oath, livelihood, and politics—not by a single war-chief. Raiders seen in the Iron Hills belong to displaced or ambitious warbands; many Clanroad hunters, wardens, spirit-speakers, and smith-warriors oppose them.",
    wardstoneLegacy: "The eastern Wardstone once drew poisonous magic out of the soil. Its failure has ruined wells and ignited old blood-feuds over safe ground, while signs suggest someone is deliberately directing desperate warbands westward.",
    loreUnlockFlag: "lore_red_mesa_clanroads",
  },
};
