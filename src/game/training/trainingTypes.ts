export type TrainingProgramId = "sparring_drills" | "focused_practice" | "class_mastery" | "heroic_regimen";
export interface TrainingProgramDefinition { id: TrainingProgramId; name: string; description: string; durationDays: number; baseGoldCost: number; baseXp: number; trainingGroundLevel: number }
export interface TrainingSession { id: string; heroId: string; programId: TrainingProgramId; startDay: number; completionDay: number; goldCost: number; xpReward: number; growthReward?: number; levelCap?: number }
export interface TrainingGroundUpgrade { targetLevel: number; startDay: number; completionDay: number; goldCost: number }
export interface TrainingGroundState { level: number; sessions: TrainingSession[]; upgrade: TrainingGroundUpgrade | null; completedTrainingCount: number }
export const createTrainingGroundState = (): TrainingGroundState => ({ level: 1, sessions: [], upgrade: null, completedTrainingCount: 0 });
