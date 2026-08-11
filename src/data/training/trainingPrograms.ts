import type { TrainingProgramDefinition, TrainingProgramId } from "../../game/training/trainingTypes";

export const TRAINING_PROGRAMS: Record<TrainingProgramId, TrainingProgramDefinition> = {
  sparring_drills: { id: "sparring_drills", name: "Sparring Drills", description: "A one-day fundamentals course. Reliable XP with no permanent attribute focus.", durationDays: 1, baseGoldCost: 80, baseXp: 65, classWeightedGrowth: 0, trainingGroundLevel: 1 },
  focused_practice: { id: "focused_practice", name: "Focused Practice", description: "Choose one primary attribute and work it through repeated D20-style exercises.", durationDays: 2, baseGoldCost: 160, baseXp: 90, classWeightedGrowth: .45, trainingGroundLevel: 1 },
  class_mastery: { id: "class_mastery", name: "Class Mastery", description: "Instructors follow the hero's class growth weights, building several attributes over three days.", durationDays: 3, baseGoldCost: 280, baseXp: 150, classWeightedGrowth: .85, trainingGroundLevel: 2 },
  heroic_regimen: { id: "heroic_regimen", name: "Heroic Regimen", description: "A demanding master course with substantial XP and class-weighted development.", durationDays: 4, baseGoldCost: 520, baseXp: 260, classWeightedGrowth: 1.35, trainingGroundLevel: 3 },
};
