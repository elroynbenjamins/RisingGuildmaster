export type RogueliteRewardNodeType = "elite" | "boss";
export interface RogueliteRunState {
  id: string;
  startedDay: number;
  eliteRewardAttempts: number;
  bossRewardAttempts: number;
  eliteRecipeAwarded: boolean;
  bossRecipeAwarded: boolean;
  recipeIdsUnlockedThisRun: string[];
}
export interface RogueliteRecipeDropResult { guildChanged: boolean; roll: number | null; droppedRecipeId: string | null; alreadyAwarded: boolean; poolExhausted: boolean }
