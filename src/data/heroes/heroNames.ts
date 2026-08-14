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
};

export function generateHeroName(random: RandomSource, raceId: RaceId, gender: HeroGender): string {
  const pool = HERO_NAME_POOLS[raceId];
  return `${random.pick(pool.givenNames[gender])} ${random.pick(pool.familyNames)}`;
}
