import type { RaceId } from "../../game/heroes/types";
import type { HeroGender } from "./heroPortraits";
import type { RandomSource } from "../../utils/random";

export interface RaceNamePool {
  givenNames: Record<HeroGender, readonly string[]>;
  familyNames: readonly string[];
}

/**
 * Playable hero names are separated by race culture and gender. Family names
 * are shared within a culture so gender never changes a hero's lineage.
 */
export const HERO_NAME_POOLS: Record<RaceId, RaceNamePool> = {
  human: {
    givenNames: {
      female: ["Adela", "Brynn", "Dara", "Elise", "Gwen", "Helena", "Isolde", "Mara", "Rowan", "Sabine", "Talia", "Ysabel", "Anora", "Beatrix", "Catrin", "Elowen", "Fiora", "Joanna", "Lenora", "Maude", "Rosalind", "Selene", "Vera", "Winifred"],
      male: ["Aldric", "Bram", "Cedric", "Dorian", "Edwin", "Fenric", "Gareth", "Jorin", "Lucan", "Owen", "Roderic", "Tristan", "Alaric", "Bertram", "Corwin", "Emrys", "Godric", "Hadrian", "Leofric", "Merrick", "Percival", "Stefan", "Ulric", "Wulfric"],
    },
    familyNames: ["Ashford", "Blackwell", "Briar", "Dunmere", "Fairwind", "Greyward", "Hawke", "Marrow", "Thorne", "Vale", "Bellmont", "Crowhurst", "Duskryn", "Fletcher", "Greenfield", "Harrow", "Kingsley", "Redbrook", "Wainwright", "Westmere"],
  },
  elf: {
    givenNames: {
      female: ["Aelira", "Caelynn", "Elaria", "Ilyra", "Laeriel", "Naivara", "Saelith", "Sylwen", "Thalia", "Vaeriel", "Yllara", "Zephyra", "Althaea", "Arianel", "Elenwe", "Feyrith", "Lethariel", "Miriel", "Nimriel", "Raelwen", "Syllia", "Tiriel", "Valanthe", "Xyrienne"],
      male: ["Aelar", "Caelion", "Erevan", "Faelar", "Ithilien", "Laucian", "Naeris", "Quarion", "Silvyr", "Theren", "Vaelis", "Zaelor", "Adran", "Alarion", "Celemir", "Daelis", "Elrohir", "Finarion", "Lorandir", "Mythanar", "Raethen", "Soriel", "Talaren", "Virel"],
    },
    familyNames: ["Amastacia", "Dawnwhisper", "Evenwood", "Faelight", "Moonbrook", "Nightbough", "Silverleaf", "Starweaver", "Thornsong", "Windrunner", "Autumnveil", "Brightspear", "Duskwander", "Eversong", "Greenmantle", "Mistglen", "Moonshadow", "Sunbranch", "Willowmere", "Winterglass"],
  },
  dwarf: {
    givenNames: {
      female: ["Astrid", "Brynja", "Dagna", "Eydis", "Frida", "Gudrun", "Hilda", "Ingrid", "Ragna", "Sigrid", "Thyra", "Yrsa", "Alfhild", "Bera", "Dagny", "Embla", "Gerta", "Hedda", "Katla", "Magda", "Nanna", "Revna", "Solveig", "Torhild"],
      male: ["Baern", "Brom", "Dain", "Eberk", "Fargrim", "Gimli", "Harbek", "Kildrak", "Orsik", "Rurik", "Thrain", "Vondal", "Alberich", "Brokk", "Dolgrin", "Flint", "Garm", "Kazrik", "Morgran", "Norri", "Storn", "Torbek", "Ulfgar", "Yngvar"],
    },
    familyNames: ["Amberforge", "Anvilborn", "Deepdelver", "Flintmantle", "Goldvein", "Hammerfall", "Ironbraid", "Runeshield", "Stonegate", "Trueanvil", "Bronzebeard", "Coalbrow", "Copperkeg", "Embermantle", "Forgeheart", "Granitehand", "Oathhammer", "Steelbender", "Stonefoot", "Underpeak"],
  },
  orc: {
    givenNames: {
      female: ["Azhra", "Baggi", "Draka", "Ghorza", "Kansif", "Mazoga", "Nagra", "Rokka", "Sharga", "Urzula", "Varka", "Yagra", "Agra", "Borba", "Dura", "Garona", "Kharza", "Mogra", "Oghra", "Rukha", "Sharog", "Ugak", "Varsha", "Zogara"],
      male: ["Argran", "Borgakh", "Drog", "Ghorak", "Karg", "Mugruk", "Nargol", "Rogar", "Shamob", "Thokk", "Urzog", "Vargan", "Baghru", "Drakka", "Garrosh", "Krothu", "Malkor", "Orgul", "Rukgar", "Shagra", "Torg", "Ugor", "Vrosh", "Zugor"],
    },
    familyNames: ["Ash-Tusk", "Blackscar", "Bloodaxe", "Ember-Eye", "Grimjaw", "Ironhide", "Redfang", "Skullcleaver", "Stonefist", "Wolf-Breaker", "Bonegrinder", "Doomhammer", "Fireblood", "Frostfang", "Gravelung", "Ironmaw", "Rageborn", "Storm-Tusk", "Thunderfist", "Warsong"],
  },
  tiefling: {
    givenNames: {
      female: ["Akta", "Bryseis", "Criella", "Damaia", "Ea", "Kallista", "Lerissa", "Makaria", "Nemeia", "Orianna", "Phelaia", "Rieta", "Sedra", "Vespera", "Zamira", "Ashka", "Calista", "Euphemia", "Lilith", "Nerissa", "Perseph", "Sable", "Valindra", "Zethaya"],
      male: ["Akmenos", "Amnon", "Barakas", "Damakos", "Ekemon", "Iados", "Kairon", "Leucis", "Melech", "Mordai", "Morthos", "Pelaios", "Skamos", "Therai", "Zevon", "Azriel", "Cassian", "Dravos", "Kael", "Malach", "Nethros", "Raziel", "Varek", "Xarith"],
    },
    familyNames: ["Ashborn", "Brightflame", "Cinderheart", "Duskveil", "Emberwake", "Fellstar", "Gloamward", "Hellward", "Nightglass", "Oathflame", "Redspire", "Sablehorn", "Shadowbrand", "Starfall", "Thornfire", "Vex", "Voidmark", "Wyrd", "Zeal", "Dawnscar"],
  },
  stoneborn: {
    givenNames: {
      female: ["Avara", "Basra", "Dolma", "Edrin", "Ghala", "Korra", "Marn", "Orra", "Petra", "Runa", "Tavra", "Veyra", "Alma", "Brinna", "Cindra", "Dorra", "Garnet", "Helra", "Kelda", "Mora", "Narra", "Sorra", "Ursa", "Zedra"],
      male: ["Ardan", "Basalt", "Dorr", "Garran", "Keld", "Marnok", "Orun", "Rokan", "Torr", "Urdan", "Varr", "Zorun", "Bramm", "Cairn", "Dagan", "Flint", "Gorram", "Harkan", "Korr", "Noran", "Slate", "Thar", "Uld", "Zarn"],
    },
    familyNames: ["Cairn-Born", "Deepmark", "Granite-Soul", "Greycrag", "Hearthstone", "Obsidian-Vow", "Runecliff", "Slatehand", "Stonewake", "Underroot", "Basalt-Brow", "Bellkeeper", "Cragheart", "Flint-Echo", "Ironmemory", "Quartz-Eye", "Riftstone", "Shardmantle", "Vault-Woken", "Worldroot"],
  },
  veilborn: {
    givenNames: {
      female: ["Aestra", "Cyrene", "Elira", "Ione", "Letha", "Mirael", "Nyssa", "Oria", "Selyne", "Thessa", "Vaela", "Ysil", "Aelune", "Ceris", "Eirra", "Ilune", "Lys", "Naera", "Olyss", "Rielle", "Syra", "Tirenne", "Vesper", "Zaira"],
      male: ["Aevren", "Caelis", "Eryx", "Ithran", "Lorien", "Myrel", "Noxen", "Orris", "Saev", "Theron", "Vael", "Zyren", "Aster", "Cyran", "Elyon", "Iovar", "Leth", "Naev", "Oryn", "Rhaes", "Soren", "Tavian", "Veyl", "Zeph"],
    },
    familyNames: ["Between-Stars", "Duskmirror", "Echo-Veil", "Gloamstep", "Mistbound", "Moon-Scar", "Quiet-Reed", "Riftwatch", "Twilight-Glass", "Whisperwake", "Ashen-Moon", "Dreamward", "Eventide", "Far-Echo", "Lantern-Veil", "Night-Tide", "Pale-Comet", "Softstep", "Starless", "Threshold"],
  },
};

export function generateHeroName(random: RandomSource, raceId: RaceId, gender: HeroGender): string {
  const pool = HERO_NAME_POOLS[raceId];
  return `${random.pick(pool.givenNames[gender])} ${random.pick(pool.familyNames)}`;
}
