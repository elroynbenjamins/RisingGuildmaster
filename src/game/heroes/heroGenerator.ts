import { GAME_CONFIG } from "../../config/gameConfig";
import { CLASSES } from "../../data/classes/classes";
import { EQUIPMENT } from "../../data/equipment/equipment";
import { RACES } from "../../data/races/races";
import { TRAITS } from "../../data/traits/traits";
import { calculateHero } from "./heroCalculator";
import type { ClassId, EquipmentSlots, Hero, RaceId, TraitId } from "./types";
import type { RandomSource } from "../../utils/random";
import { generateWeightedPotential } from "../progression/potentialGenerator";
import { applyLevelAttributeGrowth } from "../progression/attributeGrowth";
import { BACKGROUNDS } from "../../data/backgrounds/backgrounds";
import type { BackgroundId } from "./types";

const NAMES = ["Aldric", "Brynn", "Caelan", "Dara", "Elowen", "Fenric", "Gwen", "Hale", "Ilyra", "Jorin", "Kael", "Lyra", "Mara", "Nym", "Orin", "Pyria"] as const;
const RACE_IDS = Object.keys(RACES) as RaceId[];
const CLASS_IDS = Object.keys(CLASSES) as ClassId[];
const TRAIT_IDS = Object.keys(TRAITS) as TraitId[];
const BACKGROUND_IDS = Object.keys(BACKGROUNDS) as BackgroundId[];
function weightedBackground(random: RandomSource): BackgroundId { const total = BACKGROUND_IDS.reduce((sum, id) => sum + BACKGROUNDS[id].generationWeight, 0); let roll = random.next() * total; for (const id of BACKGROUND_IDS) { roll -= BACKGROUNDS[id].generationWeight; if (roll < 0) return id; } return BACKGROUND_IDS[0]!; }

function startingEquipment(classId: ClassId): EquipmentSlots {
  const weapon = classId === "ranger" ? "hunting-bow" : classId === "mage" || classId === "cleric" ? "apprentice-staff" : "worn-sword";
  return { weapon, armor: "padded-armor", helmet: null, boots: null, accessory1: null, accessory2: null };
}

export interface HeroGenerationOptions { raceId?: RaceId; classId?: ClassId; backgroundId?: BackgroundId; age?: number; level?: number; potential?: number; traitCount?: number }

export function generateHero(random: RandomSource, options: HeroGenerationOptions = {}): Hero {
  const raceId = options.raceId ?? random.pick(RACE_IDS);
  const classId = options.classId ?? random.pick(CLASS_IDS);
  const potential = options.potential ?? generateWeightedPotential(random);
  const estimateVariance = random.int(8, 20);
  const gender = random.pick(["female", "male", "nonbinary"] as const);
  const traitCount = options.traitCount ?? random.int(1, 2);
  const traits = [...TRAIT_IDS].sort(() => random.next() - 0.5).slice(0, traitCount);
  const hero: Hero = {
    id: `hero-${random.int(100000, 999999)}-${random.int(100000, 999999)}`,
    name: random.pick(NAMES), age: options.age ?? random.int(18, 48), gender,
    portraitKey: `${raceId}-${classId}-${gender}`,
    raceId, classId, subclassId: null, learnedSkillIds: [], backgroundId: options.backgroundId ?? weightedBackground(random),
    baseAttributes: {
      strength: random.int(1, 20), dexterity: random.int(1, 20), constitution: random.int(1, 20),
      intelligence: random.int(1, 20), wisdom: random.int(1, 20), charisma: random.int(1, 20),
    },
    level: 1, xp: 0, potential,
    potentialEstimateMin: Math.max(GAME_CONFIG.potentialMin, potential - estimateVariance),
    potentialEstimateMax: Math.min(100, potential + estimateVariance),
    traitIds: traits, conditions: [], equipment: startingEquipment(classId), currentHP: 9999,
    history: { questsCompleted: 0, enemiesDefeated: 0, achievements: [], importantEvents: [] },
    recruitmentCost: random.int(300, 750), salary: random.int(30, 85),
    isAvailable: true,
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
