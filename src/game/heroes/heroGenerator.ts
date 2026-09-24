import { CLASSES } from "../../data/classes/classes";

import { RACES } from "../../data/races/races";

import { calculateHero } from "./heroCalculator";
import type { ClassId, EquipmentSlots, Hero, RaceId } from "./types";
import type { RandomSource } from "../../utils/random";
import { applyLevelAttributeGrowth } from "../progression/attributeGrowth";
import { BACKGROUNDS } from "../../data/backgrounds/backgrounds";
import type { BackgroundId } from "./types";
import { generateHeroName } from "../../data/heroes/heroNames";
import type { HeroGender } from "../../data/heroes/heroPortraits";
import { createHeroHistory } from "./heroHistoryService";
import { generateDndAttributes } from "../attributes/dndAttributes";
import { generateWeightedTraits } from "../traits/traitGenerationService";
import { generateSkillProficiencies } from "../proficiencies/proficiencyService";
import { generateRoleplayProfile } from "../../data/heroes/heroRoleplay";

const RACE_IDS = Object.keys(RACES) as RaceId[];
const CLASS_IDS = Object.keys(CLASSES) as ClassId[];
const BACKGROUND_IDS = Object.keys(BACKGROUNDS) as BackgroundId[];
function weightedBackground(random: RandomSource): BackgroundId { const total = BACKGROUND_IDS.reduce((sum, id) => sum + BACKGROUNDS[id].generationWeight, 0); let roll = random.next() * total; for (const id of BACKGROUND_IDS) { roll -= BACKGROUNDS[id].generationWeight; if (roll < 0) return id; } return BACKGROUND_IDS[0]!; }

function startingEquipment(classId: ClassId): EquipmentSlots {
  const weapon = classId === "ranger" ? "hunting-bow" : classId === "spellbow" ? "runewood-shortbow" : classId === "summoner" ? "binding-rod" : classId === "mage" ? "apprentice-staff" : classId === "cleric" ? "pilgrim-rod" : classId === "monk" ? "novice-quarterstaff" : classId === "bard" ? "practice-rapier" : classId === "bulwark" ? "watch-shield" : "worn-sword";
  const armor = classId === "mage" ? "quilted-travel-coat" : classId === "summoner" ? "conjurers-robe" : classId === "spellbow" ? "spellthread-coat" : classId === "monk" ? "disciple-wraps" : classId === "bard" ? "minstrel-coat" : classId === "bulwark" ? "recruit-bulwark-mail" : "padded-armor";
  return { weapon, armor, helmet: null, boots: null, accessory1: null, accessory2: null };
}

export interface HeroGenerationOptions { raceId?: RaceId; classId?: ClassId; gender?: HeroGender; backgroundId?: BackgroundId; age?: number; level?: number; traitCount?: number }

export function generateHero(random: RandomSource, options: HeroGenerationOptions = {}): Hero {
  const raceId = options.raceId ?? random.pick(RACE_IDS);
  const classId = options.classId ?? random.pick(CLASS_IDS);
  const gender = options.gender ?? random.pick(["female", "male"] as const);
  const portraitVariant = random.int(1, 4) as 1 | 2 | 3 | 4;
  const traitCount = options.traitCount ?? random.int(1, 2);
  const traits = generateWeightedTraits(random, traitCount);
  const backgroundId = options.backgroundId ?? weightedBackground(random);
  const hero: Hero = {
    id: `hero-${random.int(100000, 999999)}-${random.int(100000, 999999)}`,
    name: generateHeroName(random, raceId, gender), age: options.age ?? random.int(18, 48), gender,
    portraitVariant,
    portraitKey: `${raceId}-${classId}-${gender}-v${portraitVariant}`,
    raceId, classId, subclassId: null, masteryId: null, learnedSkillIds: [], skillProficiencyIds: generateSkillProficiencies(classId, backgroundId), skillExpertiseIds: [], backgroundId, roleplayProfile: generateRoleplayProfile(random, backgroundId),
    baseAttributes: generateDndAttributes(random, CLASSES[classId].attributePriorities),
    level: 1, xp: 0,
    traitIds: traits, conditions: [], equipment: startingEquipment(classId), currentHP: 9999,
    history: createHeroHistory(),
    recruitmentCost: random.int(300, 750), salary: random.int(30, 85),
    isAvailable: true,
    adventureStamina: 100,
    attributeGrowthProgress: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
  };
  let progressed = hero; const targetLevel = options.level ?? 1;
  while (progressed.level < targetLevel) progressed = applyLevelAttributeGrowth({ ...progressed, level: progressed.level + 1 });
  return { ...progressed, currentHP: calculateHero(progressed).stats.maxHP };
}

export function generateCandidates(random: RandomSource, count = GAME_CONFIG.recruitmentCandidateCount): Hero[] {
  const ids = new Set<string>();
  const heroes: Hero[] = [];
  while (heroes.length < count) {
    const hero = generateHero(random);
    if (!ids.has(hero.id)) { ids.add(hero.id); heroes.push(hero); }
  }
  return heroes;
}
