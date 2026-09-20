import type { TrainingProgramDefinition, TrainingProgramId } from "../../game/training/trainingTypes";

export const TRAINING_PROGRAMS: Record<TrainingProgramId, TrainingProgramDefinition> = {
  sparring_drills: { id: "sparring_drills", name: "Sparring Drills", description: "A short catch-up course that grants XP but never attributes.", durationDays: 1, baseGoldCost: 80, baseXp: 65, trainingGroundLevel: 1 },
  focused_practice: { id: "focused_practice", name: "Adventuring Fundamentals", description: "A two-day XP course for inexperienced recruits returning to field readiness.", durationDays: 2, baseGoldCost: 160, baseXp: 100, trainingGroundLevel: 1 },
  class_mastery: { id: "class_mastery", name: "Class Instruction", description: "Veteran tutors grant catch-up XP without increasing attributes.", durationDays: 3, baseGoldCost: 280, baseXp: 175, trainingGroundLevel: 2 },
  heroic_regimen: { id: "heroic_regimen", name: "Heroic Curriculum", description: "The hall's strongest catch-up course. It grants levels through XP only.", durationDays: 4, baseGoldCost: 520, baseXp: 300, trainingGroundLevel: 3 },
};
